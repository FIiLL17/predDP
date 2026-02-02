<?php
// /api/user/favorites.php - ОБНОВЛЕННЫЙ

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

require_once __DIR__ . '/../config/database.php';

// Получаем токен из заголовка ИЛИ из query parameter
$token = null;

// 1. Проверяем заголовок Authorization
$headers = getallheaders();
if (isset($headers['Authorization'])) {
    $authHeader = $headers['Authorization'];
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
    }
}

// 2. Если нет в заголовке, проверяем query parameter
if (!$token && isset($_GET['token'])) {
    $token = $_GET['token'];
}

// 3. Если все еще нет токена, проверяем POST данные для методов POST/DELETE
if (!$token && ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'DELETE')) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (isset($input['token'])) {
        $token = $input['token'];
    }
}

if (!$token) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Токен не предоставлен'
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception('Ошибка подключения к БД');
    }
    
    // Ищем пользователя по токену
    $userQuery = "SELECT id FROM users WHERE token = :token";
    $userStmt = $db->prepare($userQuery);
    $userStmt->bindParam(':token', $token);
    $userStmt->execute();
    
    if ($userStmt->rowCount() === 0) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Пользователь не найден'
        ]);
        exit;
    }
    
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);
    $user_id = $user['id'];
    
    // Проверяем существование таблицы favorites
    $checkTable = $db->query("SHOW TABLES LIKE 'favorites'")->fetch();
    
    if (!$checkTable) {
        // Создаем таблицу если её нет
        $createTable = "
        CREATE TABLE IF NOT EXISTS favorites (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            product_title VARCHAR(255) NOT NULL,
            product_price DECIMAL(10,2) NOT NULL,
            product_image VARCHAR(500),
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_favorite (user_id, product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ";
        
        $db->exec($createTable);
    }
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        // Получение избранного
        $favoritesQuery = "SELECT * FROM favorites WHERE user_id = :user_id ORDER BY added_at DESC";
        $favoritesStmt = $db->prepare($favoritesQuery);
        $favoritesStmt->bindParam(':user_id', $user_id);
        $favoritesStmt->execute();
        
        $favorites = $favoritesStmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'favorites' => $favorites,
            'count' => count($favorites),
            'message' => 'Избранное загружено'
        ]);
        
    } elseif ($method === 'POST') {
        // Добавление в избранное
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['product_id']) || !isset($data['product_title']) || !isset($data['product_price'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Недостаточно данных'
            ]);
            exit;
        }
        
        // Проверяем, есть ли уже в избранном
        $checkQuery = "SELECT id FROM favorites WHERE user_id = :user_id AND product_id = :product_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':user_id', $user_id);
        $checkStmt->bindParam(':product_id', $data['product_id']);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Уже в избранном'
            ]);
            exit;
        }
        
        // Добавляем в избранное
        $insertQuery = "
        INSERT INTO favorites (user_id, product_id, product_title, product_price, product_image, added_at) 
        VALUES (:user_id, :product_id, :product_title, :product_price, :product_image, NOW())
        ";
        
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->bindParam(':user_id', $user_id);
        $insertStmt->bindParam(':product_id', $data['product_id']);
        $insertStmt->bindParam(':product_title', $data['product_title']);
        $insertStmt->bindParam(':product_price', $data['product_price']);
        $insertStmt->bindParam(':product_image', $data['product_image']);
        
        if ($insertStmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Добавлено в избранное'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Ошибка добавления в избранное'
            ]);
        }
        
    } elseif ($method === 'DELETE') {
        // Удаление из избранного
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['product_id'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Не указан product_id'
            ]);
            exit;
        }
        
        // Для очистки всех избранных
        if (isset($data['clear_all']) && $data['clear_all'] === true) {
            $deleteAllQuery = "DELETE FROM favorites WHERE user_id = :user_id";
            $deleteAllStmt = $db->prepare($deleteAllQuery);
            $deleteAllStmt->bindParam(':user_id', $user_id);
            
            if ($deleteAllStmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Все товары удалены из избранного'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Ошибка удаления избранного'
                ]);
            }
            exit;
        }
        
        $deleteQuery = "DELETE FROM favorites WHERE user_id = :user_id AND product_id = :product_id";
        $deleteStmt = $db->prepare($deleteQuery);
        $deleteStmt->bindParam(':user_id', $user_id);
        $deleteStmt->bindParam(':product_id', $data['product_id']);
        
        if ($deleteStmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Удалено из избранного'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Ошибка удаления из избранного'
            ]);
        }
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка сервера: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
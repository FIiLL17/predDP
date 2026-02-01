<?php
// /api/user/cart.php - ИСПРАВЛЕННЫЙ ДЛЯ УДАЛЕНИЯ

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

require_once __DIR__ . '/../config/database.php';

function verifyToken() {
    $headers = getallheaders();
    $token = null;

    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }
    
    if (!$token) {
        return null;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    $query = "SELECT id FROM users WHERE token = :token";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $token);
    $stmt->execute();
    
    if ($stmt->rowCount() === 1) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user;
    }
    
    return null;
}

$user = verifyToken();

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Не авторизован']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Получение корзины
    $query = "SELECT * FROM cart WHERE user_id = :user_id ORDER BY added_at DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();
    
    $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'cart' => $cartItems]);
    
} elseif ($method === 'POST') {
    // Добавление в корзину
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Проверяем, есть ли уже в корзине
    $checkQuery = "SELECT id, quantity FROM cart WHERE user_id = :user_id AND product_id = :product_id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':user_id', $user['id']);
    $checkStmt->bindParam(':product_id', $data['product_id']);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        // Увеличиваем количество
        $item = $checkStmt->fetch(PDO::FETCH_ASSOC);
        $updateQuery = "UPDATE cart SET quantity = quantity + 1 WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':id', $item['id']);
        $updateStmt->execute();
        
        echo json_encode(['success' => true, 'message' => 'Количество увеличено']);
    } else {
        // Добавляем новый товар
        $insertQuery = "INSERT INTO cart 
                       (user_id, product_id, product_title, product_price, product_image)
                       VALUES 
                       (:user_id, :product_id, :product_title, :product_price, :product_image)";
        
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->bindParam(':user_id', $user['id']);
        $insertStmt->bindParam(':product_id', $data['product_id']);
        $insertStmt->bindParam(':product_title', $data['product_title']);
        $insertStmt->bindParam(':product_price', $data['product_price']);
        $insertStmt->bindParam(':product_image', $data['product_image']);
        
        if ($insertStmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Добавлено в корзину']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Ошибка добавления в корзину']);
        }
    }
    
} elseif ($method === 'DELETE') {
    // Удаление из корзины
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['product_id'])) {
        echo json_encode(['success' => false, 'message' => 'Не указан product_id']);
        exit;
    }
    
    // Сначала проверяем количество
    $checkQuery = "SELECT quantity FROM cart WHERE user_id = :user_id AND product_id = :product_id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':user_id', $user['id']);
    $checkStmt->bindParam(':product_id', $data['product_id']);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'Товар не найден в корзине']);
        exit;
    }
    
    $item = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($item['quantity'] > 1) {
        // Уменьшаем количество
        $updateQuery = "UPDATE cart SET quantity = quantity - 1 WHERE user_id = :user_id AND product_id = :product_id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':user_id', $user['id']);
        $updateStmt->bindParam(':product_id', $data['product_id']);
        
        if ($updateStmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Количество уменьшено']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Ошибка обновления количества']);
        }
    } else {
        // Удаляем товар полностью
        $deleteQuery = "DELETE FROM cart WHERE user_id = :user_id AND product_id = :product_id";
        $deleteStmt = $db->prepare($deleteQuery);
        $deleteStmt->bindParam(':user_id', $user['id']);
        $deleteStmt->bindParam(':product_id', $data['product_id']);
        
        if ($deleteStmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Удалено из корзины']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Ошибка удаления из корзины']);
        }
    }
}
?>
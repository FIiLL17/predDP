<?php
// /api/user/profile.php - ИСПРАВЛЕННЫЙ ВАРИАНТ

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

require_once __DIR__ . '/../config/database.php';

// Получаем токен из заголовка
$headers = getallheaders();
$token = null;

if (isset($headers['Authorization'])) {
    $authHeader = $headers['Authorization'];
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
    }
}

// Если нет заголовка, проверяем POST/GET
if (!$token && isset($_GET['token'])) {
    $token = $_GET['token'];
}

if (!$token) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Токен не предоставлен',
        'headers_received' => $headers
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception('Ошибка подключения к БД');
    }
    
    // Ищем пользователя по токену (как в auth-fixed.js)
    $query = "SELECT id, username, email, created_at FROM users WHERE token = :token";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $token);
    $stmt->execute();
    
    if ($stmt->rowCount() === 1) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Дополнительная информация о пользователе
        $response = [
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'created_at' => $user['created_at'],
                'bonus_points' => 1540,
                'discount_percent' => 5
            ],
            'message' => 'Профиль загружен'
        ];
        
        echo json_encode($response);
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Пользователь не найден или токен недействителен'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка сервера: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
<?php
// /api/user/cart_count.php
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

if (!$token) {
    echo json_encode(['success' => false, 'message' => 'Токен не предоставлен', 'count' => 0]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Ищем пользователя по токену
    $userQuery = "SELECT id FROM users WHERE token = :token";
    $userStmt = $db->prepare($userQuery);
    $userStmt->bindParam(':token', $token);
    $userStmt->execute();
    
    if ($userStmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'Пользователь не найден', 'count' => 0]);
        exit;
    }
    
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);
    $user_id = $user['id'];
    
    // Проверяем существование таблицы cart
    $checkTable = $db->query("SHOW TABLES LIKE 'cart'")->fetch();
    
    if (!$checkTable) {
        echo json_encode(['success' => true, 'count' => 0, 'message' => 'Таблица cart не найдена']);
        exit;
    }
    
    // Получаем количество товаров в корзине
    $countQuery = "SELECT COUNT(*) as count FROM cart WHERE user_id = :user_id";
    $countStmt = $db->prepare($countQuery);
    $countStmt->bindParam(':user_id', $user_id);
    $countStmt->execute();
    
    $result = $countStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'count' => (int)$result['count']]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Ошибка сервера: ' . $e->getMessage(), 'count' => 0]);
}
?>
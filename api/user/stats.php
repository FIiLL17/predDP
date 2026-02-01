<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/../../config/database.php';

function verifyToken() {
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
    
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

// Получение статистики пользователя
$stats = [];

// Количество заказов
$ordersQuery = "SELECT COUNT(*) as count FROM orders WHERE user_id = :user_id";
$ordersStmt = $db->prepare($ordersQuery);
$ordersStmt->bindParam(':user_id', $user['id']);
$ordersStmt->execute();
$ordersResult = $ordersStmt->fetch(PDO::FETCH_ASSOC);
$stats['orders_count'] = $ordersResult['count'];

// Количество избранного
$favoritesQuery = "SELECT COUNT(*) as count FROM favorites WHERE user_id = :user_id";
$favoritesStmt = $db->prepare($favoritesQuery);
$favoritesStmt->bindParam(':user_id', $user['id']);
$favoritesStmt->execute();
$favoritesResult = $favoritesStmt->fetch(PDO::FETCH_ASSOC);
$stats['favorites_count'] = $favoritesResult['count'];

// Сумма всех заказов
$totalQuery = "SELECT SUM(total_amount) as total FROM orders WHERE user_id = :user_id AND status = 'completed'";
$totalStmt = $db->prepare($totalQuery);
$totalStmt->bindParam(':user_id', $user['id']);
$totalStmt->execute();
$totalResult = $totalStmt->fetch(PDO::FETCH_ASSOC);
$stats['total_spent'] = $totalResult['total'] ? round($totalResult['total'], 2) : 0;

// Последний заказ
$lastOrderQuery = "SELECT order_number, created_at, total_amount FROM orders 
                   WHERE user_id = :user_id 
                   ORDER BY created_at DESC 
                   LIMIT 1";
$lastOrderStmt = $db->prepare($lastOrderQuery);
$lastOrderStmt->bindParam(':user_id', $user['id']);
$lastOrderStmt->execute();
$lastOrderResult = $lastOrderStmt->fetch(PDO::FETCH_ASSOC);
$stats['last_order'] = $lastOrderResult;

echo json_encode(['success' => true, 'stats' => $stats]);
?>
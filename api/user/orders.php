<?php
// /api/user/orders.php - ИСПРАВЛЕННЫЙ ВАРИАНТ

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
    
    // Проверяем существование таблицы orders
    $checkTable = $db->query("SHOW TABLES LIKE 'orders'")->fetch();
    
    if (!$checkTable) {
        // Таблица не существует, возвращаем тестовые данные
        $testOrders = [
            [
                'id' => 4825,
                'order_number' => 'NEON-4825',
                'created_at' => '2023-10-12 14:30:00',
                'total_amount' => 24990.00,
                'status' => 'completed',
                'items' => [
                    ['product_title' => 'Неоновые наушники', 'quantity' => 1, 'price' => 12990.00],
                    ['product_title' => 'Светящаяся футболка', 'quantity' => 2, 'price' => 6000.00]
                ]
            ],
            [
                'id' => 4791,
                'order_number' => 'NEON-4791',
                'created_at' => '2023-10-05 11:15:00',
                'total_amount' => 15750.00,
                'status' => 'processing',
                'items' => [
                    ['product_title' => 'Геймерская клавиатура', 'quantity' => 1, 'price' => 8490.00],
                    ['product_title' => 'Игровая мышь', 'quantity' => 1, 'price' => 5750.00]
                ]
            ]
        ];
        
        echo json_encode([
            'success' => true,
            'orders' => $testOrders,
            'message' => 'Используются тестовые данные (таблица orders не найдена)'
        ]);
        exit;
    }
    
    // Получаем заказы пользователя
    $ordersQuery = "SELECT * FROM orders WHERE user_id = :user_id ORDER BY created_at DESC";
    $ordersStmt = $db->prepare($ordersQuery);
    $ordersStmt->bindParam(':user_id', $user_id);
    $ordersStmt->execute();
    
    $orders = $ordersStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Получаем товары для каждого заказа
    foreach ($orders as &$order) {
        $itemsQuery = "SELECT * FROM order_items WHERE order_id = :order_id";
        $itemsStmt = $db->prepare($itemsQuery);
        $itemsStmt->bindParam(':order_id', $order['id']);
        $itemsStmt->execute();
        $order['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode([
        'success' => true,
        'orders' => $orders,
        'message' => 'Заказы загружены'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка сервера: ' . $e->getMessage()
    ]);
}
?>
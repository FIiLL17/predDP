<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$pdo = $database->getConnection();

if (!$pdo) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка подключения к БД']);
    exit;
}

function authenticate() {
    global $pdo;
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Требуется авторизация']);
        exit;
    }
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $stmt = $pdo->prepare("SELECT id FROM users WHERE token = ?");
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Недействительный токен']);
        exit;
    }
    return $user['id'];
}

$method = $_SERVER['REQUEST_METHOD'];

// ==================== GET: список заказов ====================
if ($method === 'GET') {
    try {
        $userId = authenticate();
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'orders' => $orders]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// ==================== POST: создание заказа ====================
if ($method === 'POST') {
    try {
        $userId = authenticate();
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            throw new Exception('Некорректные данные');
        }

        // Получаем корзину
        $stmt = $pdo->prepare("SELECT * FROM cart WHERE user_id = ?");
        $stmt->execute([$userId]);
        $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (empty($cartItems)) {
            throw new Exception('Корзина пуста');
        }

        $totalAmount = 0;
        foreach ($cartItems as $item) {
            $totalAmount += $item['product_price'] * $item['quantity'];
        }

        // Адрес доставки
        $addressId = $input['address_id'] ?? null;
        $shippingAddress = '';
        if ($addressId) {
            $stmt = $pdo->prepare("SELECT * FROM user_delivery_addresses WHERE id = ? AND user_id = ?");
            $stmt->execute([$addressId, $userId]);
            $address = $stmt->fetch();
            if ($address) {
                $shippingAddress = $address['city'] . ', ' . $address['street'] . ', д.' . $address['house'];
            }
        } elseif (isset($input['address'])) {
            $addr = $input['address'];
            $shippingAddress = $addr['city'] . ', ' . $addr['street'] . ', д.' . $addr['house'];
        } else {
            throw new Exception('Адрес не указан');
        }

        $pdo->beginTransaction();

        $orderNumber = 'NEON-' . rand(1000, 9999);
        $stmt = $pdo->prepare("
            INSERT INTO orders (order_number, user_id, total_amount, status, payment_method, shipping_address, notes, created_at)
            VALUES (?, ?, ?, 'pending', ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $orderNumber,
            $userId,
            $totalAmount,
            $input['payment_method'],
            $shippingAddress,
            $input['notes'] ?? ''
        ]);
        $orderId = $pdo->lastInsertId();

        $stmtItem = $pdo->prepare("
            INSERT INTO order_items (order_id, product_id, product_title, product_price, quantity, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        foreach ($cartItems as $item) {
            $subtotal = $item['product_price'] * $item['quantity'];
            $stmtItem->execute([
                $orderId,
                $item['product_id'],
                $item['product_title'],
                $item['product_price'],
                $item['quantity'],
                $subtotal
            ]);
        }

        $pdo->prepare("DELETE FROM cart WHERE user_id = ?")->execute([$userId]);

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'order_number' => $orderNumber,
            'order_id' => $orderId
        ]);

    } catch (Exception $e) {
        if (isset($pdo) && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// Если другой метод
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Метод не разрешён']);
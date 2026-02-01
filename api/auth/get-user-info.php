<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

// Получаем токен
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Токен не предоставлен']);
    exit();
}

$token = $matches[1];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Получаем полную информацию о пользователе
    $query = "
        SELECT 
            u.id, 
            u.username, 
            u.email, 
            u.role,
            u.created_at,
            up.first_name,
            up.last_name,
            up.phone,
            up.bonus_points,
            up.discount_percent,
            up.city,
            up.address
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.token = :token AND u.is_active = 1
    ";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $token);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Пользователь не найден']);
        exit();
    }
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка сервера: ' . $e->getMessage()]);
}
?>
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

$token = null;

// Получаем токен
$headers = getallheaders();
if (isset($headers['Authorization'])) {
    if (preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
        $token = $matches[1];
    }
}

if (!$token && isset($_GET['token'])) {
    $token = $_GET['token'];
}

if (!$token) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Токен не предоставлен']);
    exit;
}

try {
    $host = 'localhost';
    $dbname = 'vinylneon_db';
    $username = 'root';
    $password = '';
    
    $conn = new mysqli($host, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        throw new Exception('Ошибка подключения: ' . $conn->connect_error);
    }
    
    // Получаем данные пользователя
    $query = "SELECT u.id, u.username, u.email, u.role, u.created_at,
                     up.full_name, up.phone, up.bonus_points, up.discount_percent
              FROM users u
              LEFT JOIN user_profiles up ON u.id = up.user_id
              WHERE u.token = ?";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        // Устанавливаем значения по умолчанию
        if (!$user['bonus_points']) $user['bonus_points'] = 1000;
        if (!$user['discount_percent']) $user['discount_percent'] = 5;
        
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Пользователь не найден']);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка сервера: ' . $e->getMessage()]);
}
?>
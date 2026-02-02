<?php
// /api/user/full_profile.php - Полные данные профиля

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

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
    // Подключение к БД
    $host = '127.0.0.1:3306';
    $dbname = 'vinylneon_db';
    $username = 'root';
    $password = '';
    
    $conn = new mysqli($host, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        throw new Exception('Ошибка подключения: ' . $conn->connect_error);
    }
    
    // Ищем пользователя по токену
    $stmt = $conn->prepare("
        SELECT u.id, u.username, u.email, u.role, u.created_at,
               up.first_name, up.last_name, up.phone, up.birth_date,
               up.city, up.address, up.bonus_points, up.discount_percent
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.token = ?
    ");
    
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'profile' => $user,
            'message' => 'Полные данные профиля загружены'
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Пользователь не найден'
        ]);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка сервера: ' . $e->getMessage()
    ]);
}
?>
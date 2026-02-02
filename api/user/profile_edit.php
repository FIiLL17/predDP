<?php
// /api/user/profile_edit.php - Обновление данных профиля

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
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

// Получаем данные из тела запроса
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    echo json_encode([
        'success' => false,
        'message' => 'Нет данных для обновления'
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
    $stmt = $conn->prepare("SELECT id FROM users WHERE token = ?");
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Пользователь не найден'
        ]);
        exit;
    }
    
    $user = $result->fetch_assoc();
    $user_id = $user['id'];
    
    // Проверяем, есть ли уже профиль
    $checkStmt = $conn->prepare("SELECT id FROM user_profiles WHERE user_id = ?");
    $checkStmt->bind_param('i', $user_id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        // Обновляем существующий профиль
        $updateStmt = $conn->prepare("
            UPDATE user_profiles 
            SET first_name = ?, last_name = ?, phone = ?, birth_date = ?, city = ?, address = ?
            WHERE user_id = ?
        ");
        
        $updateStmt->bind_param(
            'ssssssi',
            $data['firstname'],
            $data['lastname'],
            $data['phone'],
            $data['birthdate'],
            $data['city'],
            $data['address'],
            $user_id
        );
        
        if ($updateStmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Профиль успешно обновлен'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Ошибка обновления профиля'
            ]);
        }
        
        $updateStmt->close();
    } else {
        // Создаем новый профиль
        $insertStmt = $conn->prepare("
            INSERT INTO user_profiles 
            (user_id, first_name, last_name, phone, birth_date, city, address, bonus_points, discount_percent)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1000, 5)
        ");
        
        $insertStmt->bind_param(
            'issssss',
            $user_id,
            $data['firstname'],
            $data['lastname'],
            $data['phone'],
            $data['birthdate'],
            $data['city'],
            $data['address']
        );
        
        if ($insertStmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Профиль успешно создан'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Ошибка создания профиля'
            ]);
        }
        
        $insertStmt->close();
    }
    
    $checkStmt->close();
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
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

$token = null;
$headers = getallheaders();
if (isset($headers['Authorization'])) {
    if (preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
        $token = $matches[1];
    }
}

if (!$token) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Токен не предоставлен']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Нет данных для обновления']);
    exit;
}

try {
    $host = '127.0.0.1:3306';
    $dbname = 'vinylneon_db';
    $username = 'root';
    $password = '';
    
    $conn = new mysqli($host, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        throw new Exception('Ошибка подключения: ' . $conn->connect_error);
    }
    
    // Находим пользователя
    $stmt = $conn->prepare("SELECT id FROM users WHERE token = ?");
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Пользователь не найден']);
        exit;
    }
    
    $user = $result->fetch_assoc();
    $user_id = $user['id'];
    
    // Обновляем профиль
    $checkStmt = $conn->prepare("SELECT id FROM user_profiles WHERE user_id = ?");
    $checkStmt->bind_param('i', $user_id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        // Обновляем существующий
        $updateStmt = $conn->prepare("
            UPDATE user_profiles 
            SET full_name = ?, phone = ?
            WHERE user_id = ?
        ");
        
        $updateStmt->bind_param(
            'ssi',
            $data['full_name'],
            $data['phone'],
            $user_id
        );
        
        if ($updateStmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Профиль обновлен']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Ошибка обновления']);
        }
        
        $updateStmt->close();
    } else {
        // Создаем новый
        $insertStmt = $conn->prepare("
            INSERT INTO user_profiles (user_id, full_name, phone, bonus_points, discount_percent)
            VALUES (?, ?, ?, 1000, 5)
        ");
        
        $insertStmt->bind_param(
            'iss',
            $user_id,
            $data['full_name'],
            $data['phone']
        );
        
        if ($insertStmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Профиль создан']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Ошибка создания профиля']);
        }
        
        $insertStmt->close();
    }
    
    $checkStmt->close();
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка сервера: ' . $e->getMessage()]);
}
?>
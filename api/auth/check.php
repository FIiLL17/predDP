<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$token = $data['token'] ?? '';

if (empty($token)) {
    echo json_encode([
        'success' => false,
        'message' => 'Токен не предоставлен'
    ]);
    exit;
}

try {
    // Проверяем токен в базе данных
    $query = "SELECT u.* FROM users u 
              JOIN user_sessions us ON u.id = us.user_id 
              WHERE us.token = :token AND us.expires_at > NOW()";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute(['token' => $token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        // Убираем пароль из ответа
        unset($user['password']);
        
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Недействительный или просроченный токен'
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка сервера: ' . $e->getMessage()
    ]);
}
?>
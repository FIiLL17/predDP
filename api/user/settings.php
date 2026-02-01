<?php
// /api/user/settings.php - ИСПРАВЛЕННЫЙ ВАРИАНТ

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
    
    // Проверяем существование таблицы user_settings
    $checkTable = $db->query("SHOW TABLES LIKE 'user_settings'")->fetch();
    
    if (!$checkTable) {
        // Таблица не существует, возвращаем настройки по умолчанию
        $defaultSettings = [
            'email_notifications' => true,
            'sms_notifications' => false,
            'two_factor_auth' => false,
            'newsletter_subscription' => true,
            'theme' => 'dark',
            'language' => 'ru'
        ];
        
        echo json_encode([
            'success' => true,
            'settings' => $defaultSettings,
            'message' => 'Используются настройки по умолчанию (таблица user_settings не найдена)'
        ]);
        exit;
    }
    
    // Получаем настройки пользователя
    $settingsQuery = "SELECT * FROM user_settings WHERE user_id = :user_id";
    $settingsStmt = $db->prepare($settingsQuery);
    $settingsStmt->bindParam(':user_id', $user_id);
    $settingsStmt->execute();
    
    if ($settingsStmt->rowCount() === 0) {
        // Создаем настройки по умолчанию
        $defaultSettings = [
            'email_notifications' => true,
            'sms_notifications' => false,
            'two_factor_auth' => false,
            'newsletter_subscription' => true
        ];
        
        $insertQuery = "INSERT INTO user_settings (user_id, email_notifications, sms_notifications, two_factor_auth, newsletter_subscription) 
                        VALUES (:user_id, :email, :sms, :twofa, :newsletter)";
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->execute([
            ':user_id' => $user_id,
            ':email' => 1,
            ':sms' => 0,
            ':twofa' => 0,
            ':newsletter' => 1
        ]);
        
        echo json_encode([
            'success' => true,
            'settings' => $defaultSettings,
            'message' => 'Созданы настройки по умолчанию'
        ]);
        exit;
    }
    
    $settings = $settingsStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'settings' => $settings,
        'message' => 'Настройки загружены'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка сервера: ' . $e->getMessage()
    ]);
}
?>
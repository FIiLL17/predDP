<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Убедитесь, что нет вывода перед заголовками
ob_start(); // Начинаем буферизацию вывода

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');


require_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

$response = [
    'success' => false,
    'message' => ''
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($data['username']) || !isset($data['password'])) {
        $response['message'] = 'Заполните все поля';
        echo json_encode($response);
        exit;
    }
    
    $username = trim($data['username']);
    $password = $data['password'];
    
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    $response['message'] = 'Ошибка подключения к базе данных';
    echo json_encode($response);
    exit;
}
    
    // Ищем пользователя по username или email
    $query = "SELECT id, username, email, password FROM users WHERE username = :username OR email = :username";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    
    if ($stmt->rowCount() === 1) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Проверяем пароль
        if (password_verify($password, $user['password'])) {
            // Создаем простой токен (в реальном проекте используйте JWT или сессии)
            $token = bin2hex(random_bytes(32));
            
$response['success'] = true;
$response['message'] = 'Вход выполнен успешно';
$response['user'] = [
    'id' => $user['id'],
    'username' => $user['username'],
    'email' => $user['email']
];
$response['token'] = $token;
            
            // Сохраняем токен в базе (опционально)
$update_query = "UPDATE users SET token = :token WHERE id = :id";
$update_stmt = $db->prepare($update_query);
$update_stmt->bindParam(':token', $token);
$update_stmt->bindParam(':id', $user['id']);
$update_stmt->execute();
            
        } else {
            $response['message'] = 'Неверный пароль';
        }
    } else {
        $response['message'] = 'Пользователь не найден';
    }
} else {
    $response['message'] = 'Метод не поддерживается';
}

// Проверяем, существует ли столбец token
try {
    $checkColumn = $db->query("SHOW COLUMNS FROM users LIKE 'token'")->fetch();
    if ($checkColumn) {
        $update_query = "UPDATE users SET token = :token WHERE id = :id";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(':token', $token);
        $update_stmt->bindParam(':id', $user['id']);
        $update_stmt->execute();
    }
} catch (Exception $e) {
    // Столбец не существует, игнорируем
}

// Проверяем и создаем столбец token если его нет
try {
    $checkStmt = $db->query("SHOW COLUMNS FROM users LIKE 'token'");
    if (!$checkStmt->fetch()) {
        $db->exec("ALTER TABLE users ADD COLUMN token VARCHAR(64) NULL DEFAULT NULL");
    }
} catch (Exception $e) {
    // Игнорируем ошибки
}

// Сохраняем токен после успешного входа
if ($response['success']) {
    try {
        $update_query = "UPDATE users SET token = :token WHERE id = :id";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(':token', $response['token']);
        $update_stmt->bindParam(':id', $response['user']['id']);
        $update_stmt->execute();
    } catch (Exception $e) {
        // Логируем ошибку, но не прерываем процесс
        error_log("Ошибка сохранения токена: " . $e->getMessage());
    }
}



echo json_encode($response);
ob_end_flush();
?>
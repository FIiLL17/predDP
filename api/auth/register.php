<?php
// ВРЕМЕННО для отладки - включите вывод ошибок
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Убедитесь, что нет вывода перед заголовками
ob_start(); // Начинаем буферизацию вывода

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
// header('Content-Type: application/json');
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: POST');
// header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

$response = [
    'success' => false,
    'message' => ''
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($data['username']) || !isset($data['email']) || !isset($data['password']) || !isset($data['confirm_password'])) {
        $response['message'] = 'Все поля обязательны';
        echo json_encode($response);
        exit;
    }
    
    $username = trim($data['username']);
    $email = trim($data['email']);
    $password = $data['password'];
    $confirm_password = $data['confirm_password'];
    
    // Валидация
    if (strlen($username) < 3) {
        $response['message'] = 'Имя пользователя должно быть не менее 3 символов';
        echo json_encode($response);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Неверный формат email';
        echo json_encode($response);
        exit;
    }
    
    if (strlen($password) < 6) {
        $response['message'] = 'Пароль должен быть не менее 6 символов';
        echo json_encode($response);
        exit;
    }
    
    if ($password !== $confirm_password) {
        $response['message'] = 'Пароли не совпадают';
        echo json_encode($response);
        exit;
    }
    
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    $response['message'] = 'Ошибка подключения к базе данных';
    echo json_encode($response);
    exit;
}
    
    // Проверяем, существует ли пользователь
    $check_query = "SELECT id FROM users WHERE username = :username OR email = :email";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':username', $username);
    $check_stmt->bindParam(':email', $email);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() > 0) {
        $response['message'] = 'Пользователь с таким именем или email уже существует';
        echo json_encode($response);
        exit;
    }
    
    // Хешируем пароль
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Создаем пользователя
    $insert_query = "INSERT INTO users (username, email, password, created_at) VALUES (:username, :email, :password, NOW())";
    $insert_stmt = $db->prepare($insert_query);
    $insert_stmt->bindParam(':username', $username);
    $insert_stmt->bindParam(':email', $email);
    $insert_stmt->bindParam(':password', $hashed_password);
    
    if ($insert_stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Регистрация успешна';
        $response['user'] = [
            'id' => $db->lastInsertId(),
            'username' => $username,
            'email' => $email
        ];
    } else {
        $response['message'] = 'Ошибка при регистрации';
    }
} else {
    $response['message'] = 'Метод не поддерживается';
}

echo json_encode($response);
ob_end_flush();
?>
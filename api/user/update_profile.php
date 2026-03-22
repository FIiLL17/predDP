<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$data = json_decode(file_get_contents('php://input'), true);

$response = [
    'success' => false,
    'message' => ''
];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Метод не поддерживается';
    echo json_encode($response);
    exit;
}

if (!isset($data['token']) || !isset($data['full_name']) || !isset($data['phone'])) {
    $response['message'] = 'Не все поля заполнены';
    echo json_encode($response);
    exit;
}

$token = $data['token'];
$full_name = trim($data['full_name']);
$phone = trim($data['phone']);

// Подключение к БД
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    $response['message'] = 'Ошибка подключения к базе данных';
    echo json_encode($response);
    exit;
}

// Проверяем токен и получаем user_id
$stmt = $db->prepare("SELECT id FROM users WHERE token = ?");
$stmt->execute([$token]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    $response['message'] = 'Неверный токен авторизации';
    echo json_encode($response);
    exit;
}

$user_id = $user['id'];

// Проверяем, есть ли запись в user_profiles
$stmt = $db->prepare("SELECT id FROM user_profiles WHERE user_id = ?");
$stmt->execute([$user_id]);
$profile = $stmt->fetch();

if ($profile) {
    // Обновляем существующую запись
    $update = $db->prepare("UPDATE user_profiles SET full_name = ?, phone = ? WHERE user_id = ?");
    $result = $update->execute([$full_name, $phone, $user_id]);
} else {
    // Создаём новую запись
    $insert = $db->prepare("INSERT INTO user_profiles (user_id, full_name, phone) VALUES (?, ?, ?)");
    $result = $insert->execute([$user_id, $full_name, $phone]);
}

if ($result) {
    $response['success'] = true;
    $response['message'] = 'Профиль успешно обновлён';
} else {
    $response['message'] = 'Ошибка при сохранении данных';
}

echo json_encode($response);
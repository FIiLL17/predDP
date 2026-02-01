<?php
// api/auth/check.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';

$response = [
    'success' => false,
    'authenticated' => false,
    'user' => null
];

$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

if (!$token) {
    // Проверяем из GET параметров (для простоты)
    $token = isset($_GET['token']) ? $_GET['token'] : null;
}

if ($token) {
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        $query = "SELECT id, username, email FROM users WHERE token = :token";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        if ($stmt->rowCount() === 1) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            $response['success'] = true;
            $response['authenticated'] = true;
            $response['user'] = $user;
        }
    } catch (Exception $e) {
        $response['message'] = 'Ошибка проверки токена';
    }
}

echo json_encode($response);
?>
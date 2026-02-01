<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

$response = [
    'success' => true,
    'message' => 'Выход выполнен'
];

if (isset($data['token'])) {
    $token = $data['token'];
    
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        try {
            $query = "UPDATE users SET token = NULL WHERE token = :token";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':token', $token);
            $stmt->execute();
        } catch (Exception $e) {
            // Игнорируем ошибки, все равно считаем выход успешным
        }
    }
}

echo json_encode($response);
exit;
?>
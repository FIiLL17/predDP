<?php
// test.php - для проверки API

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        echo json_encode([
            'success' => true,
            'message' => 'База данных подключена успешно',
            'table_check' => []
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Не удалось подключиться к БД'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка: ' . $e->getMessage()
    ]);
}
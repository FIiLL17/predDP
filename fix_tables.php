<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Проверяем наличие столбца token
    $stmt = $db->query("SHOW COLUMNS FROM users LIKE 'token'");
    if (!$stmt->fetch()) {
        // Добавляем столбец
        $db->exec("ALTER TABLE users ADD COLUMN token VARCHAR(64) NULL DEFAULT NULL AFTER password");
        echo "Столбец 'token' успешно добавлен!";
    } else {
        echo "Столбец 'token' уже существует!";
    }
} catch (PDOException $e) {
    echo "Ошибка: " . $e->getMessage();
}
?>
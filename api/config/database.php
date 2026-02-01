<?php
class Database {
    private $host = "localhost";
    private $db_name = "vinylneon_db";
    private $username = "root"; // измените на ваше имя пользователя
    private $password = ""; // измените на ваш пароль
    public $conn;
    
    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Ошибка подключения: " . $exception->getMessage();
        }
        
        return $this->conn;
    }
}

<?php
// Отключаем вывод ошибок в браузер
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

try {
    // Поиск database.php
    $possiblePaths = [
        __DIR__ . '/../../config/database.php',
        __DIR__ . '/../config/database.php',
        $_SERVER['DOCUMENT_ROOT'] . '/config/database.php',
        dirname(__DIR__, 2) . '/config/database.php'
    ];

    $dbPath = null;
    foreach ($possiblePaths as $path) {
        if (file_exists($path)) {
            $dbPath = $path;
            break;
        }
    }

    if (!$dbPath) {
        throw new Exception('Не удалось найти файл database.php');
    }

    require_once $dbPath;

    if (!class_exists('Database')) {
        throw new Exception('Класс Database не найден');
    }

    $database = new Database();
    $pdo = $database->getConnection();

    if (!$pdo) {
        throw new Exception('Не удалось подключиться к базе данных');
    }

    // Проверяем существование таблицы reviews
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'reviews'");
    if ($tableCheck->rowCount() == 0) {
        echo json_encode(['success' => true, 'reviews' => [], 'total' => 0]);
        exit;
    }

    // Функция для получения токена
    function getTokenFromHeaders() {
        $headers = getallheaders();
        if (isset($headers['Authorization']) && preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
        if (isset($_SERVER['HTTP_AUTHORIZATION']) && preg_match('/Bearer\s+(.*)$/i', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
            return $matches[1];
        }
        return null;
    }

    $method = $_SERVER['REQUEST_METHOD'];

    // ==================== GET ====================
    if ($method === 'GET') {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $filterRating = isset($_GET['rating']) ? (int)$_GET['rating'] : null;

        $sql = "SELECT r.*, u.username, up.full_name, up.avatar_url 
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                LEFT JOIN user_profiles up ON u.id = up.user_id
                WHERE r.status = 'approved'";
        $params = [];
        if ($filterRating !== null) {
            $sql .= " AND r.rating = ?";
        }
        $sql .= " ORDER BY r.created_at DESC LIMIT ?";

        $stmt = $pdo->prepare($sql);
        $paramIndex = 1;
        if ($filterRating !== null) {
            $stmt->bindValue($paramIndex++, $filterRating, PDO::PARAM_INT);
        }
        $stmt->bindValue($paramIndex, $limit, PDO::PARAM_INT);
        $stmt->execute();

        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Общее количество отзывов
        $countSql = "SELECT COUNT(*) FROM reviews WHERE status = 'approved'";
        if ($filterRating !== null) {
            $countSql .= " AND rating = ?";
        }
        $countStmt = $pdo->prepare($countSql);
        if ($filterRating !== null) {
            $countStmt->bindValue(1, $filterRating, PDO::PARAM_INT);
        }
        $countStmt->execute();
        $total = $countStmt->fetchColumn();

        // Форматируем ответ
        foreach ($reviews as &$r) {
            $r['name'] = $r['full_name'] ?: $r['username'];
            $r['avatar'] = $r['avatar_url'] ?: 'https://randomuser.me/api/portraits/lego/1.jpg';
            $r['badge'] = $r['is_verified'] ? 'проверенный покупатель' : 'пользователь';
            $r['rating'] = (int)$r['rating'];
            $r['text'] = $r['comment'];
            $r['verified'] = (bool)$r['is_verified'];
            $r['date'] = date('d F Y', strtotime($r['created_at']));
            unset($r['full_name'], $r['username'], $r['avatar_url'], $r['comment'], $r['status']);
        }

        echo json_encode([
            'success' => true,
            'reviews' => $reviews,
            'total' => (int)$total
        ]);
        exit;
    }

    // ==================== POST ====================
    if ($method === 'POST') {
        $userId = null;
        $token = getTokenFromHeaders();
        if ($token) {
            $stmt = $pdo->prepare("SELECT id FROM users WHERE token = ?");
            $stmt->execute([$token]);
            $userId = $stmt->fetchColumn();
        }
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Требуется авторизация']);
            exit;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Неверный JSON']);
            exit;
        }

        $rating = isset($data['rating']) ? (int)$data['rating'] : 0;
        $comment = isset($data['comment']) ? trim($data['comment']) : '';

        if ($rating < 1 || $rating > 5) {
            echo json_encode(['success' => false, 'message' => 'Оценка должна быть от 1 до 5']);
            exit;
        }
        if (empty($comment)) {
            echo json_encode(['success' => false, 'message' => 'Комментарий не может быть пустым']);
            exit;
        }

        // Проверяем, были ли у пользователя завершённые заказы (для verified)
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM orders WHERE user_id = ? AND status = 'completed'");
        $stmt->execute([$userId]);
        $hasCompleted = $stmt->fetchColumn() > 0;

        $stmt = $pdo->prepare("INSERT INTO reviews (user_id, rating, comment, is_verified, status) VALUES (?, ?, ?, ?, 'approved')");
        $success = $stmt->execute([$userId, $rating, $comment, $hasCompleted ? 1 : 0]);

        if ($success) {
            echo json_encode(['success' => true, 'message' => 'Отзыв добавлен']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Ошибка при добавлении отзыва']);
        }
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Внутренняя ошибка сервера: ' . $e->getMessage()
    ]);
}
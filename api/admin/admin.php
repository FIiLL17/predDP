<?php
session_start();

// Если уже есть сессия администратора – пропускаем проверку токена
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    // Если нет сессии, но есть токен в URL – проверяем
    if (isset($_GET['token'])) {
        require_once __DIR__ . '/../config/database.php';
        $db = new Database();
        $pdo = $db->getConnection();

        $token = $_GET['token'];
        $stmt = $pdo->prepare("SELECT id, role FROM users WHERE token = ?");
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if ($user && $user['role'] === 'admin') {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            // Перенаправляем, чтобы убрать токен из URL
            header('Location: admin.php');
            exit;
        } else {
            die('Доступ запрещён: неверный токен или недостаточно прав');
        }
    } else {
        header('Location: /login.html');
        exit;
    }
}

// Подключаем БД для получения статистики
require_once __DIR__ . '/../config/database.php';
$db = new Database();
$pdo = $db->getConnection();

// Статистика
$usersCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
$todayOrders = $pdo->query("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()")->fetchColumn();
$productsCount = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn() ?: 0;
$monthRevenue = $pdo->query("SELECT SUM(total_amount) FROM orders WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())")->fetchColumn();
$monthRevenue = $monthRevenue ? number_format($monthRevenue, 0, '.', ' ') . ' ₽' : '0 ₽';
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Админ-панель | VinylNeon</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',Arial,sans-serif; }
        :root { --admin-blue:#0066ff; --admin-red:#ff3366; --admin-green:#00cc66; --dark-bg:#0a0a0f; --card-bg:rgba(20,20,35,0.9); }
        body { background-color:var(--dark-bg); color:#f0f0f0; min-height:100vh; padding:20px; }
        .container { max-width:1200px; margin:0 auto; }
        .admin-header { background:linear-gradient(90deg,var(--admin-blue),#ff00ff); border-radius:15px; padding:30px; margin-bottom:30px; text-align:center; border:2px solid rgba(255,255,255,0.1); box-shadow:0 0 30px rgba(255,0,255,0.3); }
        .admin-header h1 { font-size:2.5rem; margin-bottom:15px; color:white; text-shadow:0 0 10px rgba(255,255,255,0.3); }
        .admin-header p { color:rgba(255,255,255,0.9); font-size:1.1rem; }
        .admin-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:20px; margin-bottom:40px; }
        .admin-card { background:var(--card-bg); border-radius:15px; padding:25px; border:1px solid rgba(255,255,255,0.1); transition:all 0.3s ease; cursor:pointer; text-align:center; }
        .admin-card:hover { transform:translateY(-5px); border-color:var(--admin-blue); box-shadow:0 10px 25px rgba(0,102,255,0.3); }
        .admin-card i { font-size:3rem; margin-bottom:20px; color:var(--admin-blue); }
        .admin-card h3 { font-size:2rem; margin-bottom:10px; color:white; }
        .admin-card p { color:#aaa; margin-bottom:15px; }
        .action-buttons { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:15px; margin-top:30px; }
        .action-btn { background:rgba(0,102,255,0.1); border:2px solid var(--admin-blue); color:var(--admin-blue); padding:15px 25px; border-radius:10px; cursor:pointer; font-size:1.1rem; font-weight:600; transition:all 0.3s ease; display:flex; align-items:center; justify-content:center; gap:10px; text-decoration:none; }
        .action-btn:hover { background:var(--admin-blue); color:white; box-shadow:0 0 20px rgba(0,102,255,0.5); }
        .back-btn { width:100%; padding:15px; background:transparent; border:2px solid #ff00ff; color:#ff00ff; border-radius:10px; cursor:pointer; font-size:1.1rem; font-weight:600; transition:all 0.3s ease; display:flex; align-items:center; justify-content:center; gap:10px; margin-top:20px; text-decoration:none; }
        .back-btn:hover { background:#ff00ff; color:black; box-shadow:0 0 20px rgba(255,0,255,0.5); }
        .status-badge { display:inline-block; padding:8px 15px; background:rgba(0,204,102,0.2); color:var(--admin-green); border-radius:20px; font-size:0.9rem; font-weight:600; margin-top:10px; border:1px solid var(--admin-green); }
    </style>
</head>
<body>
    <div class="container">
        <header class="admin-header">
            <h1><i class="fas fa-shield-alt"></i> Админ-панель VinylNeon</h1>
            <p>Добро пожаловать, администратор!</p>
            <div class="status-badge">
                <i class="fas fa-check-circle"></i> Доступ предоставлен
            </div>
        </header>

        <div class="admin-grid">
            <div class="admin-card" onclick="window.location.href='users.php'">
                <i class="fas fa-users"></i>
                <h3><?= $usersCount ?></h3>
                <p>Пользователей</p>
                <small>Управление учетными записями</small>
            </div>
            <div class="admin-card" onclick="window.location.href='orders.php'">
                <i class="fas fa-shopping-cart"></i>
                <h3><?= $todayOrders ?></h3>
                <p>Заказов сегодня</p>
                <small>Просмотр и обработка</small>
            </div>
            <div class="admin-card" onclick="window.location.href='products.php'">
                <i class="fas fa-record-vinyl"></i>
                <h3><?= $productsCount ?></h3>
                <p>Товаров</p>
                <small>Каталог продукции</small>
            </div>
            <div class="admin-card" onclick="window.location.href='analytics.php'">
                <i class="fas fa-ruble-sign"></i>
                <h3><?= $monthRevenue ?></h3>
                <p>Выручка</p>
                <small>За текущий месяц</small>
            </div>
        </div>

        <div class="action-buttons">
            <a href="users.php" class="action-btn"><i class="fas fa-user-cog"></i> Управление пользователями</a>
            <a href="products.php" class="action-btn"><i class="fas fa-box-open"></i> Управление товарами</a>
            <a href="orders.php" class="action-btn"><i class="fas fa-clipboard-list"></i> Просмотр заказов</a>
            <a href="analytics.php" class="action-btn"><i class="fas fa-chart-line"></i> Аналитика продаж</a>
        </div>

        <a href="/user.html" class="back-btn"><i class="fas fa-arrow-left"></i> Вернуться в профиль</a>
    </div>
</body>
</html>
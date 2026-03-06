<?php
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header('Location: /login.html');
    exit;
}

require_once __DIR__ . '/../config/database.php';
$db = new Database();
$pdo = $db->getConnection();

$user_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if (!$user_id) {
    die('Не указан ID пользователя');
}

// Получаем основную информацию о пользователе
$stmt = $pdo->prepare("
    SELECT u.*, up.full_name, up.phone, up.birth_date, up.city, up.address,
           up.bonus_points, up.discount_percent, up.avatar_url
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.id = ?
");
$stmt->execute([$user_id]);
$user = $stmt->fetch();

if (!$user) {
    die('Пользователь не найден');
}

// Статистика
$ordersCount = $pdo->prepare("SELECT COUNT(*) FROM orders WHERE user_id = ?");
$ordersCount->execute([$user_id]);
$ordersTotal = $pdo->prepare("SELECT SUM(total_amount) FROM orders WHERE user_id = ?");
$ordersTotal->execute([$user_id]);

$favoritesCount = $pdo->prepare("SELECT COUNT(*) FROM favorites WHERE user_id = ?");
$favoritesCount->execute([$user_id]);

$cartCount = $pdo->prepare("SELECT COUNT(*) FROM cart WHERE user_id = ?");
$cartCount->execute([$user_id]);

// Заказы
$orders = $pdo->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
$orders->execute([$user_id]);
$orders = $orders->fetchAll();

// Избранное
$favorites = $pdo->prepare("SELECT * FROM favorites WHERE user_id = ? ORDER BY added_at DESC");
$favorites->execute([$user_id]);
$favorites = $favorites->fetchAll();

// Корзина
$cart = $pdo->prepare("SELECT * FROM cart WHERE user_id = ? ORDER BY added_at DESC");
$cart->execute([$user_id]);
$cart = $cart->fetchAll();

// Просмотренные товары
$viewed = $pdo->prepare("SELECT * FROM viewed_products WHERE user_id = ? ORDER BY viewed_at DESC LIMIT 20");
$viewed->execute([$user_id]);
$viewed = $viewed->fetchAll();

// Адреса доставки
$addresses = $pdo->prepare("SELECT * FROM user_delivery_addresses WHERE user_id = ? ORDER BY is_default DESC, id");
$addresses->execute([$user_id]);
$addresses = $addresses->fetchAll();

// Настройки
$settings = $pdo->prepare("SELECT * FROM user_settings WHERE user_id = ?");
$settings->execute([$user_id]);
$settings = $settings->fetch();
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Пользователь #<?= $user_id ?> | VinylNeon Admin</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',Arial,sans-serif; }
        :root { --admin-blue:#0066ff; --admin-red:#ff3366; --admin-green:#00cc66; --dark-bg:#0a0a0f; --card-bg:rgba(20,20,35,0.9); }
        body { background-color:var(--dark-bg); color:#f0f0f0; padding:20px; }
        .container { max-width:1200px; margin:0 auto; }
        .admin-header { background:linear-gradient(90deg,var(--admin-blue),#ff00ff); border-radius:15px; padding:30px; margin-bottom:30px; text-align:center; border:2px solid rgba(255,255,255,0.1); box-shadow:0 0 30px rgba(255,0,255,0.3); }
        .admin-header h1 { font-size:2.5rem; margin-bottom:15px; color:white; text-shadow:0 0 10px rgba(255,255,255,0.3); }
        .admin-header p { color:rgba(255,255,255,0.9); font-size:1.1rem; }
        .status-badge { display:inline-block; padding:8px 15px; background:rgba(0,204,102,0.2); color:var(--admin-green); border-radius:20px; font-size:0.9rem; font-weight:600; margin-top:10px; border:1px solid var(--admin-green); }
        .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:20px; margin-bottom:30px; }
        .stat-card { background:var(--card-bg); border-radius:15px; padding:20px; text-align:center; border:1px solid rgba(255,255,255,0.1); transition:all 0.3s ease; }
        .stat-card:hover { transform:translateY(-5px); border-color:var(--admin-blue); }
        .stat-card i { font-size:2.5rem; color:var(--admin-blue); margin-bottom:10px; }
        .stat-value { font-size:1.8rem; font-weight:bold; color:white; }
        .stat-label { color:#aaa; font-size:0.9rem; }
        .tabs { display:flex; flex-wrap:wrap; gap:5px; margin:20px 0; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px; }
        .tab { padding:12px 25px; background:rgba(255,255,255,0.05); border-radius:8px 8px 0 0; cursor:pointer; transition:all 0.3s ease; border:1px solid transparent; border-bottom:none; color:#ccc; font-weight:500; }
        .tab:hover { background:rgba(0,102,255,0.1); color:white; }
        .tab.active { background:var(--admin-blue); color:white; border-color:var(--admin-blue); }
        .tab-content { display:none; background:var(--card-bg); padding:25px; border-radius:15px; margin-bottom:30px; border:1px solid rgba(255,255,255,0.1); }
        .tab-content.active { display:block; }
        table { width:100%; border-collapse:collapse; }
        th, td { padding:12px 15px; text-align:left; border-bottom:1px solid rgba(255,255,255,0.1); }
        th { background:rgba(0,102,255,0.2); color:var(--admin-blue); font-weight:600; }
        tr:hover { background:rgba(255,255,255,0.05); }
        .badge { display:inline-block; padding:4px 8px; border-radius:4px; font-size:0.85rem; font-weight:600; }
        .badge.active { background:rgba(0,204,102,0.2); color:#0c6; border:1px solid #0c6; }
        .badge.inactive { background:rgba(255,51,102,0.2); color:#f36; border:1px solid #f36; }
        .badge.pending { background:rgba(255,193,7,0.2); color:#ffc107; border:1px solid #ffc107; }
        .badge.completed { background:rgba(0,204,102,0.2); color:#0c6; border:1px solid #0c6; }
        .badge.cancelled { background:rgba(255,51,102,0.2); color:#f36; border:1px solid #f36; }
        .badge.shipped { background:rgba(157,0,255,0.2); color:#9d00ff; border:1px solid #9d00ff; }
        .back-btn { width:100%; padding:15px; background:transparent; border:2px solid #ff00ff; color:#ff00ff; border-radius:10px; cursor:pointer; font-size:1.1rem; font-weight:600; transition:all 0.3s ease; display:flex; align-items:center; justify-content:center; gap:10px; margin-top:20px; text-decoration:none; }
        .back-btn:hover { background:#ff00ff; color:black; box-shadow:0 0 20px rgba(255,0,255,0.5); }
        .address-card { background:rgba(0,0,0,0.2); border-radius:10px; padding:15px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.1); }
        .address-card.default { border-color:var(--admin-green); }
        .address-title { font-size:1.2rem; color:var(--admin-blue); margin-bottom:10px; }
        .address-detail { display:flex; margin-bottom:5px; }
        .address-label { min-width:100px; color:#aaa; }
        .address-value { color:white; }
    </style>
</head>
<body>
    <div class="container">
        <header class="admin-header">
            <h1><i class="fas fa-user"></i> Профиль пользователя</h1>
            <p><?= htmlspecialchars($user['full_name'] ?: $user['username']) ?> (ID: <?= $user_id ?>)</p>
            <div class="status-badge">
                <?= $user['is_active'] ? 'Активен' : 'Заблокирован' ?> · Роль: <?= $user['role'] ?>
            </div>
        </header>

        <!-- Статистика -->
        <div class="stats-grid">
            <div class="stat-card">
                <i class="fas fa-shopping-cart"></i>
                <div class="stat-value"><?= $ordersCount->fetchColumn() ?></div>
                <div class="stat-label">Заказов</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-ruble-sign"></i>
                <div class="stat-value"><?= number_format($ordersTotal->fetchColumn() ?: 0, 0, '.', ' ') ?> ₽</div>
                <div class="stat-label">Сумма заказов</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-heart"></i>
                <div class="stat-value"><?= $favoritesCount->fetchColumn() ?></div>
                <div class="stat-label">В избранном</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-shopping-basket"></i>
                <div class="stat-value"><?= $cartCount->fetchColumn() ?></div>
                <div class="stat-label">В корзине</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-gift"></i>
                <div class="stat-value"><?= $user['bonus_points'] ?? 0 ?></div>
                <div class="stat-label">Бонусы</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-tag"></i>
                <div class="stat-value"><?= $user['discount_percent'] ?? 0 ?>%</div>
                <div class="stat-label">Скидка</div>
            </div>
        </div>

        <!-- Вкладки -->
        <div class="tabs">
            <div class="tab active" data-tab="profile">Основное</div>
            <div class="tab" data-tab="orders">Заказы (<?= count($orders) ?>)</div>
            <div class="tab" data-tab="favorites">Избранное (<?= count($favorites) ?>)</div>
            <div class="tab" data-tab="cart">Корзина (<?= count($cart) ?>)</div>
            <div class="tab" data-tab="viewed">Просмотры (<?= count($viewed) ?>)</div>
            <div class="tab" data-tab="addresses">Адреса (<?= count($addresses) ?>)</div>
            <div class="tab" data-tab="settings">Настройки</div>
        </div>

        <!-- Основная информация -->
        <div id="profile" class="tab-content active">
            <h3 style="color: var(--admin-blue); margin-bottom: 20px;">Личные данные</h3>
            <table>
                <tr><th>Имя пользователя</th><td><?= htmlspecialchars($user['username']) ?></td></tr>
                <tr><th>Полное имя</th><td><?= htmlspecialchars($user['full_name'] ?: '—') ?></td></tr>
                <tr><th>Email</th><td><?= htmlspecialchars($user['email']) ?></td></tr>
                <tr><th>Телефон</th><td><?= htmlspecialchars($user['phone'] ?: '—') ?></td></tr>
                <tr><th>Дата рождения</th><td><?= $user['birth_date'] ? date('d.m.Y', strtotime($user['birth_date'])) : '—' ?></td></tr>
                <tr><th>Город</th><td><?= htmlspecialchars($user['city'] ?: '—') ?></td></tr>
                <tr><th>Адрес</th><td><?= htmlspecialchars($user['address'] ?: '—') ?></td></tr>
                <tr><th>Дата регистрации</th><td><?= date('d.m.Y H:i', strtotime($user['created_at'])) ?></td></tr>
                <tr><th>Последнее обновление</th><td><?= date('d.m.Y H:i', strtotime($user['updated_at'])) ?></td></tr>
            </table>
        </div>

        <!-- Заказы -->
        <div id="orders" class="tab-content">
            <h3 style="color: var(--admin-blue); margin-bottom: 20px;">Заказы пользователя</h3>
            <?php if (count($orders) > 0): ?>
                <table>
                    <thead>
                        <tr><th>№ заказа</th><th>Сумма</th><th>Статус</th><th>Способ оплаты</th><th>Адрес</th><th>Дата</th></tr>
                    </thead>
                    <tbody>
                        <?php foreach ($orders as $order): ?>
                        <tr>
                            <td><?= htmlspecialchars($order['order_number']) ?></td>
                            <td><?= number_format($order['total_amount'], 2) ?> ₽</td>
                            <td><span class="badge <?= $order['status'] ?>"><?= htmlspecialchars($order['status']) ?></span></td>
                            <td><?= htmlspecialchars($order['payment_method'] ?: '—') ?></td>
                            <td><?= htmlspecialchars($order['shipping_city'] . ', ' . $order['shipping_address']) ?></td>
                            <td><?= date('d.m.Y H:i', strtotime($order['created_at'])) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <p style="text-align:center; padding:40px; color:#aaa;">У пользователя нет заказов</p>
            <?php endif; ?>
        </div>

        <!-- Избранное -->
        <div id="favorites" class="tab-content">
            <h3 style="color: var(--admin-blue); margin-bottom: 20px;">Избранные товары</h3>
            <?php if (count($favorites) > 0): ?>
                <table>
                    <thead><tr><th>Товар</th><th>Цена</th><th>Дата добавления</th></tr></thead>
                    <tbody>
                        <?php foreach ($favorites as $fav): ?>
                        <tr>
                            <td><?= htmlspecialchars($fav['product_title']) ?></td>
                            <td><?= number_format($fav['product_price'], 2) ?> ₽</td>
                            <td><?= date('d.m.Y H:i', strtotime($fav['added_at'])) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <p style="text-align:center; padding:40px; color:#aaa;">Нет избранных товаров</p>
            <?php endif; ?>
        </div>

        <!-- Корзина -->
        <div id="cart" class="tab-content">
            <h3 style="color: var(--admin-blue); margin-bottom: 20px;">Товары в корзине</h3>
            <?php if (count($cart) > 0): ?>
                <table>
                    <thead><tr><th>Товар</th><th>Цена</th><th>Кол-во</th><th>Сумма</th><th>Дата добавления</th></tr></thead>
                    <tbody>
                        <?php foreach ($cart as $item): ?>
                        <tr>
                            <td><?= htmlspecialchars($item['product_title']) ?></td>
                            <td><?= number_format($item['product_price'], 2) ?> ₽</td>
                            <td><?= $item['quantity'] ?></td>
                            <td><?= number_format($item['product_price'] * $item['quantity'], 2) ?> ₽</td>
                            <td><?= date('d.m.Y H:i', strtotime($item['added_at'])) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <p style="text-align:center; padding:40px; color:#aaa;">Корзина пуста</p>
            <?php endif; ?>
        </div>

        <!-- Просмотренные товары -->
        <div id="viewed" class="tab-content">
            <h3 style="color: var(--admin-blue); margin-bottom: 20px;">Недавно просмотренные товары</h3>
            <?php if (count($viewed) > 0): ?>
                <table>
                    <thead><tr><th>Товар</th><th>Дата просмотра</th></tr></thead>
                    <tbody>
                        <?php foreach ($viewed as $item): ?>
                        <tr>
                            <td><?= htmlspecialchars($item['product_title']) ?></td>
                            <td><?= date('d.m.Y H:i', strtotime($item['viewed_at'])) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <p style="text-align:center; padding:40px; color:#aaa;">Нет просмотренных товаров</p>
            <?php endif; ?>
        </div>

        <!-- Адреса доставки -->
        <div id="addresses" class="tab-content">
            <h3 style="color: var(--admin-blue); margin-bottom: 20px;">Сохранённые адреса доставки</h3>
            <?php if (count($addresses) > 0): ?>
                <?php foreach ($addresses as $addr): ?>
                    <div class="address-card <?= $addr['is_default'] ? 'default' : '' ?>">
                        <div class="address-title">
                            <?= htmlspecialchars($addr['title'] ?: 'Адрес') ?>
                            <?php if ($addr['is_default']): ?><span class="badge active">По умолчанию</span><?php endif; ?>
                        </div>
                        <div class="address-detail">
                            <span class="address-label">Получатель:</span>
                            <span class="address-value"><?= htmlspecialchars($addr['full_name']) ?></span>
                        </div>
                        <div class="address-detail">
                            <span class="address-label">Телефон:</span>
                            <span class="address-value"><?= htmlspecialchars($addr['phone']) ?></span>
                        </div>
                        <div class="address-detail">
                            <span class="address-label">Адрес:</span>
                            <span class="address-value"><?= htmlspecialchars($addr['city'] . ', ' . $addr['street'] . ', д. ' . $addr['house'] . ($addr['building'] ? ', корп. ' . $addr['building'] : '') . ($addr['apartment'] ? ', кв. ' . $addr['apartment'] : '')) ?></span>
                        </div>
                        <?php if ($addr['notes']): ?>
                        <div class="address-detail">
                            <span class="address-label">Примечания:</span>
                            <span class="address-value"><?= htmlspecialchars($addr['notes']) ?></span>
                        </div>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <p style="text-align:center; padding:40px; color:#aaa;">Адреса не добавлены</p>
            <?php endif; ?>
        </div>

        <!-- Настройки -->
        <div id="settings" class="tab-content">
            <h3 style="color: var(--admin-blue); margin-bottom: 20px;">Настройки уведомлений и предпочтения</h3>
            <?php if ($settings): ?>
                <table>
                    <tr><th>Email-уведомления</th><td><?= $settings['email_notifications'] ? 'Включены' : 'Отключены' ?></td></tr>
                    <tr><th>SMS-уведомления</th><td><?= $settings['sms_notifications'] ? 'Включены' : 'Отключены' ?></td></tr>
                    <tr><th>Двухфакторная аутентификация</th><td><?= $settings['two_factor_auth'] ? 'Включена' : 'Отключена' ?></td></tr>
                    <tr><th>Подписка на новости</th><td><?= $settings['newsletter_subscription'] ? 'Подписан' : 'Не подписан' ?></td></tr>
                    <tr><th>Язык</th><td><?= $settings['language'] ?></td></tr>
                    <tr><th>Валюта</th><td><?= $settings['currency'] ?></td></tr>
                </table>
            <?php else: ?>
                <p style="text-align:center; padding:40px; color:#aaa;">Настройки не найдены</p>
            <?php endif; ?>
        </div>

        <a href="users.php" class="back-btn">← Назад к списку пользователей</a>
    </div>

    <!-- Скрипт для вкладок -->
    <script>
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
    </script>
</body>
</html>
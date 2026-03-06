<?php
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header('Location: /login.html');
    exit;
}

require_once __DIR__ . '/../config/database.php';
$db = new Database();
$pdo = $db->getConnection();

// Пагинация
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 20;
$offset = ($page - 1) * $limit;

$total = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
$totalPages = ceil($total / $limit);

$stmt = $pdo->prepare("
    SELECT u.id, u.username, u.email, u.role, u.is_active, u.created_at,
           up.full_name, up.phone
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    ORDER BY u.id DESC
    LIMIT :limit OFFSET :offset
");
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$users = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Управление пользователями | VinylNeon Admin</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',sans-serif; }
        :root { --admin-blue:#0066ff; --admin-red:#ff3366; --admin-green:#00cc66; --dark-bg:#0a0a0f; --card-bg:rgba(20,20,35,0.9); }
        body { background-color:var(--dark-bg); color:#f0f0f0; padding:20px; }
        .container { max-width:1200px; margin:0 auto; }
        .admin-header { background:linear-gradient(90deg,var(--admin-blue),#ff00ff); border-radius:15px; padding:30px; margin-bottom:30px; text-align:center; }
        h1 { color:white; }
        table { width:100%; border-collapse:collapse; background:var(--card-bg); border-radius:10px; overflow:hidden; }
        th, td { padding:12px 15px; text-align:left; border-bottom:1px solid rgba(255,255,255,0.1); }
        th { background:rgba(0,102,255,0.2); color:var(--admin-blue); font-weight:600; }
        .badge { display:inline-block; padding:4px 8px; border-radius:4px; font-size:0.85rem; font-weight:600; }
        .badge.active { background:rgba(0,204,102,0.2); color:#0c6; border:1px solid #0c6; }
        .badge.inactive { background:rgba(255,51,102,0.2); color:#f36; border:1px solid #f36; }
        .action-btn { background:rgba(0,102,255,0.1); border:2px solid var(--admin-blue); color:var(--admin-blue); padding:5px 10px; border-radius:5px; text-decoration:none; transition:all 0.3s ease; display:inline-flex; align-items:center; gap:5px; }
        .action-btn:hover { background:var(--admin-blue); color:white; }
        .pagination { display:flex; justify-content:center; gap:10px; margin:20px 0; }
        .pagination a { padding:8px 12px; background:var(--card-bg); color:#fff; text-decoration:none; border-radius:5px; border:1px solid rgba(255,255,255,0.1); }
        .pagination a.active { background:var(--admin-blue); border-color:var(--admin-blue); }
        .back-btn { display:block; width:100%; padding:15px; background:transparent; border:2px solid #ff00ff; color:#ff00ff; border-radius:10px; text-align:center; text-decoration:none; margin-top:20px; }
        .back-btn:hover { background:#ff00ff; color:black; }
    </style>
</head>
<body>
<div class="container">
    <header class="admin-header">
        <h1><i class="fas fa-users-cog"></i> Управление пользователями</h1>
        <p>Всего пользователей: <?= $total ?></p>
    </header>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Дата регистрации</th>
                <th>Действия</th>
            </tr>
        </thead>
        <tbody>
        <?php foreach ($users as $user): ?>
            <tr>
                <td><?= $user['id'] ?></td>
                <td><?= htmlspecialchars($user['full_name'] ?: $user['username']) ?></td>
                <td><?= htmlspecialchars($user['email']) ?></td>
                <td><?= htmlspecialchars($user['phone'] ?: '—') ?></td>
                <td><?= $user['role'] ?></td>
                <td><?= $user['is_active'] ? '<span class="badge active">Активен</span>' : '<span class="badge inactive">Заблокирован</span>' ?></td>
                <td><?= date('d.m.Y H:i', strtotime($user['created_at'])) ?></td>
                <td><a href="user_details.php?id=<?= $user['id'] ?>" class="action-btn"><i class="fas fa-eye"></i> Подробнее</a></td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>

    <?php if ($totalPages > 1): ?>
        <div class="pagination">
            <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                <a href="?page=<?= $i ?>" class="<?= $i == $page ? 'active' : '' ?>"><?= $i ?></a>
            <?php endfor; ?>
        </div>
    <?php endif; ?>

    <a href="admin.php" class="back-btn">← Вернуться в панель</a>
</div>
</body>
</html>
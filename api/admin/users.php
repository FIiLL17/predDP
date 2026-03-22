<?php
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header('Location: /login.html');
    exit;
}

require_once __DIR__ . '/../config/database.php';
$db = new Database();
$pdo = $db->getConnection();

// ------------------ Получение параметров из GET ------------------
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$role_filter = isset($_GET['role']) ? $_GET['role'] : '';
$status_filter = isset($_GET['status']) ? $_GET['status'] : '';

$allowed_sort = ['id', 'full_name', 'email', 'created_at'];
$sort = isset($_GET['sort']) && in_array($_GET['sort'], $allowed_sort) ? $_GET['sort'] : 'id';
$order = isset($_GET['order']) && strtolower($_GET['order']) === 'asc' ? 'ASC' : 'DESC';

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 20;
$offset = ($page - 1) * $limit;

// ------------------ Построение SQL-запроса ------------------
$sql = "
    SELECT u.id, u.username, u.email, u.role, u.is_active, u.created_at,
           up.full_name, up.phone
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE 1=1
";
$params = [];

if (!empty($search)) {
    $sql .= " AND (up.full_name LIKE :search OR u.username LIKE :search OR u.email LIKE :search OR up.phone LIKE :search)";
    $params[':search'] = "%$search%";
}
if (!empty($role_filter) && in_array($role_filter, ['user', 'admin'])) {
    $sql .= " AND u.role = :role";
    $params[':role'] = $role_filter;
}
if ($status_filter === 'active') {
    $sql .= " AND u.is_active = 1";
} elseif ($status_filter === 'inactive') {
    $sql .= " AND u.is_active = 0";
}

$sql .= " ORDER BY ";
switch ($sort) {
    case 'full_name':
        $sql .= "up.full_name $order, u.username $order";
        break;
    case 'email':
        $sql .= "u.email $order";
        break;
    case 'created_at':
        $sql .= "u.created_at $order";
        break;
    default:
        $sql .= "u.id $order";
        break;
}
$sql .= " LIMIT :limit OFFSET :offset";
$params[':limit'] = $limit;
$params[':offset'] = $offset;

$stmt = $pdo->prepare($sql);
foreach ($params as $key => $value) {
    $type = is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR;
    $stmt->bindValue($key, $value, $type);
}
$stmt->execute();
$users = $stmt->fetchAll();

// Подсчёт общего количества
$count_sql = "
    SELECT COUNT(*) 
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE 1=1
";
$count_params = [];
if (!empty($search)) {
    $count_sql .= " AND (up.full_name LIKE :search OR u.username LIKE :search OR u.email LIKE :search OR up.phone LIKE :search)";
    $count_params[':search'] = "%$search%";
}
if (!empty($role_filter) && in_array($role_filter, ['user', 'admin'])) {
    $count_sql .= " AND u.role = :role";
    $count_params[':role'] = $role_filter;
}
if ($status_filter === 'active') {
    $count_sql .= " AND u.is_active = 1";
} elseif ($status_filter === 'inactive') {
    $count_sql .= " AND u.is_active = 0";
}
$count_stmt = $pdo->prepare($count_sql);
foreach ($count_params as $key => $value) {
    $count_stmt->bindValue($key, $value);
}
$count_stmt->execute();
$total = $count_stmt->fetchColumn();
$totalPages = ceil($total / $limit);

function buildUrl($params) {
    $current = $_GET;
    foreach ($params as $key => $value) {
        if ($value === null) {
            unset($current[$key]);
        } else {
            $current[$key] = $value;
        }
    }
    return '?' . http_build_query($current);
}
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
        :root { 
            --admin-blue:#0066ff; 
            --admin-red:#ff3366; 
            --admin-green:#00cc66; 
            --dark-bg:#0a0a0f; 
            --card-bg:rgba(20,20,35,0.9);
            --neon-pink:#ff2f92;
            --neon-cyan:#00f0ff;
        }
        body { background-color:var(--dark-bg); color:#f0f0f0; padding:20px; }
        .container { max-width:1200px; margin:0 auto; }
        .admin-header { background:linear-gradient(90deg,var(--admin-blue),var(--neon-pink)); border-radius:15px; padding:30px; margin-bottom:30px; text-align:center; border:2px solid rgba(255,255,255,0.1); box-shadow:0 0 30px rgba(0,102,255,0.3); }
        h1 { color:white; text-shadow:0 0 10px rgba(255,255,255,0.3); }

        /* ------------------ БЛОК ФИЛЬТРОВ ------------------ */
        .filters {
            background: var(--card-bg);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 30px;
            border: 1px solid rgba(0,240,255,0.2);
            box-shadow: 0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            align-items: flex-end;
        }
        .filter-group {
            flex: 1;
            min-width: 160px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .filter-group label {
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--neon-cyan);
            text-shadow: 0 0 5px rgba(0,240,255,0.5);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .filter-group label i { font-size: 1rem; }
        .filter-group select,
        .filter-group input {
            background: #1a1a2a;
            border: 1px solid rgba(0,240,255,0.3);
            border-radius: 12px;
            padding: 12px 16px;
            color: white;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            outline: none;
        }
        .filter-group select {
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2300f0ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>");
            background-repeat: no-repeat;
            background-position: right 16px center;
            background-size: 14px;
        }
        .filter-group select option {
            background: #0a0a14;
            color: white;
            padding: 10px;
        }
        .filter-group select:hover,
        .filter-group input:hover {
            border-color: var(--neon-cyan);
        }
        .filter-group select:focus,
        .filter-group input:focus {
            border-color: var(--neon-cyan);
            box-shadow: 0 0 15px rgba(0,240,255,0.3);
            background: rgba(0,240,255,0.05);
        }
        .filter-group input::placeholder {
            color: rgba(255,255,255,0.4);
        }

        .btn-filter, .btn-reset {
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            border: none;
            letter-spacing: 0.5px;
        }
        .btn-filter {
            background: linear-gradient(135deg, var(--admin-blue), #4d4dff);
            color: white;
            box-shadow: 0 0 10px rgba(0,102,255,0.3);
        }
        .btn-filter:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0,102,255,0.5);
        }
        .btn-reset {
            background: rgba(255,47,146,0.1);
            border: 1px solid var(--neon-pink);
            color: var(--neon-pink);
        }
        .btn-reset:hover {
            background: var(--neon-pink);
            color: black;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255,47,146,0.4);
        }

        /* ------------------ ТАБЛИЦА ------------------ */
        table {
            width: 100%;
            border-collapse: collapse;
            background: var(--card-bg);
            border-radius: 15px;
            overflow: hidden;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.05);
        }
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        th {
            background: rgba(0,102,255,0.2);
            color: var(--neon-cyan);
            font-weight: 600;
            cursor: pointer;
            user-select: none;
            transition: 0.2s;
            white-space: nowrap;
        }
        th:hover {
            background: rgba(0,102,255,0.4);
        }
        .sort-icon {
            margin-left: 6px;
            font-size: 0.85rem;
            display: inline-block;
            vertical-align: middle;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .badge.active { background:rgba(0,204,102,0.2); color:#0c6; border:1px solid #0c6; }
        .badge.inactive { background:rgba(255,51,102,0.2); color:#f36; border:1px solid #f36; }
        .action-btn {
            background:rgba(0,102,255,0.1);
            border:2px solid var(--admin-blue);
            color:var(--admin-blue);
            padding:5px 10px;
            border-radius:5px;
            text-decoration:none;
            transition:all 0.3s ease;
            display:inline-flex;
            align-items:center;
            gap:5px;
        }
        .action-btn:hover { background:var(--admin-blue); color:white; }
        .pagination {
            display:flex;
            justify-content:center;
            gap:10px;
            margin:20px 0;
        }
        .pagination a {
            padding:8px 12px;
            background:var(--card-bg);
            color:#fff;
            text-decoration:none;
            border-radius:5px;
            border:1px solid rgba(255,255,255,0.1);
            transition:0.2s;
        }
        .pagination a:hover { border-color:var(--neon-cyan); }
        .pagination a.active { background:var(--admin-blue); border-color:var(--admin-blue); }
        .back-btn {
            display:block;
            width:100%;
            padding:15px;
            background:transparent;
            border:2px solid var(--neon-pink);
            color:var(--neon-pink);
            border-radius:12px;
            text-align:center;
            text-decoration:none;
            margin-top:20px;
            font-weight:600;
            transition:all 0.3s ease;
        }
        .back-btn:hover { background:var(--neon-pink); color:black; box-shadow:0 0 20px rgba(255,47,146,0.5); }
        .info-bar {
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:15px;
            flex-wrap:wrap;
            gap:10px;
            color:#aaa;
        }
    </style>
</head>
<body>
<div class="container">
    <header class="admin-header">
        <h1><i class="fas fa-users-cog"></i> Управление пользователями</h1>
        <p>Всего пользователей: <?= $total ?></p>
    </header>

    <form method="get" class="filters" id="filterForm">
        <div class="filter-group">
            <label><i class="fas fa-search"></i> Поиск</label>
            <input type="text" name="search" value="<?= htmlspecialchars($search) ?>" placeholder="Имя, email, телефон...">
        </div>
        <div class="filter-group">
            <label><i class="fas fa-user-tag"></i> Роль</label>
            <select name="role">
                <option value="">Все</option>
                <option value="user" <?= $role_filter === 'user' ? 'selected' : '' ?>>Пользователь</option>
                <option value="admin" <?= $role_filter === 'admin' ? 'selected' : '' ?>>Администратор</option>
            </select>
        </div>
        <div class="filter-group">
            <label><i class="fas fa-toggle-on"></i> Статус</label>
            <select name="status">
                <option value="">Все</option>
                <option value="active" <?= $status_filter === 'active' ? 'selected' : '' ?>>Активен</option>
                <option value="inactive" <?= $status_filter === 'inactive' ? 'selected' : '' ?>>Заблокирован</option>
            </select>
        </div>
        <div class="filter-group">
            <button type="submit" class="btn-filter"><i class="fas fa-filter"></i> Применить</button>
        </div>
        <div class="filter-group">
            <a href="users.php" class="btn-reset"><i class="fas fa-times-circle"></i> Сбросить</a>
        </div>
    </form>

    <div class="info-bar">
        <p><i class="fas fa-database"></i> Найдено записей: <?= $total ?></p>
        <p><i class="fas fa-layer-group"></i> Страница <?= $page ?> из <?= $totalPages ?></p>
    </div>

    <table>
        <thead>
            <tr>
                <th onclick="window.location='<?= buildUrl(['sort' => 'id', 'order' => ($sort == 'id' && $order == 'DESC') ? 'asc' : 'desc', 'page' => 1]) ?>'">
                    ID
                    <span class="sort-icon">
                        <?php if ($sort == 'id'): ?>
                            <i class="fas fa-sort-<?= $order == 'ASC' ? 'up' : 'down' ?>"></i>
                        <?php else: ?>
                            <i class="fas fa-sort"></i>
                        <?php endif; ?>
                    </span>
                </th>
                <th onclick="window.location='<?= buildUrl(['sort' => 'full_name', 'order' => ($sort == 'full_name' && $order == 'DESC') ? 'asc' : 'desc', 'page' => 1]) ?>'">
                    Имя
                    <span class="sort-icon">
                        <?php if ($sort == 'full_name'): ?>
                            <i class="fas fa-sort-<?= $order == 'ASC' ? 'up' : 'down' ?>"></i>
                        <?php else: ?>
                            <i class="fas fa-sort"></i>
                        <?php endif; ?>
                    </span>
                </th>
                <th onclick="window.location='<?= buildUrl(['sort' => 'email', 'order' => ($sort == 'email' && $order == 'DESC') ? 'asc' : 'desc', 'page' => 1]) ?>'">
                    Email
                    <span class="sort-icon">
                        <?php if ($sort == 'email'): ?>
                            <i class="fas fa-sort-<?= $order == 'ASC' ? 'up' : 'down' ?>"></i>
                        <?php else: ?>
                            <i class="fas fa-sort"></i>
                        <?php endif; ?>
                    </span>
                </th>
                <th>Телефон</th>
                <th>Роль</th>
                <th>Статус</th>
                <th onclick="window.location='<?= buildUrl(['sort' => 'created_at', 'order' => ($sort == 'created_at' && $order == 'DESC') ? 'asc' : 'desc', 'page' => 1]) ?>'">
                    Дата регистрации
                    <span class="sort-icon">
                        <?php if ($sort == 'created_at'): ?>
                            <i class="fas fa-sort-<?= $order == 'ASC' ? 'up' : 'down' ?>"></i>
                        <?php else: ?>
                            <i class="fas fa-sort"></i>
                        <?php endif; ?>
                    </span>
                </th>
                <th>Действия</th>
            </tr>
        </thead>
        <tbody>
        <?php if (count($users) > 0): ?>
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
        <?php else: ?>
             <tr><td colspan="8" style="text-align:center; padding:40px;">Пользователи не найдены</td></tr>
        <?php endif; ?>
        </tbody>
    </table>

    <?php if ($totalPages > 1): ?>
        <div class="pagination">
            <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                <a href="<?= buildUrl(['page' => $i]) ?>" class="<?= $i == $page ? 'active' : '' ?>"><?= $i ?></a>
            <?php endfor; ?>
        </div>
    <?php endif; ?>

    <a href="admin.php" class="back-btn"><i class="fas fa-arrow-left"></i> Вернуться в панель</a>
</div>
</body>
</html>
// admin-checker.js
console.log('=== ADMIN CHECKER LOADED ===');

// Функция проверки прав администратора (синхронная по localStorage)
function isAdminSync() {
    const userStr = localStorage.getItem('vinylneon_user');
    if (!userStr) return false;
    try {
        const user = JSON.parse(userStr);
        // Админ если роль admin или id=1 (fill)
        return user.role === 'admin' || user.id === 1;
    } catch (e) {
        return false;
    }
}

// Функция открытия админ-панели
function openAdminPanel() {
    console.log('Открытие админ-панели...');
    const token = localStorage.getItem('vinylneon_token');
    if (!token) {
        alert('Вы не авторизованы');
        return false;
    }
    if (!isAdminSync()) {
        alert('У вас недостаточно прав для доступа к админ-панели');
        return false;
    }
    const url = 'api/admin/admin.php?token=' + encodeURIComponent(token);
    window.open(url, '_blank');
    return true;
}

// Функция показа/скрытия пункта меню и установка обработчика
function initAdminMenuItem() {
    const adminNavItem = document.getElementById('adminNavItem');
    const adminPanelLink = document.getElementById('adminPanelLink');
    if (!adminNavItem || !adminPanelLink) {
        console.log('Элементы админ-панели не найдены в DOM');
        return;
    }

    if (isAdminSync()) {
        adminNavItem.style.display = 'block';
        console.log('Админ-панель показана');

        // Удаляем старые обработчики и вешаем новый
        adminPanelLink.replaceWith(adminPanelLink.cloneNode(true));
        const newLink = document.getElementById('adminPanelLink');
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openAdminPanel();
        });
    } else {
        adminNavItem.style.display = 'none';
        console.log('Админ-панель скрыта');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initAdminMenuItem);

// Если DOM уже загружен
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminMenuItem);
} else {
    initAdminMenuItem();
}

// Экспорт
window.AdminChecker = {
    isAdminSync,
    openAdminPanel,
    initAdminMenuItem
};
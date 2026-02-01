// admin-checker.js
console.log('=== ADMIN CHECKER LOADED ===');

// Функция проверки прав администратора
async function checkAdminRole() {
    console.log('Проверка прав администратора...');
    
    const token = localStorage.getItem('vinylneon_token');
    const userStr = localStorage.getItem('vinylneon_user');
    
    if (!token || !userStr) {
        console.log('Нет токена или данных пользователя');
        return false;
    }
    
    try {
        // Вариант 1: Проверяем через API (если есть бэкенд)
        // const response = await fetch('http://localhost:3000/api/auth/check-admin', {
        //     headers: {
        //         'Authorization': `Bearer ${token}`
        //     }
        // });
        // if (response.ok) {
        //     const data = await response.json();
        //     return data.isAdmin === true;
        // }
        
        // Вариант 2: Проверяем локально (для тестирования)
        const user = JSON.parse(userStr);
        console.log('Данные пользователя:', user);
        
        // Проверяем поле role
        if (user.role === 'admin') {
            console.log('Пользователь является администратором');
            return true;
        }
        
        // Если поля role нет, проверяем по ID или email (для fill с id=1)
        if (user.id === 1 || user.email === 'fill@gmail.com') {
            console.log('Пользователь fill является администратором');
            return true;
        }
        
        console.log('Пользователь не является администратором');
        return false;
        
    } catch (error) {
        console.error('Ошибка проверки прав:', error);
        return false;
    }
}

// Функция показа/скрытия админ-панели
function toggleAdminPanel(show) {
    const adminNavItem = document.getElementById('adminNavItem');
    const adminPanelLink = document.getElementById('adminPanelLink');
    
    if (!adminNavItem || !adminPanelLink) {
        console.log('Элементы админ-панели не найдены в DOM');
        return;
    }
    
    if (show) {
        adminNavItem.style.display = 'block';
        console.log('Админ-панель показана');
        
        // Добавляем обработчик клика
        adminPanelLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Клик по админ-панели');
            openAdminPanel();
        });
    } else {
        adminNavItem.style.display = 'none';
        console.log('Админ-панель скрыта');
    }
}

// Функция открытия админ-панели
function openAdminPanel() {
    console.log('Открытие админ-панели...');
    
    // Проверяем права перед открытием
    checkAdminRole().then(isAdmin => {
        if (isAdmin) {
            // Открываем в новой вкладке
            window.open('admin.html', '_blank');
            console.log('Админ-панель открыта');
        } else {
            alert('У вас недостаточно прав для доступа к админ-панели');
            console.log('Недостаточно прав');
        }
    });
}

// Функция инициализации
async function initAdminChecker() {
    console.log('Инициализация проверки админ-прав...');
    
    // Ждем загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async function() {
            const isAdmin = await checkAdminRole();
            toggleAdminPanel(isAdmin);
        });
    } else {
        const isAdmin = await checkAdminRole();
        toggleAdminPanel(isAdmin);
    }
}

// Автоматическая инициализация при загрузке страницы
initAdminChecker();

// Экспорт функций для использования в других файлах
window.AdminChecker = {
    checkAdminRole,
    toggleAdminPanel,
    openAdminPanel,
    initAdminChecker
};
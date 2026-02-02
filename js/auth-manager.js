// auth-manager.js
// Менеджер аутентификации для VinylNeon

console.log('=== AUTH MANAGER LOADED ===');

// Конфигурация API
const API_BASE_URL = 'http://localhost:3000/api';
const AUTH_ENDPOINTS = {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    verify: `${API_BASE_URL}/auth/verify`,
    profile: `${API_BASE_URL}/auth/profile`
};

// Состояние аутентификации
let authState = {
    isAuthenticated: false,
    user: null,
    token: null,
    role: null
};

// Инициализация менеджера аутентификации
function initAuthManager() {
    console.log('Инициализация менеджера аутентификации...');
    
    // Восстанавливаем состояние из localStorage
    restoreAuthState();
    
    // Проверяем токен при загрузке
    checkTokenValidity();
    
    // Настраиваем перехватчики для защищенных запросов
    setupRequestInterceptors();
    
    console.log('Менеджер аутентификации инициализирован:', authState);
    
    // Если страница требует аутентификации - проверяем
    if (requiresAuth()) {
        ensureAuthenticated();
    }
}

// Восстановление состояния из localStorage
function restoreAuthState() {
    const token = localStorage.getItem('vinylneon_token');
    const userStr = localStorage.getItem('vinylneon_user');
    
    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            authState = {
                isAuthenticated: true,
                user: user,
                token: token,
                role: user.role || 'user'
            };
            console.log('Состояние восстановлено:', authState);
        } catch (e) {
            console.error('Ошибка парсинга пользователя:', e);
            clearAuthState();
        }
    }
}

// Проверка валидности токена
async function checkTokenValidity() {
    if (!authState.token) return false;
    
    try {
        const response = await fetch(AUTH_ENDPOINTS.verify, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authState.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.valid) {
                console.log('Токен валиден');
                return true;
            }
        }
    } catch (error) {
        console.error('Ошибка проверки токена:', error);
    }
    
    // Токен не валиден - очищаем состояние
    console.log('Токен не валиден, очищаем состояние');
    clearAuthState();
    return false;
}

// Вход в систему
async function login(email, password) {
    console.log('Попытка входа:', email);
    
    try {
        const response = await fetch(AUTH_ENDPOINTS.login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Сохраняем данные аутентификации
            handleLoginResponse(data);
            
            // Обновляем UI
            updateUIAfterAuth();
            
            console.log('Успешный вход:', data.user);
            return { success: true, user: data.user };
        } else {
            console.error('Ошибка входа:', data.message);
            return { 
                success: false, 
                message: data.message || 'Ошибка входа' 
            };
        }
    } catch (error) {
        console.error('Ошибка сети при входе:', error);
        return { 
            success: false, 
            message: 'Ошибка сети. Попробуйте позже.' 
        };
    }
}

// Регистрация нового пользователя
async function register(userData) {
    console.log('Попытка регистрации:', userData.email);
    
    try {
        const response = await fetch(AUTH_ENDPOINTS.register, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Автоматически входим после регистрации
            if (data.token && data.user) {
                handleLoginResponse(data);
                updateUIAfterAuth();
            }
            
            console.log('Успешная регистрация:', data.user);
            return { success: true, user: data.user };
        } else {
            console.error('Ошибка регистрации:', data.message);
            return { 
                success: false, 
                message: data.message || 'Ошибка регистрации' 
            };
        }
    } catch (error) {
        console.error('Ошибка сети при регистрации:', error);
        return { 
            success: false, 
            message: 'Ошибка сети. Попробуйте позже.' 
        };
    }
}

// Обработка успешного ответа при входе/регистрации
function handleLoginResponse(data) {
    if (!data.token || !data.user) {
        throw new Error('Некорректный ответ от сервера');
    }
    
    // Сохраняем токен
    localStorage.setItem('vinylneon_token', data.token);
    
    // Сохраняем данные пользователя
    const userData = {
        id: data.user.id,
        name: data.user.name || data.user.email.split('@')[0],
        email: data.user.email,
        role: data.user.role || 'user',
        created_at: data.user.created_at || new Date().toISOString(),
        bonus_points: data.user.bonus_points || 0,
        discount: data.user.discount || 0
    };
    
    localStorage.setItem('vinylneon_user', JSON.stringify(userData));
    
    // Обновляем состояние
    authState = {
        isAuthenticated: true,
        user: userData,
        token: data.token,
        role: userData.role
    };
    
    console.log('Данные аутентификации сохранены');
}

// Выход из системы
async function logout() {
    console.log('Выход из системы...');
    
    try {
        // Отправляем запрос на сервер для инвалидации токена
        if (authState.token) {
            await fetch(AUTH_ENDPOINTS.logout, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authState.token}`,
                    'Content-Type': 'application/json'
                }
            });
        }
    } catch (error) {
        console.error('Ошибка при выходе:', error);
    } finally {
        // Всегда очищаем локальные данные
        clearAuthState();
        
        // Обновляем UI
        updateUIAfterLogout();
        
        console.log('Успешный выход из системы');
    }
}

// Очистка состояния аутентификации
function clearAuthState() {
    localStorage.removeItem('vinylneon_token');
    localStorage.removeItem('vinylneon_user');
    
    authState = {
        isAuthenticated: false,
        user: null,
        token: null,
        role: null
    };
    
    console.log('Состояние аутентификации очищено');
}

// Получение данных профиля
async function getProfile() {
    if (!authState.token) {
        console.error('Нет токена для запроса профиля');
        return null;
    }
    
    try {
        const response = await fetch(AUTH_ENDPOINTS.profile, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authState.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Данные профиля получены:', data);
            return data;
        }
    } catch (error) {
        console.error('Ошибка получения профиля:', error);
    }
    
    return null;
}

// Проверка аутентификации
function isAuthenticated() {
    return authState.isAuthenticated && !!authState.token;
}

// Проверка прав администратора
function isAdmin() {
    return authState.isAuthenticated && authState.role === 'admin';
}

// Получение текущего пользователя
function getCurrentUser() {
    return authState.user;
}

// Получение токена
function getToken() {
    return authState.token;
}

// Обновление UI после аутентификации
function updateUIAfterAuth() {
    // Обновляем навигацию
    updateNavigation();
    
    // Обновляем элементы с данными пользователя
    updateUserElements();
    
    // Диспатчим событие об изменении аутентификации
    window.dispatchEvent(new CustomEvent('authChange', { 
        detail: { isAuthenticated: true, user: authState.user } 
    }));
}

// Обновление UI после выхода
function updateUIAfterLogout() {
    // Обновляем навигацию
    updateNavigation();
    
    // Диспатчим событие об изменении аутентификации
    window.dispatchEvent(new CustomEvent('authChange', { 
        detail: { isAuthenticated: false, user: null } 
    }));
    
    // Перенаправляем на главную, если находимся на защищенной странице
    if (requiresAuth()) {
        window.location.href = 'index.html';
    }
}

// Обновление навигации
function updateNavigation() {
    const authLinks = document.querySelectorAll('.auth-link');
    const userLinks = document.querySelectorAll('.user-link');
    const adminLinks = document.querySelectorAll('.admin-link');
    
    if (isAuthenticated()) {
        // Показываем элементы для авторизованных пользователей
        userLinks.forEach(link => {
            link.style.display = '';
        });
        
        // Скрываем элементы для неавторизованных пользователей
        authLinks.forEach(link => {
            link.style.display = 'none';
        });
        
        // Показываем элементы для администраторов
        if (isAdmin()) {
            adminLinks.forEach(link => {
                link.style.display = '';
            });
            
            // Показываем пункт админ-панели в профиле
            const adminNavItem = document.getElementById('adminNavItem');
            if (adminNavItem) {
                adminNavItem.style.display = 'block';
            }
        } else {
            adminLinks.forEach(link => {
                link.style.display = 'none';
            });
        }
    } else {
        // Показываем элементы для неавторизованных пользователей
        authLinks.forEach(link => {
            link.style.display = '';
        });
        
        // Скрываем элементы для авторизованных пользователей
        userLinks.forEach(link => {
            link.style.display = 'none';
        });
        
        // Скрываем элементы для администраторов
        adminLinks.forEach(link => {
            link.style.display = 'none';
        });
    }
}

// Обновление элементов с данными пользователя
function updateUserElements() {
    if (!authState.user) return;
    
    // Обновляем имя пользователя
    document.querySelectorAll('.user-name-display').forEach(element => {
        element.textContent = authState.user.name;
    });
    
    // Обновляем email
    document.querySelectorAll('.user-email-display').forEach(element => {
        element.textContent = authState.user.email;
    });
    
    // Обновляем аватар
    document.querySelectorAll('.user-avatar-initials').forEach(element => {
        element.textContent = getInitials(authState.user.name);
    });
}

// Получение инициалов из имени
function getInitials(name) {
    if (!name) return '??';
    return name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Проверка, требуется ли аутентификация для текущей страницы
function requiresAuth() {
    const protectedPages = ['user.html', 'admin.html', 'profile.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    return protectedPages.includes(currentPage);
}

// Гарантия аутентификации
function ensureAuthenticated() {
    if (!isAuthenticated()) {
        console.log('Требуется аутентификация, перенаправляем...');
        window.location.href = 'index.html';
        return false;
    }
    
    // Проверяем права администратора для админ-панели
    if (window.location.pathname.includes('admin.html') && !isAdmin()) {
        console.log('Недостаточно прав для админ-панели');
        alert('У вас недостаточно прав для доступа к админ-панели');
        window.location.href = 'user.html';
        return false;
    }
    
    return true;
}

// Настройка перехватчиков запросов
function setupRequestInterceptors() {
    // Сохраняем оригинальный fetch
    const originalFetch = window.fetch;
    
    // Перехватываем все fetch-запросы
    window.fetch = async function(...args) {
        // Если запрос идет к нашему API и у нас есть токен - добавляем заголовок
        if (args[0] && typeof args[0] === 'string' && 
            args[0].includes(API_BASE_URL) && 
            authState.token) {
            
            // Если это options - пропускаем
            if (!args[1]) args[1] = {};
            if (!args[1].headers) args[1].headers = {};
            
            // Добавляем токен авторизации
            args[1].headers['Authorization'] = `Bearer ${authState.token}`;
            
            console.log('Добавлен токен к запросу:', args[0]);
        }
        
        return originalFetch.apply(this, args);
    };
}

// В auth-manager.js добавьте или обновите функцию getUserRole
async function getUserRole() {
    const token = localStorage.getItem('vinylneon_token');
    
    if (!token) {
        return null;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.role || 'user';
        }
    } catch (error) {
        console.error('Ошибка получения роли:', error);
    }
    
    return null;
}

// Обновляем состояние пользователя при загрузке
async function updateUserRole() {
    const role = await getUserRole();
    const user = JSON.parse(localStorage.getItem('vinylneon_user') || '{}');
    
    if (role && user) {
        user.role = role;
        localStorage.setItem('vinylneon_user', JSON.stringify(user));
        
        // Обновляем UI
        if (role === 'admin') {
            document.getElementById('adminNavItem').style.display = 'block';
        }
    }
}

// Вызываем при загрузке страницы
if (window.location.pathname.includes('user.html')) {
    document.addEventListener('DOMContentLoaded', updateUserRole);
}

// При успешном входе сохраняем роль пользователя
function handleLoginSuccess(userData) {
    // Сохраняем токен
    localStorage.setItem('vinylneon_token', userData.token);
    
    // Сохраняем данные пользователя с ролью
    const userToSave = {
        id: userData.id || 1,
        username: userData.username || 'fill',
        email: userData.email || 'fill@gmail.com',
        name: userData.name || 'Филипп Иванов',
        role: userData.role || 'admin', // Важно: сохраняем роль!
        created_at: userData.created_at,
        bonus_points: userData.bonus_points || 1540,
        discount: userData.discount || 5
    };
    
    localStorage.setItem('vinylneon_user', JSON.stringify(userToSave));
    console.log('Пользователь сохранен:', userToSave);
}

// Тестовая функция для отладки (удалить в продакшене)
function testAdminLogin() {
    console.log('Тестовый вход как администратор...');
    
    // Тестовые данные администратора
    const testAdminData = {
        id: 1,
        name: 'Иван Козлов',
        email: 'admin@vinylneon.ru',
        role: 'admin',
        created_at: '2024-01-15T10:30:00Z',
        bonus_points: 1540,
        discount: 5
    };
    
    // Сохраняем тестовые данные
    localStorage.setItem('vinylneon_token', 'test_admin_token_' + Date.now());
    localStorage.setItem('vinylneon_user', JSON.stringify(testAdminData));
    
    // Обновляем состояние
    authState = {
        isAuthenticated: true,
        user: testAdminData,
        token: localStorage.getItem('vinylneon_token'),
        role: 'admin'
    };
    
    // Обновляем UI
    updateUIAfterAuth();
    
    console.log('Тестовый администратор вошел в систему:', testAdminData);
    alert('Тестовый администратор успешно вошел в систему!');
    
    // Обновляем страницу
    window.location.reload();
}

// Публичный API
window.AuthManager = {
    init: initAuthManager,
    login,
    register,
    logout,
    getProfile,
    isAuthenticated,
    isAdmin,
    getCurrentUser,
    getToken,
    ensureAuthenticated,
    updateNavigation,
    
    // Отладочные функции (удалить в продакшене)
    testAdminLogin,
    getState: () => ({ ...authState })
};

// Автоматическая инициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthManager);
} else {
    initAuthManager();
}

// Экспорт для использования в других модулях
// export {
//     login,
//     register,
//     logout,
//     isAuthenticated,
//     isAdmin,
//     getCurrentUser,
//     getToken,
//     ensureAuthenticated
// };
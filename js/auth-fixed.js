// auth-fixed.js - Исправленная система авторизации с БД

const API_BASE = window.location.origin;
const API = {
    login: '/api/auth/login.php',
    register: '/api/auth/register.php',
    logout: '/api/auth/logout.php',
    check: '/api/auth/check.php'
};

let currentUser = null;
let authToken = null;

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

// Проверка авторизации
function checkAuth() {
    const token = localStorage.getItem('vinylneon_token');
    const userStr = localStorage.getItem('vinylneon_user');
    
    if (token && userStr) {
        try {
            currentUser = JSON.parse(userStr);
            authToken = token;
            updateUI();
            
            // Загружаем счетчики
            loadUserCounters();
            
            return true;
        } catch (e) {
            console.error('Ошибка парсинга пользователя:', e);
            clearAuth();
            return false;
        }
    }
    
    updateUI();
    // Если пользователь не авторизован, показываем 0
    updateHeaderCounters(0, 0);
    return false;
}

// Очистка авторизации
function clearAuth() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('vinylneon_token');
    localStorage.removeItem('vinylneon_user');
    updateUI();
    
    // Сбрасываем счетчики
    updateHeaderCounters(0, 0);
}

// Обновление интерфейса
function updateUI() {
    const authText = document.getElementById('auth-text');
    const dropdownUsername = document.getElementById('dropdownUsername');
    const dropdownEmail = document.getElementById('dropdownEmail');
    const userAvatar = document.getElementById('userAvatar');
    
    if (currentUser && authToken) {
        // Пользователь авторизован
        if (authText) authText.textContent = currentUser.username || 'Профиль';
        if (dropdownUsername) dropdownUsername.textContent = currentUser.username || 'Пользователь';
        if (dropdownEmail) dropdownEmail.textContent = currentUser.email || '';
        
        // Аватар
        if (userAvatar) {
            const firstLetter = (currentUser.username || 'U').charAt(0).toUpperCase();
            userAvatar.textContent = firstLetter;
            userAvatar.style.background = getAvatarColor(firstLetter);
        }
        
        // Закрываем все модальные окна
        closeAllModals();
        
    } else {
        // Пользователь не авторизован
        if (authText) authText.textContent = 'Войти';
        if (dropdownUsername) dropdownUsername.textContent = 'Гость';
        if (dropdownEmail) dropdownEmail.textContent = 'Не авторизован';
        if (userAvatar) {
            userAvatar.textContent = 'U';
            userAvatar.style.background = '#333';
        }
        
        // Закрываем выпадающее меню
        closeDropdown();
    }
}

// Цвет для аватара
function getAvatarColor(letter) {
    const colors = ['#ff2f92', '#00ff9d', '#00f0ff', '#6d5cff', '#ff9900'];
    const index = letter.charCodeAt(0) % colors.length;
    return colors[index];
}

// ========== РАБОТА С ОКНАМИ ==========

// Обновите функцию openModal для поддержки нового модального окна
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Закрываем выпадающее меню
        closeDropdown();
        
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
            document.body.classList.add('modal-open');
        }, 10);
        
        // Если это detailsModal, добавляем специальный класс
        if (modalId === 'detailsModal') {
            modal.classList.add('details-modal-open');
        }
    }
}

// Обновите функцию closeModal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
            
            // Убираем специальный класс
            if (modalId === 'detailsModal') {
                modal.classList.remove('details-modal-open');
            }
        }, 300);
    }
}

// Обновите функцию closeAllModals
function closeAllModals() {
    document.querySelectorAll('.auth-modal, .cart-modal, .favorites-modal, .details-modal').forEach(modal => {
        modal.classList.remove('show');
        modal.style.display = 'none';
    });
    document.body.classList.remove('modal-open');
}

// Показать/скрыть выпадающее меню
function toggleDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        if (dropdown.style.display === 'block') {
            closeDropdown();
        } else {
            showDropdown();
        }
    }
}

// Показать выпадающее меню
function showDropdown() {
    const dropdown = document.getElementById('userDropdown');
    const button = document.getElementById('header-button');
    
    if (dropdown && button) {
        // Закрываем все модальные окна
        closeAllModals();
        
        // Позиционируем меню
        const rect = button.getBoundingClientRect();
        dropdown.style.cssText = `
            display: block !important;
            position: fixed !important;
            top: ${rect.bottom + 10}px !important;
            right: 20px !important;
            z-index: 99999 !important;
            background: #0a0a0f !important;
            border: 2px solid #00ff9d !important;
            border-radius: 10px !important;
            min-width: 280px !important;
            padding: 20px !important;
            box-shadow: 0 0 30px rgba(0, 255, 157, 0.7) !important;
        `;
    }
}

// Закрыть выпадающее меню
function closeDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

// ========== API ФУНКЦИИ ==========

// Запрос к API
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' },
        };
        
        if (data) options.body = JSON.stringify(data);
        
        const response = await fetch(API_BASE + endpoint, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API ошибка:', error);
        return { success: false, message: 'Ошибка соединения' };
    }
}

// Вход
async function login(username, password) {
    const result = await apiRequest(API.login, 'POST', { username, password });
    
    if (result.success) {
        currentUser = result.user;
        authToken = result.token;
        
        localStorage.setItem('vinylneon_token', result.token);
        localStorage.setItem('vinylneon_user', JSON.stringify(result.user));
        
        updateUI();
        closeAllModals();
        showNotification('Вход выполнен успешно!', 'success');
        
        // Загружаем счетчики после входа
        setTimeout(() => {
            loadUserCounters();
        }, 500);
        
        return true;
    } else {
        showNotification(result.message || 'Ошибка входа', 'error');
        return false;
    }
}

// Регистрация
async function register(username, email, password, confirmPassword) {
    const result = await apiRequest(API.register, 'POST', {
        username,
        email,
        password,
        confirm_password: confirmPassword
    });
    
    if (result.success) {
        showNotification('Регистрация успешна!', 'success');
        closeModal('registerModal');
        
        // Автоматический вход после регистрации
        const loginResult = await login(username, password);
        if (loginResult) {
            showNotification('Автоматический вход выполнен', 'success');
        }
        
        return true;
    } else {
        showNotification(result.message || 'Ошибка регистрации', 'error');
        return false;
    }
}

// Выход
async function logout() {
    const result = await apiRequest(API.logout, 'POST', { token: authToken });
    
    if (result.success) {
        clearAuth();
        closeDropdown();
        showNotification('Вы вышли из системы', 'info');
        
        // Сбрасываем счетчики
        updateHeaderCounters(0, 0);
        
        return true;
    } else {
        clearAuth();
        closeDropdown();
        showNotification('Выход выполнен', 'info');
        
        // Сбрасываем счетчики
        updateHeaderCounters(0, 0);
        
        return false;
    }
}

// ========== УВЕДОМЛЕНИЯ ==========

// Показать уведомление
function showNotification(message, type = 'info') {
    // Создаем контейнер если нет
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: ${type === 'success' ? '#00ff9d' : type === 'error' ? '#ff2f92' : '#00b3ff'};
        color: #000;
        padding: 15px 20px;
        border-radius: 5px;
        font-weight: bold;
        box-shadow: 0 0 20px ${type === 'success' ? 'rgba(0, 255, 157, 0.7)' : type === 'error' ? 'rgba(255, 47, 146, 0.7)' : 'rgba(0, 179, 255, 0.7)'};
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    container.appendChild(notification);
    
    // Автоудаление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode === container) {
                container.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ========== ЗАГРУЗКА СЧЕТЧИКОВ ==========

async function loadUserCounters() {
    console.log('Загрузка счетчиков...');
    
    if (!authToken) {
        console.log('Нет токена, сбрасываем счетчики');
        updateHeaderCounters(0, 0);
        return;
    }
    
    try {
        // Загружаем счетчики параллельно
        const [favoritesCount, cartCount] = await Promise.all([
            getFavoritesCount(),
            getCartCount()
        ]);
        
        console.log('Счетчики загружены:', { favorites: favoritesCount, cart: cartCount });
        updateHeaderCounters(favoritesCount, cartCount);
        
    } catch (error) {
        console.error('Ошибка загрузки счетчиков:', error);
        updateHeaderCounters(0, 0);
    }
}

async function getFavoritesCount() {
    try {
        console.log('Запрашиваем количество избранного...');
        const response = await fetch(API_BASE + '/api/user/favorites_count.php', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Ответ favorites_count.php:', data);
        
        return data.success ? data.count : 0;
    } catch (error) {
        console.error('Ошибка получения количества избранного:', error);
        return 0;
    }
}

async function getCartCount() {
    try {
        console.log('Запрашиваем количество корзины...');
        const response = await fetch(API_BASE + '/api/user/cart_count.php', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Ответ cart_count.php:', data);
        
        return data.success ? data.count : 0;
    } catch (error) {
        console.error('Ошибка получения количества корзины:', error);
        return 0;
    }
}

function updateHeaderCounters(favoritesCount, cartCount) {
    const favoriteCountEl = document.getElementById('favoriteCount');
    const cartCountEl = document.getElementById('cartCount');
    const favoritesCountBadge = document.getElementById('favoritesCount');
    
    if (favoriteCountEl) {
        favoriteCountEl.textContent = favoritesCount > 0 ? favoritesCount : '';
        favoriteCountEl.style.display = favoritesCount > 0 ? 'flex' : 'none';
    }
    
    if (cartCountEl) {
        cartCountEl.textContent = cartCount > 0 ? cartCount : '';
        cartCountEl.style.display = cartCount > 0 ? 'flex' : 'none';
    }
    
    if (favoritesCountBadge) {
        favoritesCountBadge.textContent = favoritesCount > 0 ? favoritesCount : '';
        favoritesCountBadge.style.display = favoritesCount > 0 ? 'flex' : 'none';
    }
    
    // Анимация при обновлении
    if (favoritesCount > 0 && favoriteCountEl) {
        favoriteCountEl.style.transform = 'scale(1.2)';
        setTimeout(() => {
            favoriteCountEl.style.transform = 'scale(1)';
        }, 300);
    }
    
    if (cartCount > 0 && cartCountEl) {
        cartCountEl.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartCountEl.style.transform = 'scale(1)';
        }, 300);
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация системы авторизации...');
    
    // Проверяем авторизацию при загрузке
    const isAuth = checkAuth();
    
    // Если авторизованы, загружаем счетчики
    if (isAuth) {
        setTimeout(() => {
            loadUserCounters();
        }, 1000);
    }
    
    // ========== ОБРАБОТЧИКИ ==========
    
    // Кнопка пользователя
    const headerButton = document.getElementById('header-button');
    if (headerButton) {
        headerButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (currentUser && authToken) {
                // Пользователь авторизован - показываем меню
                toggleDropdown();
            } else {
                // Пользователь не авторизован - показываем окно входа
                openModal('loginModal');
            }
        });
    }
    
    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = this.querySelector('[name="username"]').value.trim();
            const password = this.querySelector('[name="password"]').value;
            
            if (!username || !password) {
                showNotification('Заполните все поля', 'error');
                return;
            }
            
            const loginBtn = this.querySelector('.neon-submit-btn');
            const originalText = loginBtn.querySelector('.btn-text').textContent;
            
            // Показываем загрузку
            loginBtn.querySelector('.btn-text').textContent = 'ВХОД...';
            loginBtn.disabled = true;
            
            const success = await login(username, password);
            
            // Восстанавливаем кнопку
            loginBtn.querySelector('.btn-text').textContent = originalText;
            loginBtn.disabled = false;
            
            if (success) {
                this.reset();
            }
        });
    }
    
    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = this.querySelector('[name="username"]').value.trim();
            const email = this.querySelector('[name="email"]').value.trim();
            const password = this.querySelector('[name="password"]').value;
            const confirmPassword = this.querySelector('[name="confirm_password"]').value;
            
            if (!username || !email || !password || !confirmPassword) {
                showNotification('Заполните все поля', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Пароли не совпадают', 'error');
                return;
            }
            
            const registerBtn = this.querySelector('.neon-submit-btn');
            const originalText = registerBtn.querySelector('.btn-text').textContent;
            
            // Показываем загрузку
            registerBtn.querySelector('.btn-text').textContent = 'РЕГИСТРАЦИЯ...';
            registerBtn.disabled = true;
            
            const success = await register(username, email, password, confirmPassword);
            
            // Восстанавливаем кнопку
            registerBtn.querySelector('.btn-text').textContent = originalText;
            registerBtn.disabled = false;
            
            if (success) {
                this.reset();
            }
        });
    }
    
    // Кнопка выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            await logout();
        });
    }
    
    // Закрытие модальных окон по крестику
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.auth-modal, .cart-modal, .favorites-modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Закрытие модальных окон при клике вне окна
    document.querySelectorAll('.auth-modal, .cart-modal, .favorites-modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
            closeDropdown();
        }
    });
    
    // Закрытие выпадающего меню при клике вне его
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('userDropdown');
        const button = document.getElementById('header-button');
        
        if (dropdown && dropdown.style.display === 'block' &&
            !dropdown.contains(e.target) && 
            !button.contains(e.target)) {
            closeDropdown();
        }
    });
    
    // Переключение между окнами входа и регистрации
    document.querySelectorAll('.switch-to-register').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal('loginModal');
            openModal('registerModal');
        });
    });
    
    document.querySelectorAll('.switch-to-login').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal('registerModal');
            openModal('loginModal');
        });
    });
    
    console.log('Система авторизации инициализирована');

    // Обработчик для ссылки профиля
    const profileLink = document.querySelector('a[href="user.html"]');
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Проверяем авторизацию
            const token = localStorage.getItem('vinylneon_token');
            const user = localStorage.getItem('vinylneon_user');
            
            if (token && user) {
                console.log('Переходим на страницу профиля...');
                closeDropdown();
                setTimeout(() => {
                    window.location.href = 'user.html';
                }, 300);
            } else {
                console.log('Не авторизован, открываем вход');
                closeDropdown();
                openModal('loginModal');
            }
        });
    }
});


// Анимации для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

// Экспорт функций для использования в других файлах
window.authManager = {
    isLoggedIn: () => currentUser && authToken,
    openLoginModal: () => openModal('loginModal'),
    getToken: () => authToken,
    getUser: () => currentUser,
    loadCounters: loadUserCounters,
    updateCounters: updateHeaderCounters,
    login: login,
    logout: logout,
    checkAuth: checkAuth
};

// Делаем функции глобально доступными
window.loadUserCounters = loadUserCounters;
window.updateHeaderCounters = updateHeaderCounters;
window.showNotification = showNotification;

document.head.appendChild(style);

// Функция для загрузки и отображения избранного
async function loadFavoritesDetails() {
    if (!authToken) {
        document.getElementById('detailsBody').innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p>Для просмотра избранного необходимо авторизоваться</p>
                <button onclick="openModal('loginModal')" class="neon-btn" style="margin-top: 20px;">
                    Войти
                </button>
            </div>
        `;
        return;
    }
    
    try {
        const response = await fetch('/api/user/favorites.php', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        const detailsBody = document.getElementById('detailsBody');
        if (data.success && data.favorites && data.favorites.length > 0) {
            let html = '';
            data.favorites.forEach(item => {
                html += `
                    <div class="details-item">
                        <div class="details-item-img">
                            ${item.product_image ? 
                                `<img src="${item.product_image}" alt="${item.product_title}">` : 
                                `<div style="width:100%;height:100%;background:var(--neon-pink);display:flex;align-items:center;justify-content:center;">
                                    <i class="fas fa-headphones"></i>
                                </div>`}
                        </div>
                        <div class="details-item-info">
                            <div class="details-item-title">${item.product_title}</div>
                            <div class="details-item-price">${parseFloat(item.product_price || 0).toFixed(2)} ₽</div>
                            <div style="margin-top: 10px;">
                                <button onclick="removeFromFavoritesDetails(${item.product_id})" class="neon-btn" style="padding: 5px 10px; font-size: 0.9rem;">
                                    Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            detailsBody.innerHTML = html;
        } else {
            detailsBody.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <p style="margin-top: 20px; color: #aaa;">В избранном пока ничего нет</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Ошибка загрузки избранного:', error);
        document.getElementById('detailsBody').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #ff5555;">
                Ошибка загрузки данных
            </div>
        `;
    }
}

// Функция для загрузки и отображения корзины
async function loadCartDetails() {
    if (!authToken) {
        document.getElementById('detailsBody').innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p>Для просмотра корзины необходимо авторизоваться</p>
                <button onclick="openModal('loginModal')" class="neon-btn" style="margin-top: 20px;">
                    Войти
                </button>
            </div>
        `;
        return;
    }
    
    try {
        const response = await fetch('/api/user/cart.php', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        const detailsBody = document.getElementById('detailsBody');
        if (data.success && data.cart && data.cart.length > 0) {
            let html = '';
            let total = 0;
            
            data.cart.forEach(item => {
                const itemTotal = parseFloat(item.product_price || 0) * (item.quantity || 1);
                total += itemTotal;
                
                html += `
                    <div class="details-item">
                        <div class="details-item-img">
                            ${item.product_image ? 
                                `<img src="${item.product_image}" alt="${item.product_title}">` : 
                                `<div style="width:100%;height:100%;background:var(--neon-green);display:flex;align-items:center;justify-content:center;">
                                    <i class="fas fa-shopping-cart"></i>
                                </div>`}
                        </div>
                        <div class="details-item-info">
                            <div class="details-item-title">${item.product_title}</div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div class="details-item-price">${parseFloat(item.product_price || 0).toFixed(2)} ₽</div>
                                    <div style="color: #aaa; font-size: 0.9rem;">Количество: ${item.quantity || 1}</div>
                                </div>
                                <div style="margin-top: 10px;">
                                    <button onclick="removeFromCartDetails(${item.product_id})" class="neon-btn" style="padding: 5px 10px; font-size: 0.9rem;">
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                <div style="padding: 20px; border-top: 2px solid var(--neon-green); margin-top: 20px;">
                    <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold;">
                        <span>Итого:</span>
                        <span class="neon-text">${total.toFixed(2)} ₽</span>
                    </div>
                    <button onclick="checkoutFromDetails()" class="neon-submit-btn" style="width: 100%; margin-top: 15px;">
                        ОФОРМИТЬ ЗАКАЗ
                    </button>
                </div>
            `;
            
            detailsBody.innerHTML = html;
        } else {
            detailsBody.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--neon-green)">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <p style="margin-top: 20px; color: #aaa;">Корзина пуста</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
        document.getElementById('detailsBody').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #ff5555;">
                Ошибка загрузки данных
            </div>
        `;
    }
}

// Функции удаления из модального окна
async function removeFromFavoritesDetails(productId) {
    if (!authToken || !confirm('Удалить из избранного?')) return;
    
    try {
        const response = await fetch('/api/user/favorites.php', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ product_id: productId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Обновляем отображение
            await loadFavoritesDetails();
            
            // Обновляем счетчики
            if (window.authManager && window.authManager.loadCounters) {
                window.authManager.loadCounters();
            }
            
            // Обновляем состояние кнопок на карточках
            if (window.initializeFavoritesState) {
                window.initializeFavoritesState();
            }
            
            showNotification('Товар удален из избранного', 'success');
        }
    } catch (error) {
        console.error('Ошибка удаления из избранного:', error);
        showNotification('Ошибка удаления из избранного', 'error');
    }
}

async function removeFromCartDetails(productId) {
    if (!authToken || !confirm('Удалить из корзины?')) return;
    
    try {
        const response = await fetch('/api/user/cart.php', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ product_id: productId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Обновляем отображение
            await loadCartDetails();
            
            // Обновляем счетчики
            if (window.authManager && window.authManager.loadCounters) {
                window.authManager.loadCounters();
            }
            
            // Обновляем состояние кнопок на карточках
            if (window.initializeCartState) {
                window.initializeCartState();
            }
            
            showNotification('Товар удален из корзины', 'success');
        }
    } catch (error) {
        console.error('Ошибка удаления из корзины:', error);
        showNotification('Ошибка удаления из корзины', 'error');
    }
}

function checkoutFromDetails() {
    closeModal('detailsModal');
    openModal('cartModal');
}

// Добавьте обработчики кликов на иконки в header
document.addEventListener('DOMContentLoaded', function() {
    // ... существующий код ...
    
    // Обработчик для иконки избранного в шапке
    const favoriteBtn = document.getElementById('favoritesBtn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            document.getElementById('detailsTitle').textContent = 'ИЗБРАННОЕ';
            openModal('detailsModal');
            loadFavoritesDetails();
        });
    }
    
    // Обработчик для иконки корзины в шапке
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            document.getElementById('detailsTitle').textContent = 'КОРЗИНА';
            openModal('detailsModal');
            loadCartDetails();
        });
    }
    
    // Обработчик для ссылки избранного в выпадающем меню
    const dropdownFavoritesLink = document.querySelector('.dropdown-item[href="favorites.php"]');
    if (dropdownFavoritesLink) {
        dropdownFavoritesLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            closeDropdown();
            document.getElementById('detailsTitle').textContent = 'ИЗБРАННОЕ';
            openModal('detailsModal');
            loadFavoritesDetails();
        });
    }
    
    // Закрытие detailsModal
    const detailsModal = document.getElementById('detailsModal');
    if (detailsModal) {
        detailsModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal('detailsModal');
            }
        });
        
        const closeDetailsBtn = detailsModal.querySelector('.close-modal');
        if (closeDetailsBtn) {
            closeDetailsBtn.addEventListener('click', function() {
                closeModal('detailsModal');
            });
        }
    }
});
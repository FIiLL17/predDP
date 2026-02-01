// user.js - Полная версия с интеграцией API
console.log('=== USER.JS LOADED ===');

// Конфигурация API
const API_BASE_URL = 'http://localhost:3000/api';

// Получение токена авторизации
function getAuthToken() {
    return localStorage.getItem('vinylneon_token');
}

// Проверка авторизации
function checkAuth() {
    const token = getAuthToken();
    if (!token) {
        console.log('Пользователь не авторизован, перенаправляем...');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Проверка прав администратора через API
async function checkAdminRoleFromAPI() {
    console.log('Проверка прав администратора через API...');
    
    const token = getAuthToken();
    if (!token) {
        console.log('Токен не найден');
        return false;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/check-admin`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Ответ от API check-admin:', data);
            
            if (data.success && data.isAdmin) {
                console.log('Пользователь является администратором');
                return true;
            } else {
                console.log('Пользователь не является администратором или ошибка API');
                return false;
            }
        } else {
            console.log('Ошибка HTTP при проверке прав:', response.status);
            return false;
        }
        
    } catch (error) {
        console.error('Ошибка при проверке прав через API:', error);
        return false;
    }
}

// Получение информации о пользователе из БД
async function getUserInfoFromAPI() {
    console.log('Получение информации о пользователе из API...');
    
    const token = getAuthToken();
    if (!token) {
        console.log('Токен не найден');
        return null;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/get-user-info`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Информация о пользователе из API:', data);
            
            if (data.success) {
                return data.user;
            }
        }
        
        console.log('Ошибка при получении информации о пользователе');
        return null;
        
    } catch (error) {
        console.error('Ошибка при получении информации о пользователе:', error);
        return null;
    }
}

// Инициализация админ-панели в боковом меню
async function initAdminPanelFromAPI() {
    console.log('Инициализация админ-панели через API...');
    
    const adminNavItem = document.getElementById('adminNavItem');
    const adminPanelLink = document.getElementById('adminPanelLink');
    
    if (!adminNavItem || !adminPanelLink) {
        console.log('Элементы админ-панели не найдены в DOM');
        return;
    }
    
    // Проверяем права администратора
    const isAdmin = await checkAdminRoleFromAPI();
    
    if (isAdmin) {
        // Показываем админ-панель
        adminNavItem.style.display = 'block';
        console.log('Админ-панель показана');
        
        // Добавляем стиль для админ-пункта
        adminNavItem.style.borderLeft = '3px solid #ff00ff';
        adminNavItem.style.marginTop = '10px';
        
        // Добавляем обработчик клика
        adminPanelLink.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('Клик по админ-панели');
            
            // Дополнительная проверка перед открытием
            const isStillAdmin = await checkAdminRoleFromAPI();
            if (isStillAdmin) {
                openAdminPanel();
            } else {
                alert('У вас недостаточно прав для доступа к админ-панели');
            }
        });
        
    } else {
        // Скрываем админ-панель
        adminNavItem.style.display = 'none';
        console.log('Админ-панель скрыта');
    }
}

// Открытие админ-панели
function openAdminPanel() {
    console.log('Открытие админ-панели...');
    window.open('admin.html', '_blank');
}

// Обновление данных пользователя на странице профиля
async function updateUserProfileFromAPI() {
    console.log('Обновление данных профиля из API...');
    
    const userInfo = await getUserInfoFromAPI();
    if (!userInfo) {
        console.log('Не удалось получить информацию о пользователе');
        showLoadingError();
        return;
    }
    
    // Обновляем поля на странице
    if (userInfo.username) {
        const usernameElement = document.getElementById('profile-username');
        if (usernameElement) {
            usernameElement.textContent = userInfo.username;
        }
    }
    
    if (userInfo.email) {
        const emailElement = document.getElementById('profile-email');
        if (emailElement) {
            emailElement.textContent = userInfo.email;
        }
    }
    
    if (userInfo.created_at) {
        const createdElement = document.getElementById('profile-created');
        if (createdElement) {
            // Форматируем дату
            const date = new Date(userInfo.created_at);
            const formattedDate = date.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            createdElement.textContent = formattedDate;
        }
    }
    
    if (userInfo.id) {
        const idElement = document.getElementById('profile-id');
        if (idElement) {
            idElement.textContent = userInfo.id;
        }
    }
    
    // Обновляем имя в боковом меню
    if (userInfo.first_name && userInfo.last_name) {
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = userInfo.first_name + ' ' + userInfo.last_name;
        }
        
        // Обновляем аватар
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
            const initials = (userInfo.first_name[0] + userInfo.last_name[0]).toUpperCase();
            userAvatar.textContent = initials;
        }
    } else if (userInfo.username) {
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = userInfo.username;
        }
    }
    
    // Обновляем бонусные баллы и скидку
    if (userInfo.bonus_points !== undefined) {
        const bonusPointsElements = document.querySelectorAll('.stat-value');
        if (bonusPointsElements.length > 0) {
            bonusPointsElements[0].textContent = userInfo.bonus_points.toLocaleString('ru-RU') + ' ₽';
        }
        
        // Также обновляем в профиле
        const profileBonusElements = document.querySelectorAll('.info-value');
        profileBonusElements.forEach(el => {
            if (el.textContent.includes('1 540 ₽') || el.textContent.includes('Загрузка')) {
                el.textContent = userInfo.bonus_points.toLocaleString('ru-RU') + ' ₽';
            }
        });
    }
    
    if (userInfo.discount_percent !== undefined) {
        const discountElements = document.querySelectorAll('.stat-value');
        if (discountElements.length > 1) {
            discountElements[1].textContent = userInfo.discount_percent + '%';
        }
        
        // Также обновляем в профиле
        const profileDiscountElements = document.querySelectorAll('.info-value');
        profileDiscountElements.forEach(el => {
            if (el.textContent.includes('5%') || el.textContent.includes('Загрузка')) {
                el.textContent = userInfo.discount_percent + '%';
            }
        });
    }
    
    console.log('Данные профиля обновлены');
}

// Показать ошибку загрузки
function showLoadingError() {
    const errorMsg = 'Ошибка загрузки данных. Пожалуйста, обновите страницу.';
    
    document.querySelectorAll('.info-value').forEach(el => {
        if (el.textContent.includes('Загрузка')) {
            el.textContent = errorMsg;
            el.style.color = '#ff5555';
        }
    });
}

// Загрузка заказов пользователя
async function loadUserOrders() {
    console.log('Загрузка заказов пользователя...');
    
    const token = getAuthToken();
    if (!token) {
        console.log('Токен не найден для загрузки заказов');
        return;
    }
    
    try {
        // Временная заглушка - используем статические данные
        // В реальном приложении здесь будет запрос к API
        setTimeout(() => {
            const ordersTbody = document.getElementById('orders-tbody');
            if (ordersTbody) {
                ordersTbody.innerHTML = `
                    <tr>
                        <td class="order-id">NEON-2023-001</td>
                        <td>12.10.2023</td>
                        <td>129.95 ₽</td>
                        <td><span class="order-status status-completed">Завершен</span></td>
                        <td><button class="action-btn" onclick="viewOrderDetails('NEON-2023-001')">Детали</button></td>
                    </tr>
                    <tr>
                        <td class="order-id">NEON-2023-002</td>
                        <td>28.10.2023</td>
                        <td>75.50 ₽</td>
                        <td><span class="order-status status-processing">В обработке</span></td>
                        <td><button class="action-btn" onclick="viewOrderDetails('NEON-2023-002')">Детали</button></td>
                    </tr>
                    <tr>
                        <td class="order-id">NEON-2023-003</td>
                        <td>05.11.2023</td>
                        <td>54.99 ₽</td>
                        <td><span class="order-status status-pending">Ожидает</span></td>
                        <td><button class="action-btn" onclick="viewOrderDetails('NEON-2023-003')">Детали</button></td>
                    </tr>
                    <tr>
                        <td class="order-id">NEON-2023-004</td>
                        <td>10.11.2023</td>
                        <td>89.99 ₽</td>
                        <td><span class="order-status status-completed">Завершен</span></td>
                        <td><button class="action-btn" onclick="viewOrderDetails('NEON-2023-004')">Детали</button></td>
                    </tr>
                `;
                
                // Обновляем счетчики
                document.getElementById('orders-count').textContent = '4';
                document.getElementById('total-orders').textContent = '4';
            }
        }, 800);
        
    } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
        
        const ordersTbody = document.getElementById('orders-tbody');
        if (ordersTbody) {
            ordersTbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #ff5555;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px;"></i>
                        <p>Ошибка загрузки заказов</p>
                        <button onclick="loadUserOrders()" class="action-btn" style="margin-top: 15px;">
                            <i class="fas fa-redo"></i> Попробовать снова
                        </button>
                    </td>
                </tr>
            `;
        }
    }
}

// Загрузка избранного пользователя
async function loadUserFavorites() {
    console.log('Загрузка избранного пользователя...');
    
    const token = getAuthToken();
    if (!token) {
        console.log('Токен не найден для загрузки избранного');
        return;
    }
    
    try {
        // Временная заглушка - используем статические данные
        setTimeout(() => {
            const favoritesGrid = document.getElementById('favorites-grid');
            if (favoritesGrid) {
                favoritesGrid.innerHTML = `
                    <div class="fav-item">
                        <div class="fav-img" style="background: linear-gradient(45deg, #9d00ff, #0066ff);">
                            <i class="fas fa-record-vinyl"></i>
                        </div>
                        <div class="fav-info">
                            <h3 class="fav-title">Midnight City - M83</h3>
                            <div class="fav-price">3 500 ₽</div>
                            <div class="fav-actions">
                                <button class="remove-fav" onclick="removeFromFavorites(1)">Удалить</button>
                                <button class="add-to-cart" onclick="addToCartFromFav(1)">В корзину</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="fav-item">
                        <div class="fav-img" style="background: linear-gradient(45deg, #ff00ff, #ff3366);">
                            <i class="fas fa-record-vinyl"></i>
                        </div>
                        <div class="fav-info">
                            <h3 class="fav-title">Blinding Lights - The Weeknd</h3>
                            <div class="fav-price">4 200 ₽</div>
                            <div class="fav-actions">
                                <button class="remove-fav" onclick="removeFromFavorites(2)">Удалить</button>
                                <button class="add-to-cart" onclick="addToCartFromFav(2)">В корзину</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="fav-item">
                        <div class="fav-img" style="background: linear-gradient(45deg, #00ff0f, #00cc66);">
                            <i class="fas fa-record-vinyl"></i>
                        </div>
                        <div class="fav-info">
                            <h3 class="fav-title">Levitating - Dua Lipa</h3>
                            <div class="fav-price">3 800 ₽</div>
                            <div class="fav-actions">
                                <button class="remove-fav" onclick="removeFromFavorites(3)">Удалить</button>
                                <button class="add-to-cart" onclick="addToCartFromFav(3)">В корзину</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="fav-item">
                        <div class="fav-img" style="background: linear-gradient(45deg, #ffd700, #ff9900);">
                            <i class="fas fa-record-vinyl"></i>
                        </div>
                        <div class="fav-info">
                            <h3 class="fav-title">Stay - The Kid LAROI, Justin Bieber</h3>
                            <div class="fav-price">3 200 ₽</div>
                            <div class="fav-actions">
                                <button class="remove-fav" onclick="removeFromFavorites(4)">Удалить</button>
                                <button class="add-to-cart" onclick="addToCartFromFav(4)">В корзину</button>
                            </div>
                        </div>
                    </div>
                `;
                
                // Обновляем счетчик избранного
                document.getElementById('favorites-count').textContent = '4';
            }
        }, 800);
        
    } catch (error) {
        console.error('Ошибка при загрузке избранного:', error);
        
        const favoritesGrid = document.getElementById('favorites-grid');
        if (favoritesGrid) {
            favoritesGrid.innerHTML = `
                <div style="text-align: center; padding: 40px; width: 100%;">
                    <i class="fas fa-heart-broken" style="font-size: 3rem; color: #ff5555; margin-bottom: 20px;"></i>
                    <p style="color: #ff5555; margin-bottom: 15px;">Ошибка загрузки избранного</p>
                    <button onclick="loadUserFavorites()" class="action-btn">
                        <i class="fas fa-redo"></i> Попробовать снова
                    </button>
                </div>
            `;
        }
    }
}

// Загрузка настроек пользователя
async function loadUserSettings() {
    console.log('Загрузка настроек пользователя...');
    
    const token = getAuthToken();
    if (!token) return;
    
    try {
        // Временная заглушка
        setTimeout(() => {
            const settingsGrid = document.getElementById('settings-grid');
            if (settingsGrid) {
                // Настройки уже загружены в HTML, можно обновить значения из API
                console.log('Настройки загружены');
            }
        }, 500);
        
    } catch (error) {
        console.error('Ошибка при загрузке настроек:', error);
    }
}

// Функции для работы с избранным
function removeFromFavorites(productId) {
    if (confirm('Удалить товар из избранного?')) {
        console.log('Удаление из избранного:', productId);
        // Здесь будет запрос к API
        alert('Товар удален из избранного (заглушка)');
        loadUserFavorites(); // Перезагружаем список
    }
}

function addToCartFromFav(productId) {
    console.log('Добавление в корзину из избранного:', productId);
    // Здесь будет запрос к API
    alert('Товар добавлен в корзину (заглушка)');
}

// Функции для работы с заказами
function viewOrderDetails(orderId) {
    console.log('Просмотр деталей заказа:', orderId);
    alert(`Детали заказа ${orderId} (заглушка)`);
}

function viewAllOrders() {
    console.log('Просмотр всех заказов');
    alert('Открывается полная история заказов (заглушка)');
}

// Функции для работы с настройками
function saveSettings() {
    console.log('Сохранение настроек...');
    
    // Собираем значения переключателей
    const emailNotifications = document.querySelector('input[name="email_notifications"]').checked;
    const smsNotifications = document.querySelector('input[name="sms_notifications"]').checked;
    const twoFactorAuth = document.querySelector('input[name="two_factor_auth"]').checked;
    const newsletterSubscription = document.querySelector('input[name="newsletter_subscription"]').checked;
    
    const settings = {
        email_notifications: emailNotifications,
        sms_notifications: smsNotifications,
        two_factor_auth: twoFactorAuth,
        newsletter_subscription: newsletterSubscription
    };
    
    console.log('Настройки для сохранения:', settings);
    
    // Здесь будет запрос к API для сохранения настроек
    alert('Настройки сохранены (заглушка)');
}

function clearAllFavorites() {
    if (confirm('Вы уверены, что хотите очистить все избранное?')) {
        console.log('Очистка всего избранного');
        // Здесь будет запрос к API
        alert('Избранное очищено (заглушка)');
        loadUserFavorites(); // Перезагружаем список
    }
}

function editProfile() {
    console.log('Редактирование профиля');
    alert('Редактирование профиля (заглушка)');
}

// Навигация по вкладкам профиля
function initTabNavigation() {
    console.log('Инициализация навигации по вкладкам...');
    
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Удаляем активный класс у всех ссылок
            navLinks.forEach(l => l.classList.remove('active'));
            // Добавляем активный класс текущей ссылке
            this.classList.add('active');
            
            // Скрываем все секции
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Показываем выбранную секцию
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // При переключении на заказы или избранное - обновляем данные
                if (sectionId === 'orders') {
                    setTimeout(() => {
                        loadUserOrders();
                    }, 100);
                } else if (sectionId === 'favorites') {
                    setTimeout(() => {
                        loadUserFavorites();
                    }, 100);
                }
            }
        });
    });
}

// Выход из системы
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
                console.log('Выход из системы...');
                
                // Очищаем localStorage
                localStorage.removeItem('vinylneon_token');
                localStorage.removeItem('vinylneon_user');
                
                // Перенаправляем на главную
                window.location.href = 'index.html';
            }
        });
    }
}

// Инициализация при загрузке страницы
async function initUserPage() {
    console.log('Инициализация страницы профиля...');
    
    // Проверяем авторизацию
    if (!checkAuth()) return;
    
    // Инициализируем навигацию
    initTabNavigation();
    
    // Инициализируем кнопку выхода
    initLogout();
    
    // Загружаем данные пользователя
    await updateUserProfileFromAPI();
    
    // Инициализируем админ-панель
    await initAdminPanelFromAPI();
    
    // Загружаем данные для активной вкладки
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        const sectionId = activeSection.id;
        if (sectionId === 'orders') {
            loadUserOrders();
        } else if (sectionId === 'favorites') {
            loadUserFavorites();
        } else if (sectionId === 'settings') {
            loadUserSettings();
        }
    }
    
    console.log('Страница профиля инициализирована');
}

// Глобальные функции для отладки
window.debugUserPage = async function() {
    console.log('=== DEBUG USER PAGE ===');
    console.log('Токен:', getAuthToken());
    console.log('Пользователь:', JSON.parse(localStorage.getItem('vinylneon_user') || '{}'));
    
    const isAdmin = await checkAdminRoleFromAPI();
    console.log('Является администратором:', isAdmin);
    
    const userInfo = await getUserInfoFromAPI();
    console.log('Информация о пользователе из БД:', userInfo);
    
    alert(`Админ: ${isAdmin ? 'ДА' : 'НЕТ'}\nРоль: ${userInfo?.role || 'неизвестно'}\nID: ${userInfo?.id || 'неизвестно'}`);
};

// Запускаем инициализацию при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserPage);
} else {
    initUserPage();
}
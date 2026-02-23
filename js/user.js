// user.js - ИСПРАВЛЕННЫЙ КОД БЕЗ ДЕМО-ФУНКЦИЙ
console.log('=== USER.JS LOADED - FINAL CORRECTED ===');

// Константы
const API_BASE = '/api/user';
const YANDEX_MAPS_API_KEY = '992fa062-bf1c-46b9-9d6e-9c4b1263c9c0';

// Глобальные переменные
let yandexMap = null;
let mapPlacemark = null;
let currentAddressId = null;
let isEditingAddress = false;

// Получение токена
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

// Получение информации о пользователе
async function getUserInfoFromAPI() {
    console.log('Получение информации о пользователе из API...');
    
    const token = getAuthToken();
    if (!token) {
        console.log('Токен не найден');
        return null;
    }
    
    try {
        const response = await fetch(`${API_BASE}/profile.php?token=${encodeURIComponent(token)}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Информация о пользователе:', data);
            
            if (data.success && data.user) {
                return data.user;
            }
        } else {
            console.log('Ошибка HTTP:', response.status);
        }
        
        return null;
        
    } catch (error) {
        console.error('Ошибка при получении информации о пользователе:', error);
        return null;
    }
}

// Проверка прав администратора
async function checkAdminRoleFromAPI() {
    console.log('Проверка прав администратора...');
    
    const userInfo = await getUserInfoFromAPI();
    if (userInfo && userInfo.role === 'admin') {
        console.log('Пользователь является администратором');
        return true;
    }
    
    console.log('Пользователь не является администратором');
    return false;
}

// Инициализация админ-панели
async function initAdminPanelFromAPI() {
    console.log('Инициализация админ-панели...');
    
const adminNavItem = document.getElementById('adminNavItem');
const adminPanelLink = document.getElementById('adminPanelLink');
    
    if (!adminNavItem || !adminPanelLink) {
        console.log('Элементы админ-панели не найдены');
        return;
    }
    
    const isAdmin = await checkAdminRoleFromAPI();
    
    if (isAdmin) {
        adminNavItem.style.display = 'block';
        console.log('Админ-панель показана');
        
        adminPanelLink.addEventListener('click', function(e) {
            e.preventDefault();
            openAdminPanel();
        });
        
    } else {
        adminNavItem.style.display = 'none';
        console.log('Админ-панель скрыта');
    }
}

// Открытие админ-панели
function openAdminPanel() {
    console.log('Открытие админ-панели...');
    const token = getAuthToken();
    if (!token) {
        alert('Ошибка авторизации');
        return;
    }
    window.open('api/admin/admin.php?token=' + encodeURIComponent(token), '_blank');
}

// Обновление данных пользователя на странице
async function updateUserProfileFromAPI() {
    console.log('Обновление данных профиля...');
    
    const userInfo = await getUserInfoFromAPI();
    if (!userInfo) {
        console.log('Не удалось получить информацию о пользователе');
        showLoadingError();
        return;
    }
    
    console.log('Полученные данные:', userInfo);
    
    // Обновляем все поля
    updateElementText('profileFullName', userInfo.full_name || 'Не указано');
    updateElementText('profileEmail', userInfo.email || 'Не указано');
    updateElementText('profilePhone', userInfo.phone || 'Не указан');
    updateElementText('profileUsername', userInfo.username || 'Не указано');
    updateElementText('profileId', userInfo.id || 'Не указано');
    updateElementText('userFullName', userInfo.full_name || userInfo.username || 'Пользователь');
    
    // Дата регистрации
    if (userInfo.created_at) {
        const date = new Date(userInfo.created_at);
        const formattedDate = date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        updateElementText('profileCreated', formattedDate);
    }
    
    // Аватар
    updateUserAvatar(userInfo);
    
    // Статистика
    updateElementText('bonusPoints', (userInfo.bonus_points || 0).toLocaleString('ru-RU') + ' ₽');
    updateElementText('discountPercent', (userInfo.discount_percent || 0) + '%');
    
    console.log('Данные профиля обновлены');
}

// Вспомогательные функции
function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

function updateUserAvatar(userInfo) {
    const userAvatar = document.getElementById('userAvatar');
    if (!userAvatar) return;
    
    if (userInfo.full_name) {
        const names = userInfo.full_name.split(' ');
        const firstLetter = names[0] ? names[0][0] : '';
        const secondLetter = names[1] ? names[1][0] : names[0] ? names[0][1] || '' : '';
        userAvatar.textContent = (firstLetter + secondLetter).toUpperCase();
    } else if (userInfo.username) {
        userAvatar.textContent = userInfo.username.substring(0, 2).toUpperCase();
    } else {
        userAvatar.textContent = 'U';
    }
}

function showLoadingError() {
    document.querySelectorAll('.info-value').forEach(el => {
        if (el.textContent.includes('Загрузка')) {
            el.textContent = 'Ошибка загрузки данных';
            el.style.color = '#ff5555';
        }
    });
}

// Загрузка адресов пользователя
async function loadUserAddresses() {
    console.log('Загрузка адресов пользователя...');
    
    const token = getAuthToken();
    if (!token) {
        console.log('Токен не найден для загрузки адресов');
        return;
    }
    
    const addressesList = document.getElementById('addressesList');
    if (!addressesList) return;
    
    try {
        const response = await fetch(`${API_BASE}/addresses.php`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Адреса загружены:', data);
            
            if (data.success && data.addresses && data.addresses.length > 0) {
                renderAddressesList(data.addresses, addressesList);
            } else {
                showNoAddresses(addressesList, data.message || 'Нет сохраненных адресов');
            }
        } else {
            showNoAddresses(addressesList, 'Ошибка загрузки адресов');
        }
        
    } catch (error) {
        console.error('Ошибка при загрузке адресов:', error);
        showNoAddresses(addressesList, 'Ошибка соединения с сервером');
    }
}

function renderAddressesList(addresses, container) {
    container.innerHTML = '';
    
    // Добавляем кнопку добавления нового адреса
    const addBtn = document.createElement('div');
    addBtn.className = 'address-card add-address-btn';
    addBtn.onclick = () => openAddAddressModal();
    addBtn.innerHTML = `
        <i class="fas fa-plus-circle"></i>
        <span>Добавить новый адрес</span>
    `;
    container.appendChild(addBtn);
    
    // Добавляем существующие адреса
    addresses.forEach(address => {
        const addressCard = document.createElement('div');
        addressCard.className = `address-card ${address.is_default ? 'default' : ''}`;
        addressCard.dataset.id = address.id;
        
        // Форматируем полный адрес
        const fullAddress = formatAddress(address);
        
        addressCard.innerHTML = `
            <div class="address-header">
                <div class="address-title">
                    <i class="fas fa-${getAddressIcon(address.title)}"></i>
                    ${address.title || 'Адрес'}
                    ${address.is_default ? '<span class="default-badge">По умолчанию</span>' : ''}
                </div>
                <div class="address-actions">
                    <button class="btn-small btn-edit" onclick="event.stopPropagation(); editAddress(${address.id})">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <button class="btn-small btn-delete" onclick="event.stopPropagation(); deleteAddress(${address.id})">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                    ${!address.is_default ? 
                        `<button class="btn-small btn-set-default" onclick="event.stopPropagation(); setDefaultAddress(${address.id})">
                            <i class="fas fa-star"></i> По умолчанию
                        </button>` : ''
                    }
                </div>
            </div>
            <div class="address-details">
                <div class="address-row">
                    <span class="address-label">Получатель:</span>
                    <span class="address-value">${address.full_name || 'Не указан'}</span>
                </div>
                <div class="address-row">
                    <span class="address-label">Телефон:</span>
                    <span class="address-value">${address.phone || 'Не указан'}</span>
                </div>
                <div class="address-row">
                    <span class="address-label">Адрес:</span>
                    <span class="address-value">${fullAddress}</span>
                </div>
                ${address.notes ? `
                <div class="address-row">
                    <span class="address-label">Примечания:</span>
                    <span class="address-value">${address.notes}</span>
                </div>` : ''}
                <div class="address-row">
                    <span class="address-label">Тип:</span>
                    <span class="address-value">${address.title || 'Дом'}</span>
                </div>
                <div class="address-row">
                    <span class="address-label">Создан:</span>
                    <span class="address-value">${new Date(address.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
            </div>
        `;
        container.appendChild(addressCard);
    });
}

function formatAddress(address) {
    let parts = [];
    
    if (address.city) parts.push(`г. ${address.city}`);
    if (address.street) parts.push(`ул. ${address.street}`);
    if (address.house) parts.push(`д. ${address.house}`);
    if (address.building) parts.push(`корп. ${address.building}`);
    if (address.entrance) parts.push(`подъезд ${address.entrance}`);
    if (address.floor) parts.push(`этаж ${address.floor}`);
    if (address.apartment) parts.push(`кв. ${address.apartment}`);
    
    return parts.join(', ');
}

function getAddressIcon(title) {
    const icons = {
        'Дом': 'home',
        'Работа': 'building',
        'Квартира': 'hotel',
        'Дача': 'tree',
        'Другие': 'map-marker-alt'
    };
    return icons[title] || 'map-marker-alt';
}

function showNoAddresses(container, message) {
    container.innerHTML = `
        <div class="address-card add-address-btn" onclick="openAddAddressModal()">
            <i class="fas fa-plus-circle"></i>
            <span>Добавить первый адрес</span>
        </div>
        <div style="text-align: center; padding: 40px; width: 100%;">
            <i class="fas fa-map-marker-alt" style="font-size: 3rem; color: var(--neon-blue); margin-bottom: 20px;"></i>
            <p>${message}</p>
        </div>
    `;
}

// Загрузка заказов
async function loadUserOrders() {
    const token = getAuthToken();
    if (!token) {
        console.log('Нет токена');
        return;
    }

    try {
        const response = await fetch('/api/user/orders.php', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            renderOrders(data.orders);
        } else {
            console.error('Ошибка загрузки заказов:', data.message);
        }
    } catch (error) {
        console.error('Ошибка запроса заказов:', error);
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById('ordersTbody');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">У вас пока нет заказов</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const statusClass = getStatusClass(order.status);
        return `
            <tr>
                <td>${order.order_number}</td>
                <td>${new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                <td>${Number(order.total_amount).toLocaleString('ru-RU')} ₽</td>
                <td><span class="order-status ${statusClass}">${getStatusText(order.status)}</span></td>
                <td>
                    <button class="btn-small" onclick="viewOrderDetails(${order.id})">Детали</button>
                </td>
            </tr>
        `;
    }).join('');
}

function getStatusClass(status) {
    const map = {
        'pending': 'status-pending',
        'processing': 'status-processing',
        'shipped': 'status-shipped',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
    };
    return map[status] || 'status-pending';
}

function getStatusText(status) {
    const map = {
        'pending': 'В обработке',
        'processing': 'Готовится',
        'shipped': 'Отправлен',
        'completed': 'Выполнен',
        'cancelled': 'Отменён'
    };
    return map[status] || status;
}

function renderOrdersTable(orders, container) {
    container.innerHTML = '';
    
    orders.forEach(order => {
        const orderDate = new Date(order.created_at);
        const formattedDate = orderDate.toLocaleDateString('ru-RU');
        const formattedAmount = parseFloat(order.total_amount).toLocaleString('ru-RU') + ' ₽';
        
        const statusInfo = getOrderStatusInfo(order.status);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.order_number}</td>
            <td>${formattedDate}</td>
            <td>${formattedAmount}</td>
            <td><span class="${statusInfo.class}">${statusInfo.text}</span></td>
            <td><button class="btn-small" onclick="viewOrderDetails('${order.id}')">Детали</button></td>
        `;
        container.appendChild(row);
    });
}

function getOrderStatusInfo(status) {
    const statusMap = {
        'completed': { class: 'status-completed', text: 'Завершен' },
        'processing': { class: 'status-processing', text: 'В обработке' },
        'pending': { class: 'status-pending', text: 'Ожидает' },
        'cancelled': { class: 'status-cancelled', text: 'Отменен' },
        'shipped': { class: 'status-shipped', text: 'Отправлен' }
    };
    
    return statusMap[status] || { class: 'status-pending', text: status };
}

function showNoOrders(container, message) {
    container.innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center; padding: 40px;">
                <i class="fas fa-box-open" style="font-size: 2rem; margin-bottom: 15px; color: var(--neon-blue);"></i>
                <p>${message}</p>
            </td>
        </tr>
    `;
}

// Загрузка избранного
async function loadUserFavorites() {
    console.log('Загрузка избранного...');
    
    const token = getAuthToken();
    if (!token) {
        console.log('Токен не найден');
        return;
    }
    
    const favoritesGrid = document.getElementById('favoritesGrid');
    if (!favoritesGrid) return;
    
    try {
                const response = await fetch(`${API_BASE}/favorites.php`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        
        if (response.ok) {
            const data = await response.json();
            console.log('Избранное:', data);
            
            if (data.success && data.favorites && data.favorites.length > 0) {
                renderFavorites(data.favorites, favoritesGrid);
                updateElementText('favoritesCount', data.favorites.length);
            } else {
                showNoFavorites(favoritesGrid, data.message || 'Нет избранного');
            }
        } else {
            showNoFavorites(favoritesGrid, 'Ошибка загрузки');
        }
    } catch (error) {
        console.error('Ошибка загрузки избранного:', error);
        showNoFavorites(favoritesGrid, 'Ошибка соединения');
    }
}

function renderFavorites(favorites, container) {
    container.innerHTML = '';
    
    favorites.forEach(fav => {
        const favItem = document.createElement('div');
        favItem.className = 'fav-item';
        favItem.style.cssText = `
            background: rgba(0, 0, 0, 0.2);
            border-radius: 15px;
            padding: 15px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        `;
        
        const imageHtml = fav.product_image 
            ? `<img src="${fav.product_image}" alt="${fav.product_title}" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<div style="width: 100%; height: 100%; background: linear-gradient(45deg, var(--neon-purple), var(--neon-blue)); display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-record-vinyl" style="font-size: 2rem; color: white;"></i>
              </div>`;
        
        favItem.innerHTML = `
            <div style="width: 80px; height: 80px; border-radius: 8px; overflow: hidden; margin-right: 15px; flex-shrink: 0;">
                ${imageHtml}
            </div>
            <div style="flex-grow: 1;">
                <h3 style="margin: 0 0 8px 0; color: white; font-size: 1.1rem;">${fav.product_title}</h3>
                <div style="color: var(--neon-green); font-weight: bold; font-size: 1.2rem; margin-bottom: 10px;">
                    ${parseFloat(fav.product_price).toLocaleString('ru-RU')} ₽
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-small" onclick="removeFromFavorites(${fav.product_id})" style="padding: 5px 10px; background: #ff5555; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Удалить
                    </button>
                    <button class="btn-small" onclick="addToCartFromFav(${fav.product_id})" style="padding: 5px 10px; background: var(--neon-blue); color: black; border: none; border-radius: 5px; cursor: pointer;">
                        В корзину
                    </button>
                </div>
            </div>
        `;
        container.appendChild(favItem);
    });
}

function showNoFavorites(container, message) {
    container.innerHTML = `
        <div style="text-align: center; padding: 40px; width: 100%;">
            <i class="fas fa-heart" style="font-size: 3rem; color: var(--neon-pink); margin-bottom: 20px;"></i>
            <p>${message}</p>
        </div>
    `;
}

// Удаление из избранного
async function removeFromFavorites(productId) {
    if (!confirm('Удалить товар из избранного?')) return;
    
    const token = getAuthToken();
    if (!token) {
        alert('Ошибка авторизации');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/favorites.php`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, product_id: productId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Товар удален из избранного');
            loadUserFavorites();
        } else {
            alert(data.message || 'Ошибка удаления');
        }
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка соединения');
    }
}

function addToCartFromFav(productId) {
    console.log('Добавление в корзину:', productId);
    alert('Функция добавления в корзину находится в разработке');
}

function viewOrderDetails(orderId) {
    console.log('Просмотр заказа:', orderId);
    alert(`Детали заказа ${orderId} (в разработке)`);
}

// ==================== ФУНКЦИИ РАБОТЫ С АДРЕСАМИ ====================

function openAddAddressModal(addressId = null) {
    console.log('Открытие модального окна', addressId ? 'редактирования' : 'добавления', 'адреса...');
    console.log('addressId:', addressId);
    
    currentAddressId = addressId;
    isEditingAddress = (addressId !== null && addressId !== undefined);
    
    console.log('isEditingAddress:', isEditingAddress);
    console.log('currentAddressId:', currentAddressId);
    
    if (isEditingAddress) {
        document.getElementById('addressModalTitle').textContent = 'Редактировать адрес доставки';
        loadAddressForEditing(addressId);
    } else {
        document.getElementById('addressModalTitle').textContent = 'Добавить адрес доставки';
        clearAddressForm();
    }
    
    // Показываем модальное окно
    const modal = document.getElementById('addressModal');
    if (modal) {
        modal.classList.add('active');
        
        // Инициализируем карту
        setTimeout(initYandexMap, 100);
    }
}

async function loadAddressForEditing(addressId) {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Токен не найден');
        }
        
        console.log('Загрузка адреса для редактирования ID:', addressId);
        const response = await fetch(`${API_BASE}/addresses.php?id=${addressId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Загруженный адрес:', data);
        
        if (data.success && data.address) {
            fillAddressForm(data.address);
        } else {
            throw new Error(data.message || 'Адрес не найден');
        }
    } catch (error) {
        console.error('Ошибка загрузки адреса для редактирования:', error);
        alert('Ошибка загрузки адреса: ' + error.message);
        closeAddressModal();
    }
}

function fillAddressForm(address) {
    console.log('Заполнение формы адреса:', address);
    
    // Заполняем поля формы
    document.getElementById('recipientName').value = address.full_name || '';
    document.getElementById('recipientPhone').value = address.phone || '';
    
    // Пытаемся извлечь компоненты из полного адреса
    const fullAddress = formatAddressFromComponents(address);
    document.getElementById('fullAddress').value = fullAddress;
    
    // Заполняем поля компонентов
    document.getElementById('city').value = address.city || '';
    document.getElementById('street').value = address.street || '';
    document.getElementById('house').value = address.house || '';
    document.getElementById('building').value = address.building || '';
    document.getElementById('entrance').value = address.entrance || '';
    document.getElementById('floor').value = address.floor || '';
    document.getElementById('apartment').value = address.apartment || '';
    document.getElementById('notes').value = address.notes || '';
    document.getElementById('isOffice').checked = address.is_office == 1;
    document.getElementById('isDefault').checked = address.is_default == 1;
    
    // Устанавливаем тип адреса
    const addressType = address.title || 'Дом';
    const typeMapping = {
        'Дом': 'home',
        'Работа': 'work', 
        'Квартира': 'apartment',
        'Другие': 'other'
    };
    
    const type = typeMapping[addressType] || 'other';
    document.querySelectorAll('.address-type-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.type === type) {
            btn.classList.add('selected');
        }
    });
    
    updateMarkerInfo(fullAddress, 'Адрес загружен');
}

function formatAddressFromComponents(address) {
    let parts = [];
    
    if (address.city) parts.push(`г. ${address.city}`);
    if (address.street) parts.push(`ул. ${address.street}`);
    if (address.house) parts.push(`д. ${address.house}`);
    if (address.building) parts.push(`корп. ${address.building}`);
    if (address.entrance) parts.push(`подъезд ${address.entrance}`);
    if (address.floor) parts.push(`этаж ${address.floor}`);
    if (address.apartment) parts.push(`кв. ${address.apartment}`);
    
    return parts.join(', ');
}

function closeAddressModal() {
    const modal = document.getElementById('addressModal');
    if (modal) {
        modal.classList.remove('active');
        currentAddressId = null;
        isEditingAddress = false;
        
        // Уничтожаем карту при закрытии
        if (yandexMap) {
            yandexMap.destroy();
            yandexMap = null;
            mapPlacemark = null;
        }
    }
}

function clearAddressForm() {
    currentAddressId = null;
    isEditingAddress = false;
    
    document.getElementById('recipientName').value = '';
    document.getElementById('recipientPhone').value = '';
    document.getElementById('fullAddress').value = '';
    document.getElementById('city').value = '';
    document.getElementById('street').value = '';
    document.getElementById('house').value = '';
    document.getElementById('building').value = '';
    document.getElementById('entrance').value = '';
    document.getElementById('floor').value = '';
    document.getElementById('apartment').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('isOffice').checked = false;
    document.getElementById('isDefault').checked = false;
    
    // Сбрасываем тип адреса на "Дом"
    document.querySelectorAll('.address-type-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector('.address-type-btn[data-type="home"]').classList.add('selected');
    
    // Сбрасываем маркер на карте
    updateMarkerInfo('Выберите адрес на карте', 'Координаты появятся здесь');
}

// Сохранение адреса - ИСПРАВЛЕННАЯ ВЕРСИЯ
async function saveAddress() {
    console.log('Сохранение адреса...', isEditingAddress ? '(редактирование)' : '(создание)');
    
    try {
        // Получаем тип адреса
        const selectedBtn = document.querySelector('.address-type-btn.selected');
        if (!selectedBtn) {
            alert('Пожалуйста, выберите тип адреса');
            return;
        }
        
        const selectedType = selectedBtn.dataset.type;
        const title = selectedType === 'home' ? 'Дом' : 
                      selectedType === 'work' ? 'Работа' : 
                      selectedType === 'apartment' ? 'Квартира' : 'Другие';

        // Собираем данные формы
        const formData = {
            title: title,
            full_name: document.getElementById('recipientName').value.trim(),
            phone: document.getElementById('recipientPhone').value.trim(),
            city: document.getElementById('city').value.trim(),
            street: document.getElementById('street').value.trim(),
            house: document.getElementById('house').value.trim(),
            building: document.getElementById('building').value.trim() || '',
            entrance: document.getElementById('entrance').value.trim() || '',
            floor: document.getElementById('floor').value.trim() || '',
            apartment: document.getElementById('apartment').value.trim() || '',
            notes: document.getElementById('notes').value.trim() || '',
            is_office: document.getElementById('isOffice').checked ? 1 : 0,
            is_default: document.getElementById('isDefault').checked ? 1 : 0
        };

        // Для РЕДАКТИРОВАНИЯ добавляем ID адреса
        if (isEditingAddress && currentAddressId) {
            formData.id = parseInt(currentAddressId);
            console.log('Редактирование адреса ID:', currentAddressId);
        } else {
            console.log('Создание нового адреса');
        }

        // Валидация
        const requiredFields = ['full_name', 'phone', 'city', 'street', 'house'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                alert(`Пожалуйста, заполните поле: ${field === 'full_name' ? 'Имя получателя' : 
                                                     field === 'phone' ? 'Телефон' : 
                                                     field === 'city' ? 'Город' : 
                                                     field === 'street' ? 'Улица' : 'Дом'}`);
                return;
            }
        }

        console.log('Данные для сохранения:', formData);

        const saveBtn = document.getElementById('saveAddressBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
        saveBtn.disabled = true;

        // Определяем метод и URL
        const token = getAuthToken();
        if (!token) {
            throw new Error('Токен не найден');
        }

        // Определяем метод (PUT для редактирования, POST для создания)
        const method = isEditingAddress ? 'PUT' : 'POST';
        const url = `${API_BASE}/addresses.php`;
        
        console.log('Отправка запроса:', method, url, 'ID:', currentAddressId);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const responseText = await response.text();
        console.log('Ответ сервера:', responseText);

        try {
            const data = JSON.parse(responseText);
            
            if (data.success) {
                saveBtn.innerHTML = '<i class="fas fa-check"></i> Адрес сохранен!';
                saveBtn.style.background = 'linear-gradient(135deg, var(--neon-green), var(--neon-blue))';
                
                setTimeout(() => {
                    const message = isEditingAddress ? 'Адрес успешно обновлен!' : 'Адрес успешно сохранен!';
                    alert(message);
                    closeAddressModal();
                    loadUserAddresses(); // Обновляем список адресов
                }, 1500);
            } else {
                throw new Error(data.message || 'Ошибка сохранения');
            }
        } catch (parseError) {
            console.error('Ошибка парсинга JSON:', parseError, 'Ответ:', responseText);
            throw new Error(`Сервер вернул некорректный ответ: ${responseText.substring(0, 100)}`);
        }
        
    } catch (error) {
        console.error('Ошибка сохранения адреса:', error);
        alert('Ошибка сохранения адреса: ' + error.message);
        
        // Восстанавливаем кнопку
        const saveBtn = document.getElementById('saveAddressBtn');
        saveBtn.innerHTML = '<i class="fas fa-save"></i> ' + (isEditingAddress ? 'Обновить адрес' : 'Сохранить адрес');
        saveBtn.disabled = false;
    }
}

// Установка адреса по умолчанию
async function setDefaultAddress(addressId) {
    if (!confirm('Установить этот адрес как адрес по умолчанию?')) return;
    
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Токен не найден');
        }
        
        console.log('Установка адреса по умолчанию ID:', addressId);
        
        // Отправляем PUT запрос только с is_default
        const response = await fetch(`${API_BASE}/addresses.php`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: addressId,
                is_default: 1
            })
        });
        
        const responseText = await response.text();
        console.log('Ответ установки по умолчанию:', responseText);
        
        try {
            const data = JSON.parse(responseText);
            
            if (data.success) {
                alert('Адрес установлен как адрес по умолчанию!');
                loadUserAddresses(); // Обновляем список
            } else {
                throw new Error(data.message || 'Ошибка установки адреса по умолчанию');
            }
        } catch (parseError) {
            console.error('Ошибка парсинга JSON:', parseError);
            throw new Error('Сервер вернул некорректный ответ');
        }
    } catch (error) {
        console.error('Ошибка установки адреса по умолчанию:', error);
        alert('Ошибка: ' + error.message);
    }
}

// Удаление адреса
async function deleteAddress(addressId) {
    if (!confirm('Вы уверены, что хотите удалить этот адрес?')) return;
    
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Токен не найден');
        }
        
        console.log('Удаление адреса ID:', addressId);
        
        const response = await fetch(`${API_BASE}/addresses.php`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: addressId })
        });
        
        const responseText = await response.text();
        console.log('Ответ удаления:', responseText);
        
        try {
            const data = JSON.parse(responseText);
            
            if (data.success) {
                alert('Адрес успешно удален!');
                loadUserAddresses(); // Обновляем список
            } else {
                throw new Error(data.message || 'Ошибка удаления адреса');
            }
        } catch (parseError) {
            console.error('Ошибка парсинга JSON:', parseError);
            throw new Error('Сервер вернул некорректный ответ');
        }
    } catch (error) {
        console.error('Ошибка удаления адреса:', error);
        alert('Ошибка удаления адреса: ' + error.message);
    }
}

// Инициализация Яндекс.Карты
function initYandexMap() {
    console.log('Инициализация Яндекс.Карты...');
    
    // Загружаем API Яндекс.Карт
    if (!window.ymaps) {
        const script = document.createElement('script');
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_MAPS_API_KEY}&lang=ru_RU`;
        script.onload = () => {
            ymaps.ready(() => createMap());
        };
        document.head.appendChild(script);
    } else {
        ymaps.ready(() => createMap());
    }
}

function createMap() {
    try {
        const mapElement = document.getElementById('addressMap');
        if (!mapElement) return;
        
        // Центр карты - Калининград
        yandexMap = new ymaps.Map('addressMap', {
            center: [54.7065, 20.5110],
            zoom: 12,
            controls: ['zoomControl', 'fullscreenControl']
        }, {
            searchControlProvider: 'yandex#search'
        });
        
        // Добавляем обработчик клика на карту
        yandexMap.events.add('click', function (e) {
            const coords = e.get('coords');
            
            // Удаляем старую метку
            if (mapPlacemark) {
                yandexMap.geoObjects.remove(mapPlacemark);
            }
            
            // Добавляем новую метку
            mapPlacemark = new ymaps.Placemark(coords, {
                balloonContent: 'Выбранный адрес'
            }, {
                preset: 'islands#icon',
                iconColor: '#0ff0fc'
            });
            
            yandexMap.geoObjects.add(mapPlacemark);
            
            // Центрируем карту на метке
            yandexMap.panTo(coords, {
                flying: true
            });
            
            // Получаем адрес по координатам
            getAddressByCoords(coords);
        });
        
        // Обработчик поиска
        const searchInput = document.getElementById('mapSearch');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchAddressOnMap(this.value);
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                const query = searchInput.value.trim();
                if (query) {
                    searchAddressOnMap(query);
                }
            });
        }
        
        // Обработчик выбора типа адреса
        document.querySelectorAll('.address-type-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.address-type-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                updateAddressType(this.dataset.type);
            });
        });
        
        // Кнопка сохранения
        const saveBtn = document.getElementById('saveAddressBtn');
        if (saveBtn) {
            saveBtn.onclick = saveAddress;
        }
        
    } catch (error) {
        console.error('Ошибка при создании карты:', error);
        showMapError();
    }
}

// Получение адреса по координатам
function getAddressByCoords(coords) {
    ymaps.geocode(coords).then(function (res) {
        const firstGeoObject = res.geoObjects.get(0);
        
        if (firstGeoObject) {
            const address = firstGeoObject.getAddressLine();
            const components = firstGeoObject.getLocalities();
            
            // Заполняем поля формы
            document.getElementById('fullAddress').value = address;
            
            // Пытаемся извлечь компоненты адреса
            const city = firstGeoObject.getLocalities()[0] || '';
            const street = firstGeoObject.getThoroughfare() || '';
            const house = firstGeoObject.getPremiseNumber() || '';
            
            if (city) document.getElementById('city').value = city;
            if (street) document.getElementById('street').value = street;
            if (house) document.getElementById('house').value = house;
            
            updateMarkerInfo(address, `${coords[0].toFixed(4)}° с.ш., ${coords[1].toFixed(4)}° в.д.`);
        }
    });
}

// Поиск адреса на карте
function searchAddressOnMap(query) {
    if (!query.trim()) return;
    
    ymaps.geocode(query).then(function (res) {
        const firstGeoObject = res.geoObjects.get(0);
        
        if (firstGeoObject) {
            const coords = firstGeoObject.geometry.getCoordinates();
            
            // Удаляем старую метку
            if (mapPlacemark) {
                yandexMap.geoObjects.remove(mapPlacemark);
            }
            
            // Добавляем новую метку
            mapPlacemark = new ymaps.Placemark(coords, {
                balloonContent: 'Найденный адрес'
            }, {
                preset: 'islands#icon',
                iconColor: '#ff00ff'
            });
            
            yandexMap.geoObjects.add(mapPlacemark);
            
            // Центрируем карту на метке
            yandexMap.setCenter(coords, 16, {
                duration: 300
            });
            
            // Заполняем поля формы
            const address = firstGeoObject.getAddressLine();
            document.getElementById('fullAddress').value = address;
            document.getElementById('mapSearch').value = address;
            
            // Извлекаем компоненты адреса
            const city = firstGeoObject.getLocalities()[0] || '';
            const street = firstGeoObject.getThoroughfare() || '';
            const house = firstGeoObject.getPremiseNumber() || '';
            
            if (city) document.getElementById('city').value = city;
            if (street) document.getElementById('street').value = street;
            if (house) document.getElementById('house').value = house;
            
            updateMarkerInfo(address, `${coords[0].toFixed(4)}° с.ш., ${coords[1].toFixed(4)}° в.д.`);
        } else {
            alert('Адрес не найден. Попробуйте уточнить запрос.');
        }
    });
}

// Обновление информации о маркере
function updateMarkerInfo(address, coordinates) {
    const markerText = document.querySelector('.address-selected-text');
    const coordText = document.getElementById('coordinatesText');
    
    if (markerText) markerText.textContent = address;
    if (coordText) coordText.textContent = coordinates;
}

// Обновление типа адреса
function updateAddressType(type) {
    const apartmentField = document.getElementById('apartment');
    const notesField = document.getElementById('notes');
    
    switch(type) {
        case 'home':
            if (apartmentField) apartmentField.placeholder = '17';
            if (notesField) notesField.placeholder = 'Домофон не работает, звонить по телефону...';
            break;
        case 'work':
            if (apartmentField) apartmentField.placeholder = '305 (офис)';
            if (notesField) notesField.placeholder = 'Доставка с 9:00 до 18:00, этаж 3...';
            break;
        case 'apartment':
            if (apartmentField) apartmentField.placeholder = '42';
            if (notesField) notesField.placeholder = 'Код от подъезда: 1234...';
            break;
        case 'other':
            if (apartmentField) apartmentField.placeholder = 'Номер помещения';
            if (notesField) notesField.placeholder = 'Любая дополнительная информация...';
            break;
    }
}

// Показать ошибку карты
function showMapError() {
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div class="map-placeholder">
                <i class="fas fa-exclamation-triangle" style="color: #ff5555; font-size: 3rem; margin-bottom: 20px;"></i>
                <h3>Ошибка загрузки карты</h3>
                <p>Не удалось загрузить Яндекс.Карты</p>
                <p>Проверьте подключение к интернету</p>
            </div>
        `;
    }
}

// Навигация по вкладкам
function initTabNavigation() {
    console.log('Инициализация навигации...');
    
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            contentSections.forEach(section => section.classList.remove('active'));
            
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                setTimeout(() => {
                    if (sectionId === 'orders') loadUserOrders();
                    if (sectionId === 'favorites') loadUserFavorites();
                    if (sectionId === 'addresses') loadUserAddresses();
                }, 100);
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
                localStorage.removeItem('vinylneon_token');
                localStorage.removeItem('vinylneon_user');
                window.location.href = 'index.html';
            }
        });
    }
}

// Функции для модальных окон профиля
function openEditProfileModal() {
    console.log('Открытие окна редактирования профиля...');
    
    const modal = document.getElementById('editProfileModal');
    if (!modal) {
        console.error('Модальное окно не найдено!');
        return;
    }
    
    // Заполняем форму текущими данными
    const fullName = document.getElementById('profileFullName').textContent;
    const phone = document.getElementById('profilePhone').textContent;
    
    document.getElementById('editFullName').value = fullName === 'Не указано' ? '' : fullName;
    document.getElementById('editPhone').value = phone === 'Не указан' ? '' : phone;
    
    modal.classList.add('active');
}

function closeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function saveProfileChanges(e) {
    if (e) e.preventDefault();
    
    const token = getAuthToken();
    if (!token) {
        alert('Ошибка авторизации');
        return;
    }
    
    const formData = {
        token: token,
        full_name: document.getElementById('editFullName').value.trim(),
        phone: document.getElementById('editPhone').value.trim()
    };
    
    try {
        const response = await fetch(`${API_BASE}/update_profile.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeEditProfileModal();
            await updateUserProfileFromAPI(); // обновляем данные на странице
            alert('Профиль успешно обновлен!');
        } else {
            alert(data.message || 'Ошибка обновления');
        }
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Ошибка соединения с сервером');
    }
}

// Основная инициализация
async function initUserPage() {
    console.log('=== ИНИЦИАЛИЗАЦИЯ СТРАНИЦЫ ПРОФИЛЯ ===');
    document.getElementById('editProfileForm').addEventListener('submit', saveProfileChanges);
    // Проверяем авторизацию
    if (!checkAuth()) return;

    // ========== ОБРАБОТКА ХЕША ==========
    const hash = window.location.hash.substring(1);
    if (hash) {
        const targetLink = document.querySelector(`.nav-link[data-section="${hash}"]`);
        if (targetLink) {
            // Убираем active со всех ссылок и секций
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            
            // Активируем нужную ссылку и секцию
            targetLink.classList.add('active');
            const targetSection = document.getElementById(hash);
            if (targetSection) targetSection.classList.add('active');
        }
    }
    
    // Инициализируем компоненты
    initTabNavigation();
    initLogout();
    
    // Загружаем данные
    await updateUserProfileFromAPI();
    await initAdminPanelFromAPI();
    
    // Загружаем данные для активной вкладки
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        const sectionId = activeSection.id;
        setTimeout(() => {
            if (sectionId === 'orders') loadUserOrders();
            if (sectionId === 'favorites') loadUserFavorites();
            if (sectionId === 'addresses') loadUserAddresses();
        }, 100);
    }
    
    // ========== ОБРАБОТКА ПАРАМЕТРА order_success ==========
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('order_success')) {
        const orderNumber = urlParams.get('order_number');
        // Показываем уведомление
        setTimeout(() => {
            alert(`Заказ #${orderNumber} успешно оформлен!`);
            // Очищаем URL от параметров
            const newUrl = window.location.pathname + window.location.hash;
            history.replaceState(null, '', newUrl);
        }, 500);
    }
    
    console.log('=== СТРАНИЦА ПРОФИЛЯ УСПЕШНО ИНИЦИАЛИЗИРОВАНА ===');
}

// ==================== ГЛОБАЛЬНЫЕ ФУНКЦИИ ====================
window.openEditProfileModal = openEditProfileModal;
window.closeEditProfileModal = closeEditProfileModal;
window.openAddAddressModal = openAddAddressModal;
window.closeAddressModal = closeAddressModal;
window.saveProfileChanges = saveProfileChanges;
window.removeFromFavorites = removeFromFavorites;
window.addToCartFromFav = addToCartFromFav;
window.viewOrderDetails = viewOrderDetails;
// Только ЭТИ функции для адресов
window.editAddress = (addressId) => openAddAddressModal(addressId);
window.deleteAddress = deleteAddress;
window.setDefaultAddress = setDefaultAddress;
window.saveAddress = saveAddress;

// Запускаем инициализацию
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserPage);
} else {
    initUserPage();
}

// Отладочная функция
window.debugUserInfo = async function() {
    console.log('=== ОТЛАДКА ===');
    console.log('Токен:', getAuthToken());
    const userInfo = await getUserInfoFromAPI();
    console.log('Данные пользователя:', userInfo);
    
    if (userInfo) {
        alert(`ID: ${userInfo.id}\nИмя: ${userInfo.full_name}\nEmail: ${userInfo.email}\nРоль: ${userInfo.role}`);
    } else {
        alert('Не удалось получить данные пользователя');
    }
};
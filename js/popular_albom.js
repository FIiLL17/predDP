// Данные альбомов
const albums = [
    {
        id: 1,
        title: "Midnight City",
        artist: "M83",
        cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration: "4:04",
        price: 29.99
    },
    {
        id: 2,
        title: "Blinding Lights",
        artist: "The Weeknd",
        cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        duration: "3:22",
        price: 24.99
    },
    {
        id: 3,
        title: "Levitating",
        artist: "Dua Lipa",
        cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        duration: "3:24",
        price: 27.99
    },
    {
        id: 4,
        title: "Stay",
        artist: "The Kid LAROI, Justin Bieber",
        cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        duration: "2:23",
        price: 25.99
    },
    {
        id: 5,
        title: "Good 4 U",
        artist: "Olivia Rodrigo",
        cover: "https://images.unsplash.com/photo-1519281682544-5f37c4b14c47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        duration: "2:59",
        price: 26.99
    }
];

// Элементы DOM
const scrollTrack = document.getElementById('scrollTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const autoScrollBtn = document.getElementById('autoScrollBtn');
const manualScrollBtn = document.getElementById('manualScrollBtn');

// Настройки прокрутки
let isAutoScroll = true;
let isDragging = false;
let startX = 0;
let scrollLeft = 0;
let velocity = 0;
let animationFrameId = null;
let lastTimestamp = 0;
let scrollTimeout = null;

// Активное аудио
let activeAudio = null;
let activeCard = null;

// Расчеты для прокрутки
let cardWidth = 350;
let containerWidth = 0;
let trackWidth = 0;
let maxScroll = 0;
let currentScrollPosition = 0;

// API для работы с избранным и корзиной
const FAVORITES_API = '/api/user/favorites.php';
const CART_API = '/api/user/cart.php';

// Получение токена авторизации
function getAuthToken() {
    return localStorage.getItem('vinylneon_token');
}

// Проверка авторизации
function checkAuth() {
    const token = getAuthToken();
    const user = localStorage.getItem('vinylneon_user');
    return token && user;
}

// Показать окно авторизации
function showAuthModal() {
    if (window.openModal) {
        window.openModal('loginModal');
    } else if (window.authManager && window.authManager.openLoginModal) {
        window.authManager.openLoginModal();
    } else {
        alert('Для выполнения действия необходимо авторизоваться. Нажмите кнопку "Войти" в правом верхнем углу.');
    }
}

// Обновление отображения кнопки избранного
function updateFavoriteButton(button, isFavorite) {
    if (!button) return;
    
    const heartIcon = button.querySelector('.heart-icon');
    const heartFilledIcon = button.querySelector('.heart-filled-icon');
    
    if (isFavorite) {
        button.classList.add('favorite-active');
        if (heartIcon) heartIcon.style.display = 'none';
        if (heartFilledIcon) heartFilledIcon.style.display = 'block';
    } else {
        button.classList.remove('favorite-active');
        if (heartIcon) heartIcon.style.display = 'block';
        if (heartFilledIcon) heartFilledIcon.style.display = 'none';
    }
}

// Обновление отображения кнопки корзины
function updateCartButton(button, inCart) {
    if (!button) return;
    
    const cartIcon = button.querySelector('.cart-icon');
    const cartFilledIcon = button.querySelector('.cart-filled-icon');
    
    if (inCart) {
        button.classList.add('cart-active');
        if (cartIcon) cartIcon.style.display = 'none';
        if (cartFilledIcon) cartFilledIcon.style.display = 'block';
    } else {
        button.classList.remove('cart-active');
        if (cartIcon) cartIcon.style.display = 'block';
        if (cartFilledIcon) cartFilledIcon.style.display = 'none';
    }
}

// Инициализация состояния избранного для карточек
async function initializeFavoritesState() {
    const token = getAuthToken();
    
    if (!token || !checkAuth()) {
        document.querySelectorAll('.favorite-btn').forEach(button => {
            updateFavoriteButton(button, false);
        });
        return;
    }
    
    try {
        const response = await fetch(FAVORITES_API, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.favorites) {
            const favoriteProductIds = data.favorites.map(fav => parseInt(fav.product_id));
            
            document.querySelectorAll('.favorite-btn').forEach(button => {
                const productId = parseInt(button.dataset.productId);
                const isFavorite = favoriteProductIds.includes(productId);
                updateFavoriteButton(button, isFavorite);
            });
        }
    } catch (error) {
        console.warn('Не удалось загрузить избранное:', error.message);
    }
}

// Инициализация состояния корзины для карточек
async function initializeCartState() {
    const token = getAuthToken();
    
    if (!token || !checkAuth()) {
        document.querySelectorAll('.cart-btn').forEach(button => {
            updateCartButton(button, false);
        });
        return;
    }
    
    try {
        const response = await fetch(CART_API, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.cart) {
            const cartProductIds = data.cart.map(item => parseInt(item.product_id));
            
            document.querySelectorAll('.cart-btn').forEach(button => {
                const productId = parseInt(button.dataset.productId);
                const inCart = cartProductIds.includes(productId);
                updateCartButton(button, inCart);
            });
        }
    } catch (error) {
        console.warn('Не удалось загрузить корзину:', error.message);
    }
}

// Создание карточек альбомов
function createAlbumCard(album) {
    const card = document.createElement('div');
    card.className = 'music-card';
    card.dataset.id = album.id;
    
    card.innerHTML = `
        <div class="album-cover">
            <img src="${album.cover}" alt="${album.title}">
            <div class="wave-container">
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
            </div>
        </div>
        
        <div class="song-info">
            <h2 class="song-title">${album.title}</h2>
            <p class="artist">${album.artist}</p>
        </div>
        
        <div class="controls">
            <button class="play-btn">
                <svg class="play-icon" width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                </svg>
                <svg class="pause-icon" width="28" height="28" viewBox="0 0 24 24" fill="white" style="display: none;">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
            </button>
            
            <div class="action-buttons">
                <button class="action-btn favorite-btn" data-product-id="${album.id}" title="Добавить в избранное">
                    <svg class="heart-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <svg class="heart-filled-icon" width="22" height="22" viewBox="0 0 24 24" fill="#ff6b9d" stroke="#ff6b9d" stroke-width="2" style="display: none;">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
                <button class="action-btn cart-btn" data-product-id="${album.id}" title="Добавить в корзину">
                    <svg class="cart-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <svg class="cart-filled-icon" width="22" height="22" viewBox="0 0 24 24" fill="#3cff8c" stroke="#3cff8c" stroke-width="2" style="display: none;">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                </button>
            </div>
        </div>
        
        <div class="audio-progress">
            <div class="progress-bar">
                <div class="progress"></div>
            </div>
            <div class="time-info">
                <span class="current-time">0:00</span>
                <span class="duration">${album.duration}</span>
            </div>
        </div>
        
        <div class="price">${album.price} ₽</div>
        <div class="playing-status">Нажмите кнопку воспроизведения</div>
    `;
    
    return card;
}

// Инициализация карточек
function initAlbums() {
    const duplicatedAlbums = [...albums, ...albums, ...albums];
    
    duplicatedAlbums.forEach(album => {
        const card = createAlbumCard(album);
        scrollTrack.appendChild(card);
        
        addCardEventListeners(card, album);
    });
    
    setTimeout(() => {
        updateDimensions();
        startAutoScroll();
    }, 100);
}

// Обновление размеров
function updateDimensions() {
    const firstCard = scrollTrack.querySelector('.music-card');
    if (firstCard) {
        const rect = firstCard.getBoundingClientRect();
        cardWidth = rect.width + 30; // Ширина + отступы
    }
    
    const scrollContainer = document.querySelector('.scroll-container');
    if (scrollContainer) {
        containerWidth = scrollContainer.offsetWidth;
    } else {
        containerWidth = window.innerWidth;
    }
    
    trackWidth = scrollTrack.scrollWidth / 3; // Оригинальная ширина (одна копия)
    maxScroll = -(trackWidth - containerWidth);
    
    // Обновляем текущую позицию
    currentScrollPosition = getCurrentScrollPosition();
}

// Получение текущей позиции прокрутки
function getCurrentScrollPosition() {
    const transform = window.getComputedStyle(scrollTrack).transform;
    if (transform !== 'none') {
        const matrix = new DOMMatrix(transform);
        return matrix.m41;
    }
    return 0;
}

// Установка позиции прокрутки
function setScrollPosition(position, animate = true) {
    if (!animate) {
        scrollTrack.style.transition = 'none';
    }
    
    // Ограничиваем позицию
    let newPosition = position;
    if (position < maxScroll) {
        newPosition = maxScroll;
    } else if (position > 0) {
        newPosition = 0;
    }
    
    scrollTrack.style.transform = `translateX(${newPosition}px)`;
    currentScrollPosition = newPosition;
    
    if (!animate) {
        // Восстанавливаем transition
        setTimeout(() => {
            scrollTrack.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }, 10);
    }
}

// Прокрутка на один альбом
function scrollOneAlbum(direction) {
    if (isAutoScroll) {
        stopAutoScroll();
    }
    
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    const scrollAmount = direction * cardWidth;
    const newPosition = currentScrollPosition + scrollAmount;
    setScrollPosition(newPosition);
    
    // Блокируем повторные клики на 500ms
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    
    scrollTimeout = setTimeout(() => {
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;
    }, 500);
}

// Включение автопрокрутки
function startAutoScroll() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    scrollTrack.style.transition = 'none';
    scrollTrack.style.transform = 'translateX(0)';
    
    setTimeout(() => {
        scrollTrack.classList.add('auto-scroll');
        scrollTrack.style.animation = 'scroll-horizontal 40s linear infinite';
        scrollTrack.style.animationPlayState = 'running';
        
        if (autoScrollBtn) autoScrollBtn.classList.add('active');
        if (manualScrollBtn) manualScrollBtn.classList.remove('active');
        isAutoScroll = true;
        
        if (prevBtn) {
            prevBtn.style.opacity = '0';
            prevBtn.style.pointerEvents = 'none';
        }
        if (nextBtn) {
            nextBtn.style.opacity = '0';
            nextBtn.style.pointerEvents = 'none';
        }
    }, 10);
}

// Отключение автопрокрутки
function stopAutoScroll() {
    const transform = window.getComputedStyle(scrollTrack).transform;
    let currentX = 0;
    if (transform !== 'none') {
        const matrix = new DOMMatrix(transform);
        currentX = matrix.m41;
    }
    
    scrollTrack.classList.remove('auto-scroll');
    scrollTrack.style.animation = 'none';
    
    // Исправляем расчет позиции
    trackWidth = scrollTrack.scrollWidth / 3;
    const scrollContainer = document.querySelector('.scroll-container');
    if (scrollContainer) {
        containerWidth = scrollContainer.offsetWidth;
    }
    const calculatedMaxScroll = -(trackWidth - containerWidth);
    
    let adjustedX = currentX;
    
    // Если мы далеко за пределами, возвращаем в начало
    if (currentX < calculatedMaxScroll) {
        adjustedX = currentX + trackWidth;
    } else if (currentX > 0) {
        adjustedX = currentX - trackWidth;
    }
    
    scrollTrack.style.transition = 'none';
    scrollTrack.style.transform = `translateX(${adjustedX}px)`;
    
    setTimeout(() => {
        scrollTrack.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        currentScrollPosition = adjustedX;
    }, 50);
    
    if (autoScrollBtn) autoScrollBtn.classList.remove('active');
    if (manualScrollBtn) manualScrollBtn.classList.add('active');
    isAutoScroll = false;
    
    if (prevBtn) {
        prevBtn.style.opacity = '1';
        prevBtn.style.pointerEvents = 'auto';
    }
    if (nextBtn) {
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'auto';
    }
}

// Drag-прокрутка
function initDragScroll() {
    if (!scrollTrack) return;
    
    scrollTrack.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    scrollTrack.addEventListener('touchstart', startDragTouch);
    document.addEventListener('touchmove', dragTouch);
    document.addEventListener('touchend', endDrag);
    
    scrollTrack.addEventListener('wheel', handleWheel, { passive: false });
}

// Drag обработчики
function startDrag(e) {
    if (isAutoScroll) {
        stopAutoScroll();
    }
    
    isDragging = true;
    scrollTrack.classList.add('grabbing');
    startX = e.pageX;
    scrollLeft = currentScrollPosition;
    
    velocity = 0;
    lastTimestamp = 0;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    const x = e.pageX;
    const walk = (x - startX);
    
    let newScrollLeft = scrollLeft + walk;
    setScrollPosition(newScrollLeft, false);
    
    const now = performance.now();
    if (lastTimestamp) {
        const deltaTime = now - lastTimestamp;
        if (deltaTime > 0) {
            velocity = walk / deltaTime;
        }
    }
    lastTimestamp = now;
}

function endDrag() {
    if (!isDragging) return;
    
    isDragging = false;
    scrollTrack.classList.remove('grabbing');
    
    if (Math.abs(velocity) > 0.1) {
        startInertiaAnimation();
    }
}

// Touch обработчики
function startDragTouch(e) {
    if (isAutoScroll) {
        stopAutoScroll();
    }
    
    isDragging = true;
    scrollTrack.classList.add('grabbing');
    startX = e.touches[0].pageX;
    scrollLeft = currentScrollPosition;
    
    velocity = 0;
    lastTimestamp = 0;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function dragTouch(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    const x = e.touches[0].pageX;
    const walk = (x - startX);
    
    let newScrollLeft = scrollLeft + walk;
    setScrollPosition(newScrollLeft, false);
    
    const now = performance.now();
    if (lastTimestamp) {
        const deltaTime = now - lastTimestamp;
        if (deltaTime > 0) {
            velocity = walk / deltaTime;
        }
    }
    lastTimestamp = now;
}

// Анимация инерции
function startInertiaAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    let lastTime = performance.now();
    
    function animateInertia(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        if (Math.abs(velocity) > 0.1) {
            velocity *= 0.95;
            let newPosition = currentScrollPosition + velocity * deltaTime;
            
            setScrollPosition(newPosition, false);
            
            animationFrameId = requestAnimationFrame(animateInertia);
        } else {
            velocity = 0;
            animationFrameId = null;
        }
    }
    
    animationFrameId = requestAnimationFrame(animateInertia);
}

// Колесо мыши
function handleWheel(e) {
    e.preventDefault();
    
    if (isAutoScroll) {
        stopAutoScroll();
    }
    
    const delta = e.deltaY;
    const newPosition = currentScrollPosition + delta * 0.5;
    setScrollPosition(newPosition);
}

// Форматирование времени
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Остановка активного аудио
function stopActiveAudio() {
    if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
        
        if (activeCard) {
            const playIcon = activeCard.querySelector('.play-icon');
            const pauseIcon = activeCard.querySelector('.pause-icon');
            
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
            
            activeCard.classList.remove('playing');
            const playingStatus = activeCard.querySelector('.playing-status');
            if (playingStatus) playingStatus.textContent = 'Нажмите кнопку воспроизведения';
            
            const progress = activeCard.querySelector('.progress');
            if (progress) progress.style.width = '0%';
            
            const currentTimeEl = activeCard.querySelector('.current-time');
            if (currentTimeEl) currentTimeEl.textContent = '0:00';
        }
    }
}

// Добавление обработчиков событий для карточки
function addCardEventListeners(card, album) {
    const playBtn = card.querySelector('.play-btn');
    const favoriteBtn = card.querySelector('.favorite-btn');
    const cartBtn = card.querySelector('.cart-btn');
    const progress = card.querySelector('.progress');
    const currentTimeEl = card.querySelector('.current-time');
    const durationEl = card.querySelector('.duration');
    const playingStatus = card.querySelector('.playing-status');
    
    const playIcon = card.querySelector('.play-icon');
    const pauseIcon = card.querySelector('.pause-icon');
    
    const audio = new Audio(album.audio);
    let isPlaying = false;
    let progressInterval;
    
    // Установка длительности аудио
    audio.addEventListener('loadedmetadata', () => {
        if (durationEl) {
            durationEl.textContent = formatTime(audio.duration);
        }
    });
    
    // Обработчик кнопки воспроизведения/паузы
    playBtn.addEventListener('click', () => {
        if (activeAudio && activeAudio !== audio) {
            stopActiveAudio();
        }
        
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
        
        activeAudio = audio;
        activeCard = card;
    });
    
    // Обработчик кнопки избранного
    favoriteBtn.addEventListener('click', async () => {
        const productId = album.id;
        const productTitle = album.title;
        const productPrice = album.price;
        const productImage = album.cover;
        
        if (!checkAuth()) {
            showAuthModal();
            return;
        }
        
        const token = getAuthToken();
        if (!token) {
            showAuthModal();
            return;
        }
        
        try {
            const isCurrentlyFavorite = favoriteBtn.classList.contains('favorite-active');
            
            if (isCurrentlyFavorite) {
                // Удаляем из избранного
                const response = await fetch(FAVORITES_API, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ product_id: productId })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    updateFavoriteButton(favoriteBtn, false);
                    
                    // Обновляем счетчики
                    if (window.authManager && window.authManager.loadCounters) {
                        window.authManager.loadCounters();
                    }
                    
                    // Обновляем состояние на всех карточках
                    initializeFavoritesState();
                    
                    if (playingStatus) {
                        playingStatus.textContent = 'Удалено из избранного';
                        playingStatus.style.color = 'var(--neon-green)';
                        setTimeout(() => {
                            playingStatus.textContent = 'Нажмите кнопку воспроизведения';
                            playingStatus.style.color = '#aaa';
                        }, 2000);
                    }
                    
                    showAlbumNotification('Товар удален из избранного', 'success');
                }
            } else {
                // Добавляем в избранное
                const response = await fetch(FAVORITES_API, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        product_id: productId,
                        product_title: productTitle,
                        product_price: productPrice,
                        product_image: productImage
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    updateFavoriteButton(favoriteBtn, true);
                    
                    // Обновляем счетчики
                    if (window.authManager && window.authManager.loadCounters) {
                        window.authManager.loadCounters();
                    }
                    
                    // Обновляем состояние на всех карточках
                    initializeFavoritesState();
                    
                    if (playingStatus) {
                        playingStatus.textContent = 'Добавлено в избранное';
                        playingStatus.style.color = 'var(--neon-pink)';
                        setTimeout(() => {
                            playingStatus.textContent = 'Нажмите кнопку воспроизведения';
                            playingStatus.style.color = '#aaa';
                        }, 2000);
                    }
                    
                    showAlbumNotification('Товар добавлен в избранное', 'success');
                }
            }
        } catch (error) {
            console.error('Ошибка работы с избранным:', error);
            showAlbumNotification('Ошибка при работе с избранным', 'error');
        }
    });
    
    // Обработчик кнопки корзины (РАБОТАЕТ КАК ПЕРЕКЛЮЧАТЕЛЬ)
    cartBtn.addEventListener('click', async () => {
        const productId = album.id;
        const productTitle = album.title;
        const productPrice = album.price;
        const productImage = album.cover;
        
        if (!checkAuth()) {
            showAuthModal();
            return;
        }
        
        const token = getAuthToken();
        if (!token) {
            showAuthModal();
            return;
        }
        
        try {
            const isCurrentlyInCart = cartBtn.classList.contains('cart-active');
            
            if (isCurrentlyInCart) {
                // Удаляем из корзины
                const response = await fetch(CART_API, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ product_id: productId })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    updateCartButton(cartBtn, false);
                    
                    // Обновляем счетчики
                    if (window.authManager && window.authManager.loadCounters) {
                        window.authManager.loadCounters();
                    }
                    
                    // Обновляем состояние на всех карточках
                    initializeCartState();
                    
                    if (playingStatus) {
                        playingStatus.textContent = 'Удалено из корзины';
                        playingStatus.style.color = 'var(--neon-green)';
                        setTimeout(() => {
                            playingStatus.textContent = 'Нажмите кнопку воспроизведения';
                            playingStatus.style.color = '#aaa';
                        }, 2000);
                    }
                    
                    cartBtn.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        cartBtn.style.transform = 'scale(1)';
                    }, 300);
                    
                    showAlbumNotification('Товар удален из корзины', 'success');
                }
            } else {
                // Добавляем в корзину
                const response = await fetch(CART_API, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        product_id: productId,
                        product_title: productTitle,
                        product_price: productPrice,
                        product_image: productImage
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    updateCartButton(cartBtn, true);
                    
                    // Обновляем счетчики
                    if (window.authManager && window.authManager.loadCounters) {
                        window.authManager.loadCounters();
                    }
                    
                    // Обновляем состояние на всех карточках
                    initializeCartState();
                    
                    if (playingStatus) {
                        playingStatus.textContent = 'Добавлено в корзину';
                        playingStatus.style.color = 'var(--neon-green)';
                        
                        setTimeout(() => {
                            playingStatus.textContent = 'Нажмите кнопку воспроизведения';
                            playingStatus.style.color = '#aaa';
                        }, 2000);
                    }
                    
                    cartBtn.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        cartBtn.style.transform = 'scale(1)';
                    }, 300);
                    
                    showAlbumNotification('Товар добавлен в корзину', 'success');
                }
            }
        } catch (error) {
            console.error('Ошибка работы с корзиной:', error);
            showAlbumNotification('Ошибка при работе с корзиной', 'error');
        }
    });
    
    // Функция воспроизведения аудио
    function playAudio() {
        audio.play();
        isPlaying = true;
        
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
        
        card.classList.add('playing');
        if (playingStatus) {
            playingStatus.textContent = `Сейчас играет: ${album.title} - ${album.artist}`;
        }
        
        progressInterval = setInterval(() => updateProgress(), 500);
    }
    
    // Функция паузы аудио
    function pauseAudio() {
        audio.pause();
        isPlaying = false;
        
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
        
        card.classList.remove('playing');
        if (playingStatus) {
            playingStatus.textContent = 'Воспроизведение приостановлено';
        }
        
        clearInterval(progressInterval);
    }
    
    // Обновление прогресс-бара
    function updateProgress() {
        const { currentTime, duration } = audio;
        
        const progressPercent = (currentTime / duration) * 100;
        if (progress) {
            progress.style.width = `${progressPercent}%`;
        }
        
        if (currentTimeEl) {
            currentTimeEl.textContent = formatTime(currentTime);
        }
    }
    
    // Обработчик окончания воспроизведения
    audio.addEventListener('ended', () => {
        pauseAudio();
        if (progress) progress.style.width = '0%';
        if (currentTimeEl) currentTimeEl.textContent = '0:00';
        if (playingStatus) {
            playingStatus.textContent = 'Воспроизведение завершено';
        }
        
        setTimeout(() => {
            if (playingStatus) {
                playingStatus.textContent = 'Нажмите кнопку воспроизведения';
            }
        }, 2000);
    });
    
    // Клик по прогресс-бару для перемотки
    const progressBar = card.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            const percentage = clickX / width;
            
            audio.currentTime = percentage * audio.duration;
            updateProgress();
        });
    }
}

// Глобальная проверка authManager
if (!window.authManager) {
    window.authManager = {
        isLoggedIn: function() {
            const token = localStorage.getItem('vinylneon_token');
            const user = localStorage.getItem('vinylneon_user');
            return token && user;
        },
        openLoginModal: function() {
            if (typeof openModal === 'function') {
                openModal('loginModal');
            } else {
                console.warn('openModal function not found');
                alert('Для выполнения действия необходимо авторизоваться. Нажмите кнопку "Войти" в правом верхнем углу.');
            }
        }
    };
}

// Функция показа уведомлений ДЛЯ КАРТОЧЕК АЛЬБОМОВ
function showAlbumNotification(message, type = 'info') {
    // Используем существующую функцию из auth-fixed.js если она есть
    if (window.showNotification && window.showNotification !== showAlbumNotification) {
        window.showNotification(message, type);
        return;
    }
    
    // Иначе создаем свое уведомление
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
        background: ${type === 'success' ? '#00ff9d' : type === 'error' ? '#ff2f92' : type === 'warning' ? '#ff9900' : '#00b3ff'};
        color: #000;
        padding: 12px 18px;
        border-radius: 5px;
        font-weight: bold;
        box-shadow: 0 0 15px ${type === 'success' ? 'rgba(0, 255, 157, 0.7)' : type === 'error' ? 'rgba(255, 47, 146, 0.7)' : type === 'warning' ? 'rgba(255, 153, 0, 0.7)' : 'rgba(0, 179, 255, 0.7)'};
        animation: slideIn 0.3s ease;
        max-width: 300px;
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('Инициализация популярных альбомов...');
    
    if (!scrollTrack) {
        console.error('Элемент scrollTrack не найден');
        return;
    }
    
    initAlbums();
    initDragScroll();
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            scrollOneAlbum(1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            scrollOneAlbum(-1);
        });
    }
    
    if (autoScrollBtn) {
        autoScrollBtn.addEventListener('click', startAutoScroll);
    }
    
    if (manualScrollBtn) {
        manualScrollBtn.addEventListener('click', stopAutoScroll);
    }
    
    window.addEventListener('resize', updateDimensions);
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (activeAudio) {
                activeAudio.pause();
            }
            
            if (isAutoScroll) {
                scrollTrack.style.animationPlayState = 'paused';
            }
        } else {
            if (isAutoScroll) {
                scrollTrack.style.animationPlayState = 'running';
            }
        }
    });
    
    scrollTrack.addEventListener('mouseenter', () => {
        if (isAutoScroll) {
            scrollTrack.style.animationPlayState = 'paused';
        }
    });
    
    scrollTrack.addEventListener('mouseleave', () => {
        if (isAutoScroll) {
            scrollTrack.style.animationPlayState = 'running';
        }
    });
    
    // Инициализация состояний
    setTimeout(() => {
        initializeFavoritesState();
        initializeCartState();
    }, 1500);
});

// Добавьте CSS анимации для уведомлений если их еще нет
if (!document.querySelector('#notification-animations')) {
    const style = document.createElement('style');
    style.id = 'notification-animations';
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
    document.head.appendChild(style);
}
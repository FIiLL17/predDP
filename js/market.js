// js/market.js

// ==================== ДАННЫЕ ====================
const ALL_DATA = [
      { id:1, title:"Midnight Highway", artist:"M83", genre:"synthwave", year:2024, price:29, popular:92, cover:"img/albom/9Vien3LfQQk.jpg", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", duration:"3:45" },
      { id:2, title:"Electric Dreams", artist:"The Weeknd", genre:"synthwave", year:2025, price:39, popular:94, cover:"https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", duration:"4:02" },
      { id:3, title:"Retro Pulse", artist:"Dua Lipa", genre:"synthwave", year:2022, price:25, popular:87, cover:"https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", duration:"3:22" },
      { id:4, title:"Neon Nights", artist:"Kavinsky", genre:"synthwave", year:2023, price:32, popular:89, cover:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", duration:"4:14" },
      { id:5, title:"Outrun", artist:"The Midnight", genre:"synthwave", year:2024, price:28, popular:85, cover:"https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", duration:"5:01" },
      { id:6, title:"Future Bass", artist:"Marshmello", genre:"electronic", year:2024, price:35, popular:84, cover:"https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", duration:"3:33" },
      { id:7, title:"Digital Dreams", artist:"Deadmau5", genre:"electronic", year:2025, price:42, popular:88, cover:"https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", duration:"4:45" },
      { id:8, title:"Techno Pulse", artist:"Jeff Mills", genre:"electronic", year:2023, price:31, popular:79, cover:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", duration:"3:55" },
      { id:9, title:"House Vibes", artist:"Frankie Knuckles", genre:"electronic", year:2024, price:27, popular:76, cover:"https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", duration:"4:20" },
      { id:10, title:"City Lights", artist:"J Dilla", genre:"lofi", year:2023, price:19, popular:82, cover:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", duration:"2:55" },
      { id:11, title:"Lunar Drift", artist:"Nujabes", genre:"lofi", year:2021, price:15, popular:78, cover:"https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", duration:"3:10" },
      { id:12, title:"Rainy Days", artist:"Tomppabeats", genre:"lofi", year:2022, price:18, popular:81, cover:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", duration:"2:45" },
      { id:13, title:"Coffee Shop", artist:"Flamingosis", genre:"lofi", year:2024, price:22, popular:83, cover:"https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3", duration:"3:30" },
      { id:14, title:"Pulsewave 88", artist:"Carpenter Brut", genre:"cyberpunk", year:2025, price:45, popular:90, cover:"https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3", duration:"4:50" },
      { id:15, title:"Neon City", artist:"Perturbator", genre:"cyberpunk", year:2025, price:42, popular:91, cover:"https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3", duration:"5:15" },
      { id:16, title:"Cyber Dreams", artist:"Dance With The Dead", genre:"cyberpunk", year:2024, price:38, popular:86, cover:"https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3", duration:"4:05" },
      { id:17, title:"Deep Afterglow", artist:"Brian Eno", genre:"ambient", year:2024, price:22, popular:74, cover:"https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3", duration:"6:20" },
      { id:18, title:"Dream Sequence", artist:"Aphex Twin", genre:"ambient", year:2022, price:21, popular:73, cover:"https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-18.mp3", duration:"4:40" },
      { id:19, title:"Cosmic Drift", artist:"Boards of Canada", genre:"ambient", year:2023, price:24, popular:72, cover:"https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-19.mp3", duration:"5:55" },
      { id:20, title:"Ocean Waves", artist:"Hammock", genre:"ambient", year:2024, price:26, popular:75, cover:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-20.mp3", duration:"5:05" },
      { id:21, title:"Analog Heart", artist:"The Black Keys", genre:"rock", year:2019, price:27, popular:69, cover:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-21.mp3", duration:"3:40" },
      { id:22, title:"Guitar Heroes", artist:"Queen", genre:"rock", year:2020, price:29, popular:71, cover:"https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-22.mp3", duration:"4:12" },
      { id:23, title:"Rock Revolution", artist:"Led Zeppelin", genre:"rock", year:2021, price:25, popular:68, cover:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-23.mp3", duration:"5:30" },
      { id:24, title:"Chill Vibes", artist:"Tycho", genre:"chillout", year:2023, price:23, popular:80, cover:"https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-24.mp3", duration:"4:00" },
      { id:25, title:"Jazz Fusion", artist:"Miles Davis", genre:"jazz", year:2022, price:32, popular:77, cover:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-25.mp3", duration:"5:45" },
      { id:26, title:"Hip Hop Beats", artist:"J Dilla", genre:"hiphop", year:2024, price:34, popular:82, cover:"https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-26.mp3", duration:"3:20" },
      { id:27, title:"Classical Modern", artist:"Max Richter", genre:"classical", year:2023, price:41, popular:70, cover:"https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-27.mp3", duration:"6:10" },
      { id:28, title:"Reggae Sun", artist:"Bob Marley", genre:"reggae", year:2022, price:28, popular:65, cover:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-28.mp3", duration:"4:30" },
      { id:29, title:"Pop Hits", artist:"Taylor Swift", genre:"pop", year:2024, price:31, popular:84, cover:"https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-29.mp3", duration:"3:50" },
      { id:30, title:"Indie Dreams", artist:"Bon Iver", genre:"indie", year:2023, price:26, popular:79, cover:"https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-30.mp3", duration:"4:15" }
    ];
    
const GENRE_NAMES = {
  synthwave: 'Синтвейв',
  electronic: 'Электронная',
  lofi: 'Lo-Fi',
  cyberpunk: 'Киберпанк',
  ambient: 'Эмбиент',
  rock: 'Рок',
  chillout: 'Чилаут',
  jazz: 'Джаз',
  hiphop: 'Хип-хоп',
  classical: 'Классика',
  reggae: 'Регги',
  pop: 'Поп',
  indie: 'Инди'
};

const ALBUM_DESCRIPTIONS = ALL_DATA.reduce((acc, it) => {
  acc[it.id] = `Захватывающий трек в жанре ${GENRE_NAMES[it.genre] || it.genre}, выпущенный в ${it.year} году. Идеально подходит для прослушивания в любом настроении.`;
  return acc;
}, {});

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let favoriteIds = new Set();  // ID избранных товаров
let cartIds = new Set();      // ID товаров в корзине

let activeAudio = null;
let activeCard = null;
let activeProgressInterval = null;

const ITEMS_PER_LOAD = 6;
const MAX_ALBUMS = 30;
let currentlyLoaded = 0;
let currentFilteredData = [];

const state = {
  selectedGenres: new Set(),
  year: 'all',
  priceMax: Infinity,
  sort: 'new'
};

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function stopActiveAudio() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    if (activeCard) {
      const card = activeCard;
      card.classList.remove('playing');
      const playIcon = card.querySelector('.play-icon');
      const pauseIcon = card.querySelector('.pause-icon');
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      const status = card.querySelector('.playing-status');
      if (status) status.textContent = 'Нажмите кнопку воспроизведения';
      const progress = card.querySelector('.progress');
      if (progress) progress.style.width = '0%';
      const currentTime = card.querySelector('.current-time');
      if (currentTime) currentTime.textContent = '0:00';
    }
    clearInterval(activeProgressInterval);
    activeAudio = null;
    activeCard = null;
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==================== ЗАГРУЗКА ДАННЫХ ПОЛЬЗОВАТЕЛЯ ====================
async function loadUserData() {
  const token = authManager.getToken();
  if (!token) return;

  try {
    const favRes = await fetch('/api/user/favorites.php', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const favData = await favRes.json();
    if (favData.success) {
      favoriteIds = new Set(favData.favorites.map(f => f.product_id));
    }

    const cartRes = await fetch('/api/user/cart.php', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const cartData = await cartRes.json();
    if (cartData.success) {
      cartIds = new Set(cartData.cart.map(c => c.product_id));
    }

    updateAllCardButtons();
    authManager.updateCounters(favoriteIds.size, cartIds.size); // ← передаём параметры
  } catch (e) {
    console.error('Ошибка загрузки данных пользователя:', e);
  }
}

function updateAllCardButtons() {
  document.querySelectorAll('.music-card').forEach(card => {
    const id = parseInt(card.dataset.id);
    const favBtn = card.querySelector('.favorite-btn');
    const cartBtn = card.querySelector('.cart-btn');
    if (favBtn) {
      if (favoriteIds.has(id)) {
        favBtn.classList.add('favorite-active');
        favBtn.querySelector('.heart-icon').style.display = 'none';
        favBtn.querySelector('.heart-filled-icon').style.display = 'block';
      } else {
        favBtn.classList.remove('favorite-active');
        favBtn.querySelector('.heart-icon').style.display = 'block';
        favBtn.querySelector('.heart-filled-icon').style.display = 'none';
      }
    }
    if (cartBtn) {
      if (cartIds.has(id)) {
        cartBtn.classList.add('cart-active');
        cartBtn.querySelector('.cart-icon').style.display = 'none';
        cartBtn.querySelector('.cart-filled-icon').style.display = 'block';
      } else {
        cartBtn.classList.remove('cart-active');
        cartBtn.querySelector('.cart-icon').style.display = 'block';
        cartBtn.querySelector('.cart-filled-icon').style.display = 'none';
      }
    }
  });
}

// ==================== ФИЛЬТРАЦИЯ ====================
function filterData(data) {
  let filtered = data.slice();
  if (state.selectedGenres.size > 0) {
    filtered = filtered.filter(it => state.selectedGenres.has(it.genre));
  }
  if (state.year !== 'all') {
    filtered = filtered.filter(it => it.year === parseInt(state.year));
  }
  if (Number.isFinite(state.priceMax)) {
    filtered = filtered.filter(it => it.price <= state.priceMax);
  }
  filtered.sort((a, b) => {
    switch (state.sort) {
      case 'new': return b.year - a.year;
      case 'popular': return b.popular - a.popular;
      case 'priceUp': return a.price - b.price;
      case 'priceDown': return b.price - a.price;
      case 'name': return a.title.localeCompare(b.title);
      default: return 0;
    }
  });
  return filtered;
}

function updateFilters() {
  const year = document.getElementById('yearSelect').value;
  const price = document.getElementById('priceMax').value;
  const sort = document.getElementById('sortSelect').value;
  state.year = year;
  state.priceMax = price ? Number(price) : Infinity;
  state.sort = sort;
  currentlyLoaded = 0;
  applyFilters();
}

function applyFilters() {
  currentFilteredData = filterData(ALL_DATA);
  const catalog = document.getElementById('catalog');
  catalog.innerHTML = '';
  const initial = currentFilteredData.slice(0, ITEMS_PER_LOAD);
  currentlyLoaded = initial.length;
  if (initial.length > 0) {
    renderAlbums(initial);
  } else {
    showNoResults();
  }
  updateLoadMoreButton();
  showFilterStatus();
}

function showNoResults() {
  document.getElementById('catalog').innerHTML = `
    <div style="grid-column:1/-1; text-align:center; padding:60px; color:#b0b0d0;">
      <div style="font-size:24px; color:#3ED6FF; margin-bottom:10px;">😕</div>
      <h3 style="color:#f0f0ff; margin-bottom:10px;">Альбомы не найдены</h3>
      <p>Попробуйте изменить параметры фильтров</p>
    </div>
  `;
  document.getElementById('loadMoreContainer').style.display = 'none';
}

function updateLoadMoreButton() {
  const btn = document.getElementById('loadMoreBtn');
  const container = document.getElementById('loadMoreContainer');
  const remaining = currentFilteredData.length - currentlyLoaded;
  const canLoadMore = remaining > 0 && currentlyLoaded < MAX_ALBUMS;
  if (canLoadMore) {
    const loadCount = Math.min(ITEMS_PER_LOAD, remaining, MAX_ALBUMS - currentlyLoaded);
    btn.textContent = `Загрузить ещё ${loadCount} альбомов`;
    container.style.display = 'flex';
    btn.disabled = false;
  } else {
    if (currentlyLoaded >= MAX_ALBUMS) {
      btn.textContent = 'Все альбомы загружены (30/30)';
      btn.disabled = true;
    } else {
      container.style.display = 'none';
    }
  }
}

function showFilterStatus() {
  const el = document.getElementById('filterStatus');
  const filteredCount = currentFilteredData.length;
  const shownCount = Math.min(currentlyLoaded, MAX_ALBUMS);
  let msg = `Показано ${shownCount} из ${Math.min(filteredCount, MAX_ALBUMS)} альбомов`;
  if (filteredCount > MAX_ALBUMS) msg += ` (всего найдено ${filteredCount})`;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

// ==================== РЕНДЕР ЖАНРОВ ====================
function renderChips() {
  const container = document.getElementById('genreChips');
  container.innerHTML = '';
  const genreCounts = ALL_DATA.reduce((acc, it) => {
    acc[it.genre] = (acc[it.genre] || 0) + 1;
    return acc;
  }, {});
  const sorted = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]);
  sorted.forEach(g => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = GENRE_NAMES[g] || g;
    chip.dataset.genre = g;
    chip.addEventListener('click', () => {
      if (state.selectedGenres.has(g)) {
        state.selectedGenres.delete(g);
        chip.classList.remove('active');
      } else {
        state.selectedGenres.add(g);
        chip.classList.add('active');
      }
      updateFilters();
    });
    if (state.selectedGenres.has(g)) chip.classList.add('active');
    container.appendChild(chip);
  });
}

// ==================== РЕНДЕР КАРТОЧЕК ====================
function renderAlbums(albums) {
  const catalog = document.getElementById('catalog');
  albums.forEach((it, idx) => {
    const card = document.createElement('article');
    card.className = 'music-card';
    card.dataset.id = it.id;
    card.style.animationDelay = `${idx * 0.1}s`;

    const isFav = favoriteIds.has(it.id);
    const isCart = cartIds.has(it.id);

    card.innerHTML = `
      <div class="album-cover">
        <img src="${it.cover}" alt="${it.title}">
        <div class="wave-container">
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
        </div>
      </div>
      <div class="song-info">
        <h2 class="song-title">${it.title}</h2>
        <p class="artist">${it.artist}</p>
        <p class="genre">${GENRE_NAMES[it.genre] || it.genre}</p>
        <p class="year">${it.year} год</p>
      </div>
      <div class="controls">
        <button class="play-btn">
          <svg class="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg class="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="white" style="display:none;">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
        <div class="action-buttons">
          <button class="action-btn favorite-btn" data-id="${it.id}" title="Избранное">
            <svg class="heart-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <svg class="heart-filled-icon" width="22" height="22" viewBox="0 0 24 24" fill="#ff6b9d" stroke="#ff6b9d" stroke-width="2" style="display:none;">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button class="action-btn cart-btn" data-id="${it.id}" title="Корзина">
            <svg class="cart-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <svg class="cart-filled-icon" width="22" height="22" viewBox="0 0 24 24" fill="#3cff8c" stroke="#3cff8c" stroke-width="2" style="display:none;">
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
          <span class="duration">${it.duration}</span>
        </div>
      </div>
      <div class="price">${it.price} ₽</div>
      <div class="playing-status">Нажмите кнопку воспроизведения</div>
    `;

    if (isFav) {
      const favBtn = card.querySelector('.favorite-btn');
      favBtn.classList.add('favorite-active');
      favBtn.querySelector('.heart-icon').style.display = 'none';
      favBtn.querySelector('.heart-filled-icon').style.display = 'block';
    }
    if (isCart) {
      const cartBtn = card.querySelector('.cart-btn');
      cartBtn.classList.add('cart-active');
      cartBtn.querySelector('.cart-icon').style.display = 'none';
      cartBtn.querySelector('.cart-filled-icon').style.display = 'block';
    }

    catalog.appendChild(card);
    addCardListeners(card, it);
  });
}

// ==================== ОБРАБОТЧИКИ КАРТОЧКИ ====================
function addCardListeners(card, album) {
  const playBtn = card.querySelector('.play-btn');
  const favBtn = card.querySelector('.favorite-btn');
  const cartBtn = card.querySelector('.cart-btn');
  const statusEl = card.querySelector('.playing-status');
  const progressEl = card.querySelector('.progress');
  const currentTimeEl = card.querySelector('.current-time');
  const durationEl = card.querySelector('.duration');

  const audio = new Audio(album.audio);
  let isPlaying = false;
  let progressInterval;

  audio.addEventListener('loadedmetadata', () => {
    if (durationEl) durationEl.textContent = formatTime(audio.duration);
  });

  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeAudio && activeAudio !== audio) stopActiveAudio();
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      clearInterval(progressInterval);
      card.classList.remove('playing');
      playBtn.querySelector('.play-icon').style.display = 'block';
      playBtn.querySelector('.pause-icon').style.display = 'none';
      statusEl.textContent = 'Воспроизведение приостановлено';
    } else {
      audio.play();
      isPlaying = true;
      activeAudio = audio;
      activeCard = card;
      card.classList.add('playing');
      playBtn.querySelector('.play-icon').style.display = 'none';
      playBtn.querySelector('.pause-icon').style.display = 'block';
      statusEl.textContent = `Сейчас играет: ${album.title} — ${album.artist}`;
      if (progressInterval) clearInterval(progressInterval);
      progressInterval = setInterval(() => {
        if (audio.duration) {
          const percent = (audio.currentTime / audio.duration) * 100;
          progressEl.style.width = percent + '%';
          currentTimeEl.textContent = formatTime(audio.currentTime);
        }
      }, 500);
    }
  });

  audio.addEventListener('ended', () => {
    isPlaying = false;
    clearInterval(progressInterval);
    card.classList.remove('playing');
    playBtn.querySelector('.play-icon').style.display = 'block';
    playBtn.querySelector('.pause-icon').style.display = 'none';
    progressEl.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    statusEl.textContent = 'Воспроизведение завершено';
    setTimeout(() => {
      if (statusEl) statusEl.textContent = 'Нажмите кнопку воспроизведения';
    }, 2000);
    if (activeAudio === audio) {
      activeAudio = null;
      activeCard = null;
    }
  });

  // Избранное
  favBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const id = album.id;

    if (!authManager.isLoggedIn()) {
      authManager.openLoginModal();
      return;
    }

    const token = authManager.getToken();
    const isCurrentlyFav = favoriteIds.has(id);

    try {
      if (isCurrentlyFav) {
        const res = await fetch('/api/user/favorites.php', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ product_id: id })
        });
        const data = await res.json();
        if (data.success) {
          favoriteIds.delete(id);
          updateAllCardButtons();
          authManager.updateCounters(favoriteIds.size, cartIds.size); // ← передаём параметры
          statusEl.textContent = 'Удалено из избранного';
        }
      } else {
        const res = await fetch('/api/user/favorites.php', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_id: id,
            product_title: album.title,
            product_price: album.price,
            product_image: album.cover
          })
        });
        const data = await res.json();
        if (data.success) {
          favoriteIds.add(id);
          updateAllCardButtons();
          authManager.updateCounters(favoriteIds.size, cartIds.size); // ← передаём параметры
          statusEl.textContent = 'Добавлено в избранное';
        }
      }
      statusEl.style.color = '#ff6b9d';
      setTimeout(() => {
        statusEl.style.color = '';
        if (!isPlaying) statusEl.textContent = 'Нажмите кнопку воспроизведения';
      }, 2000);
    } catch (err) {
      console.error(err);
      statusEl.textContent = 'Ошибка';
    }
  });

  // Корзина
  cartBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const id = album.id;

    if (!authManager.isLoggedIn()) {
      authManager.openLoginModal();
      return;
    }

    const token = authManager.getToken();
    const isCurrentlyInCart = cartIds.has(id);

    try {
      if (isCurrentlyInCart) {
        const res = await fetch('/api/user/cart.php', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ product_id: id })
        });
        const data = await res.json();
        if (data.success) {
          cartIds.delete(id);
          updateAllCardButtons();
          authManager.updateCounters(favoriteIds.size, cartIds.size); // ← передаём параметры
          statusEl.textContent = 'Удалено из корзины';
        }
      } else {
        const res = await fetch('/api/user/cart.php', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_id: id,
            product_title: album.title,
            product_price: album.price,
            product_image: album.cover
          })
        });
        const data = await res.json();
        if (data.success) {
          cartIds.add(id);
          updateAllCardButtons();
          authManager.updateCounters(favoriteIds.size, cartIds.size); // ← передаём параметры
          statusEl.textContent = 'Добавлено в корзину';
        }
      }
      statusEl.style.color = '#3cff8c';
      setTimeout(() => {
        statusEl.style.color = '';
        if (!isPlaying) statusEl.textContent = 'Нажмите кнопку воспроизведения';
      }, 2000);
    } catch (err) {
      console.error(err);
      statusEl.textContent = 'Ошибка';
    }
  });
}

// ==================== ЗАГРУЗКА ЕЩЁ ====================
function loadMoreAlbums() {
  const btn = document.getElementById('loadMoreBtn');
  btn.disabled = true;
  btn.innerHTML = 'Загрузка...';
  setTimeout(() => {
    const newAlbums = currentFilteredData.slice(currentlyLoaded, currentlyLoaded + ITEMS_PER_LOAD);
    if (newAlbums.length) {
      renderAlbums(newAlbums);
      currentlyLoaded += newAlbums.length;
      updateLoadMoreButton();
    }
    btn.disabled = false;
    btn.innerHTML = `Загрузить ещё ${ITEMS_PER_LOAD} альбомов`;
  }, 500);
}

// ==================== СБРОС ФИЛЬТРОВ ====================
function resetAll() {
  state.selectedGenres.clear();
  state.year = 'all';
  state.priceMax = Infinity;
  state.sort = 'new';
  currentlyLoaded = 0;
  document.getElementById('yearSelect').value = 'all';
  document.getElementById('priceMax').value = '';
  document.getElementById('sortSelect').value = 'new';
  renderChips();
  applyFilters();
}

// ==================== ЗВЁЗДЫ И ЧАСТИЦЫ ====================
function createStars() {
  const container = document.getElementById('stars');
  for (let i = 0; i < 200; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.width = (Math.random() * 2 + 0.5) + 'px';
    star.style.height = star.style.width;
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = (Math.random() * 2 + 2) + 's';
    container.appendChild(star);
  }
}

function createParticles() {
  const container = document.getElementById('particles');
  const colors = ['rgba(31,164,255,0.15)', 'rgba(160,52,255,0.15)', 'rgba(255,76,139,0.15)'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 8 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 15 + 's';
    p.style.animationDuration = (Math.random() * 10 + 25) + 's';
    container.appendChild(p);
  }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
  createStars();
  createParticles();
  renderChips();
  applyFilters();

  if (authManager.isLoggedIn()) {
    loadUserData();
  } else {
    favoriteIds.clear();
    cartIds.clear();
    authManager.updateCounters(0, 0);
  }

  document.getElementById('yearSelect').addEventListener('change', updateFilters);
  document.getElementById('priceMax').addEventListener('input', debounce(updateFilters, 300));
  document.getElementById('sortSelect').addEventListener('change', updateFilters);
  document.getElementById('clearBtn').addEventListener('click', resetAll);
  document.getElementById('loadMoreBtn').addEventListener('click', loadMoreAlbums);

  // Обработчики для иконок в шапке
  const cartBtnHeader = document.getElementById('cartBtn');
  const favBtnHeader = document.getElementById('favoritesBtn');

  if (cartBtnHeader) {
    cartBtnHeader.addEventListener('click', (e) => {
      e.preventDefault();
      if (authManager.isLoggedIn()) {
        if (typeof openModal === 'function') {
          openModal('detailsModal');
          document.getElementById('detailsTitle').textContent = 'КОРЗИНА';
          if (typeof loadCartDetails === 'function') loadCartDetails();
        }
      } else {
        authManager.openLoginModal();
      }
    });
  }

  if (favBtnHeader) {
    favBtnHeader.addEventListener('click', (e) => {
      e.preventDefault();
      if (authManager.isLoggedIn()) {
        if (typeof openModal === 'function') {
          openModal('detailsModal');
          document.getElementById('detailsTitle').textContent = 'ИЗБРАННОЕ';
          if (typeof loadFavoritesDetails === 'function') loadFavoritesDetails();
        }
      } else {
        authManager.openLoginModal();
      }
    });
  }
});
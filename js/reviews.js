// reviews.js — Модуль отзывов
(function() {
    const API_URL = '/api/user/reviews.php';

    // Проверка авторизации
    function isUserAuthenticated() {
        return !!(localStorage.getItem('vinylneon_token') && localStorage.getItem('vinylneon_user'));
    }

    function getAuthToken() {
        return localStorage.getItem('vinylneon_token');
    }

    function showNotification(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    function openLoginModal() {
        if (typeof window.openModal === 'function') {
            window.openModal('loginModal');
        } else if (window.AuthManager && typeof window.AuthManager.openLoginModal === 'function') {
            window.AuthManager.openLoginModal();
        } else {
            showNotification('Для написания отзыва необходимо авторизоваться', 'warning');
        }
    }

    // Форматирование звёзд
    function starsHTML(rating) {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    }

    // Рендер одной карточки отзыва
    function renderReviewCard(review) {
        return `
            <div class="testimonial-card">
                <div class="card-header">
                    <div class="avatar"><img src="${review.avatar}" alt="${review.name}"></div>
                    <div class="user-info">
                        <h4>${review.name}</h4>
                        <span class="user-badge">${review.badge}</span>
                    </div>
                </div>
                <div class="rating">${starsHTML(review.rating)}</div>
                <p class="testimonial-text">«${review.text}»</p>
                <div class="purchase-info">
                    <span>💿 Отзыв о магазине</span>
                    ${review.verified ? '<span class="verified">✓ проверено</span>' : ''}
                </div>
            </div>
        `;
    }

    // Загрузка последних отзывов (для главной)
    async function loadRecentReviews() {
        try {
            const res = await fetch(`${API_URL}?limit=3`);
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            const data = await res.json();
            if (data.success) {
                const container = document.getElementById('recentReviews');
                if (container) {
                    container.innerHTML = data.reviews.map(renderReviewCard).join('');
                }
                updateRatingSummary(data.total);
            } else {
                console.warn('Ошибка загрузки отзывов:', data.message);
            }
        } catch (e) {
            console.error('Ошибка загрузки отзывов', e);
        }
    }

    // Загрузка всех отзывов с фильтрами (для модалки)
    async function loadAllReviews(filterRating = 'all') {
        let url = `${API_URL}?limit=100`;
        if (filterRating !== 'all') url += `&rating=${filterRating}`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            const data = await res.json();
            if (data.success) {
                const container = document.getElementById('allReviewsList');
                if (container) {
                    container.innerHTML = data.reviews.map(renderReviewCard).join('');
                }
            } else {
                console.warn('Ошибка загрузки всех отзывов:', data.message);
            }
        } catch (e) {
            console.error('Ошибка загрузки всех отзывов', e);
        }
    }

    // Обновление общего рейтинга (заглушка)
    function updateRatingSummary(total) {
        const ratingBlock = document.getElementById('ratingSummary');
        if (ratingBlock) {
            ratingBlock.innerHTML = `
                <div class="rating-badge">
                    <span class="rating-value">4.9</span>
                    <span class="rating-stars">★★★★★</span>
                    <span class="rating-count">${total} отзывов</span>
                </div>
            `;
        }
    }

    // Инициализация
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            loadRecentReviews();

            // Модалка просмотра
            const viewModal = document.getElementById('viewModal');
            const viewAllBtn = document.getElementById('viewAllBtn');
            const closeView = document.getElementById('closeViewModal');

            if (viewAllBtn && viewModal) {
                viewAllBtn.addEventListener('click', async () => {
                    await loadAllReviews(
                        document.querySelector('.filter-btn.active')?.dataset.filter || 'all'
                    );
                    viewModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                });
            }

            if (closeView) {
                closeView.addEventListener('click', () => {
                    viewModal.classList.remove('active');
                    document.body.style.overflow = '';
                });
            }

            // Фильтры в модалке
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    await loadAllReviews(btn.dataset.filter);
                });
            });

            // Модалка написания отзыва
            const writeModal = document.getElementById('writeModal');
            const writeBtn = document.getElementById('writeReviewBtn');
            const closeWrite = document.getElementById('closeWriteModal');

            if (writeBtn && writeModal) {
                writeBtn.addEventListener('click', () => {
                    if (!isUserAuthenticated()) {
                        openLoginModal();
                        return;
                    }
                    writeModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                });
            }

            if (closeWrite) {
                closeWrite.addEventListener('click', () => {
                    writeModal.classList.remove('active');
                    document.body.style.overflow = '';
                });
            }

            // Звёзды в форме
            const stars = document.querySelectorAll('#writeRatingStars span');
            const ratingDisplay = document.getElementById('selectedRating');
            const ratingHidden = document.getElementById('ratingValue');

            if (stars.length && ratingDisplay && ratingHidden) {
                stars.forEach(star => {
                    star.addEventListener('click', () => {
                        const val = parseInt(star.dataset.value);
                        ratingHidden.value = val;
                        ratingDisplay.textContent = val + ' звёзд';
                        stars.forEach((s, idx) => {
                            if (idx < val) s.classList.add('selected');
                            else s.classList.remove('selected');
                        });
                    });
                });
                stars.forEach((s, idx) => { if (idx < 5) s.classList.add('selected'); });
            }

            // Отправка формы (без поля имени)
            const reviewForm = document.getElementById('reviewForm');
            if (reviewForm) {
                reviewForm.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    if (!isUserAuthenticated()) {
                        openLoginModal();
                        return;
                    }

                    const rating = parseInt(ratingHidden?.value || '5');
                    const text = document.getElementById('reviewText')?.value.trim();

                    if (!text) {
                        showNotification('Напишите текст отзыва', 'error');
                        return;
                    }

                    const token = getAuthToken();
                    if (!token) {
                        showNotification('Не удалось получить токен авторизации', 'error');
                        return;
                    }

                    try {
                        const res = await fetch(API_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ rating, comment: text })
                        });

                        const data = await res.json();
                        if (data.success) {
                            // Обновляем отзывы
                            await loadRecentReviews();
                            if (viewModal.classList.contains('active')) {
                                await loadAllReviews(
                                    document.querySelector('.filter-btn.active')?.dataset.filter || 'all'
                                );
                            }

                            // Очистка формы
                            document.getElementById('reviewText').value = '';
                            ratingHidden.value = 5;
                            ratingDisplay.textContent = '5 звёзд';
                            stars.forEach((s, idx) => {
                                if (idx < 5) s.classList.add('selected');
                                else s.classList.remove('selected');
                            });

                            writeModal.classList.remove('active');
                            document.body.style.overflow = '';
                            showNotification('Спасибо, ваш отзыв опубликован!', 'success');
                        } else {
                            showNotification(data.message || 'Ошибка при отправке', 'error');
                        }
                    } catch (err) {
                        showNotification('Ошибка соединения', 'error');
                        console.error(err);
                    }
                });
            }

            // Закрытие по клику на фон
            window.addEventListener('click', (e) => {
                if (e.target === viewModal) {
                    viewModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
                if (e.target === writeModal) {
                    writeModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });

            // Закрытие по Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (viewModal?.classList.contains('active')) {
                        viewModal.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                    if (writeModal?.classList.contains('active')) {
                        writeModal.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }
            });

        }, 100);
    });
})();
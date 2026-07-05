// slider.js — логика горизонтальных слайдеров
const Slider = {

  /**
   * Инициализировать слайдер с кнопками навигации
   * @param {string} containerId - ID контейнера слайдера
   * @param {string} trackClass - класс трека
   * @param {string} prevBtnId - ID кнопки "назад"
   * @param {string} nextBtnId - ID кнопки "вперёд"
   */
  init(containerId, trackClass, prevBtnId, nextBtnId) {
    const track = document.querySelector(`#${containerId} .${trackClass}`);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);

    if (!track || !prevBtn || !nextBtn) return;

    const scrollAmount = 320;

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Обновление состояния кнопок
    const updateButtons = () => {
      prevBtn.style.opacity = track.scrollLeft > 0 ? '1' : '0.3';
      prevBtn.style.pointerEvents = track.scrollLeft > 0 ? 'auto' : 'none';
      
      const maxScroll = track.scrollWidth - track.clientWidth;
      nextBtn.style.opacity = track.scrollLeft < maxScroll - 10 ? '1' : '0.3';
      nextBtn.style.pointerEvents = track.scrollLeft < maxScroll - 10 ? 'auto' : 'none';
    };

    track.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);
    setTimeout(updateButtons, 100);
  },

  /**
   * Заполнить слайдер карточками
   * @param {string} containerId - ID контейнера
   * @param {string} trackClass - класс трека
   * @param {Array} items - массив аниме
   * @param {string} cardSize - размер карточек ('poster' | 'landscape')
   * @param {boolean} showFav - показывать кнопку избранного
   */
  populate(containerId, trackClass, items, cardSize = 'poster', showFav = true) {
    const container = document.querySelector(`#${containerId}`);
    if (!container) return;

    const track = container.querySelector(`.${trackClass}`);
    if (!track) return;

    if (!items || items.length === 0) {
      track.innerHTML = '<div class="empty-state"><p>Нет данных для отображения</p></div>';
      return;
    }

    track.innerHTML = items.map(item => {
      const anime = item.material_data ? api.normalizeItem(item) : item;
      return Cards.create(anime, cardSize, showFav);
    }).join('');

    // Добавляем анимацию появления
    requestAnimationFrame(() => {
      const cards = track.querySelectorAll('.anime-card');
      cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.transition = 'all 0.4s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 60);
      });
    });
  },

  /**
   * Заполнить сетку популярного
   * @param {string} containerId - ID контейнера сетки
   * @param {Array} items - массив аниме
   */
  populateGrid(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>Нет данных</p></div>';
      return;
    }

    container.innerHTML = items.map(item => {
      const anime = item.material_data ? api.normalizeItem(item) : item;
      return Cards.create(anime, 'poster', true);
    }).join('');

    // Анимация появления
    requestAnimationFrame(() => {
      const cards = container.querySelectorAll('.anime-card');
      cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.4s ease';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 40);
      });
    });
  },

  /**
   * Заполнить секцию "Продолжить просмотр"
   */
  populateContinue(containerId, trackClass) {
    const history = Storage.getHistory();
    const container = document.getElementById(containerId);
    if (!container) return;

    const track = container.querySelector(`.${trackClass}`);
    if (!track) return;

    if (history.length === 0) {
      track.innerHTML = `
        <div class="empty-state" style="min-width:100%;padding:40px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <h3>История пуста</h3>
          <p>Начните смотреть аниме, и они появятся здесь</p>
        </div>
      `;
      return;
    }

    track.innerHTML = history.slice(0, 10).map(entry => {
      const progressPercent = entry.totalEpisodes > 0 
        ? Math.round((entry.episode / entry.totalEpisodes) * 100) 
        : entry.progress || 0;
      return Cards.create(entry, 'poster', true, progressPercent);
    }).join('');
  }
};

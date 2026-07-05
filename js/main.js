// main.js — точка входа, инициализация всех страниц

// ════════════════════════════════════════════
// TOAST — система уведомлений
// ════════════════════════════════════════════
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, icon, duration) {
    icon = icon || 'info';
    duration = duration || 3000;
    this.init();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<span>' + message + '</span>';

    this.container.appendChild(toast);

    setTimeout(function() {
      toast.classList.add('removing');
      setTimeout(function() { toast.remove(); }, 300);
    }, duration);
  }
};

// ════════════════════════════════════════════
// ГЛАВНАЯ СТРАНИЦА — данные из Kodik API
// ════════════════════════════════════════════
async function initHomePage() {
  // Particles
  var particles = new ParticleSystem('heroCanvas');
  particles.init();

  try {
    // В ТРЕНДЕ — самые популярные с высоким рейтингом
    var trendingData = await api.getPopular(10, 1);
    var trendingItems = [];
    if (trendingData && trendingData.results) {
      trendingItems = trendingData.results.map(function(item) { return api.normalizeItem(item); });
    }
    if (trendingItems.length === 0) {
      trendingItems = DEMO_ANIME.slice(0, 6);
    }
    Slider.populate('trendingSlider', 'slider-track', trendingItems, 'landscape', true);
    Slider.init('trendingSlider', 'slider-track', 'trendingPrev', 'trendingNext');
  } catch (e) {
    Slider.populate('trendingSlider', 'slider-track', DEMO_ANIME.slice(0, 6), 'landscape', true);
    Slider.init('trendingSlider', 'slider-track', 'trendingPrev', 'trendingNext');
  }

  try {
    // ПОПУЛЯРНОЕ — сетка из API
    var popularData = await api.getPopular(20, 1);
    var popularItems = [];
    if (popularData && popularData.results) {
      popularItems = popularData.results.map(function(item) { return api.normalizeItem(item); });
    }
    if (popularItems.length === 0) {
      popularItems = DEMO_ANIME.slice(0, 8);
    }
    Slider.populateGrid('popularGrid', popularItems);
  } catch (e) {
    Slider.populateGrid('popularGrid', DEMO_ANIME.sort(function(a, b) { return (b.rating || 0) - (a.rating || 0); }).slice(0, 8));
  }

  // Продолжить просмотр — из LocalStorage
  Slider.populateContinue('continueSlider', 'slider-track');
  Slider.init('continueSlider', 'slider-track', 'continuePrev', 'continueNext');

  try {
    // НОВЫЕ СЕРИИ — последние обновления
    var newData = await api.filter({ sort: 'date', limit: 10, page: 1 });
    var newItems = [];
    if (newData && newData.results) {
      newItems = newData.results.map(function(item) { return api.normalizeItem(item); });
    }
    if (newItems.length === 0) {
      newItems = DEMO_ANIME.slice().reverse().slice(0, 8);
    }
    Slider.populate('newEpisodesSlider', 'slider-track', newItems, 'poster', true);
    Slider.init('newEpisodesSlider', 'slider-track', 'newEpisodesPrev', 'newEpisodesNext');
  } catch (e) {
    Slider.populate('newEpisodesSlider', 'slider-track', DEMO_ANIME.slice().reverse().slice(0, 8), 'poster', true);
    Slider.init('newEpisodesSlider', 'slider-track', 'newEpisodesPrev', 'newEpisodesNext');
  }

  // Параллакс
  Animations.initHeroParallax();

  // Ревеал анимации
  setTimeout(function() { Animations.initReveal(); }, 200);
}

// ════════════════════════════════════════════
// СТРАНИЦА КАТАЛОГА
// ════════════════════════════════════════════
function initCatalogPage() {
  Catalog.init();
}

// ════════════════════════════════════════════
// СТРАНИЦА ПЛЕЕРА
// ════════════════════════════════════════════
function initPlayerPage() {
  player.init();
}

// ════════════════════════════════════════════
// СТРАНИЦА ИЗБРАННОГО
// ════════════════════════════════════════════
function initFavoritesPage() {
  var container = document.getElementById('favoritesGrid');
  var count = document.getElementById('favoritesCount');
  var sortSelect = document.getElementById('favoritesSort');

  if (!container) return;

  function renderFavorites() {
    var favorites = Storage.getFavorites();

    if (sortSelect) {
      var sort = sortSelect.value;
      if (sort === 'date') {
        favorites.sort(function(a, b) { return (b.addedAt || 0) - (a.addedAt || 0); });
      } else if (sort === 'title') {
        favorites.sort(function(a, b) { return a.title.localeCompare(b.title); });
      }
    }

    if (favorites.length === 0) {
      container.innerHTML = '<div class="empty-state" style="grid-column:1/-1">'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">'
        + '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'
        + '</svg><h3>Избранное пусто</h3><p>Добавляйте аниме в избранное, чтобы они появились здесь</p>'
        + '<a href="catalog.html" class="btn btn-gold" style="margin-top:20px">Перейти в каталог</a></div>';
    } else {
      container.innerHTML = favorites.map(function(item) { return Cards.create(item, 'poster', true); }).join('');
      Animations.animateCards(container);
    }

    if (count) {
      count.innerHTML = '<span>' + favorites.length + '</span> аниме в избранном';
    }
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', renderFavorites);
  }

  renderFavorites();
}

// ════════════════════════════════════════════
// СТРАНИЦА ИСТОРИИ
// ════════════════════════════════════════════
function initHistoryPage() {
  var container = document.getElementById('historyList');
  var clearBtn = document.getElementById('clearHistory');
  var count = document.getElementById('historyCount');

  function renderHistory() {
    var history = Storage.getHistory();

    if (history.length === 0) {
      if (container) {
        container.innerHTML = '<div class="empty-state">'
          + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">'
          + '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
          + '</svg><h3>История пуста</h3><p>Начните смотреть аниме, и они появятся здесь</p>'
          + '<a href="catalog.html" class="btn btn-gold" style="margin-top:20px">Перейти в каталог</a></div>';
      }
      if (count) count.innerHTML = '<span>0</span> записей';
      return;
    }

    // Группировка по дням
    var groups = {};
    var today = new Date();
    var todayStr = today.toDateString();
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    var yesterdayStr = yesterday.toDateString();

    history.forEach(function(entry) {
      var date = new Date(entry.timestamp);
      var groupKey;

      if (date.toDateString() === todayStr) {
        groupKey = 'Сегодня';
      } else if (date.toDateString() === yesterdayStr) {
        groupKey = 'Вчера';
      } else {
        groupKey = date.toLocaleDateString('ru-RU', {
          weekday: 'long', day: 'numeric', month: 'long'
        });
      }

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(entry);
    });

    if (container) {
      var html = '';
      for (var day in groups) {
        if (groups.hasOwnProperty(day)) {
          html += '<div class="history-day-group"><div class="history-day-label">' + day + '</div>'
            + groups[day].map(function(entry) { return Cards.createHistoryItem(entry); }).join('') + '</div>';
        }
      }
      container.innerHTML = html;
    }

    if (count) count.innerHTML = '<span>' + history.length + '</span> записей';
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (confirm('Очистить всю историю просмотров?')) {
        Storage.clearHistory();
        renderHistory();
        Toast.show('История очищена');
      }
    });
  }

  renderHistory();
}

// ════════════════════════════════════════════
// ЗАПУСК
// ════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async function() {
  // Загружаем header и footer
  await loadComponents();

  // Определяем текущую страницу
  var path = window.location.pathname;
  var page = path.split('/').pop() || 'index.html';

  // Инициализируем анимации
  Animations.init();

  // Запускаем соответствующую страницу
  switch (page) {
    case 'index.html':
      await initHomePage();
      break;
    case 'catalog.html':
      initCatalogPage();
      break;
    case 'player.html':
      initPlayerPage();
      break;
    case 'favorites.html':
      initFavoritesPage();
      break;
    case 'history.html':
      initHistoryPage();
      break;
  }
});

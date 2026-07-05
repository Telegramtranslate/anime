// catalog.js — фильтрация, поиск, пагинация через Kodik API
const Catalog = {
  currentPage: 1,
  currentFilters: {
    genre: '',
    year: '',
    status: '',
    sort: 'rating',
    query: ''
  },
  totalResults: 0,
  totalPages: 0,
  isLoading: false,

  /**
   * Инициализировать каталог
   */
  init: function() {
    this.loadFilters();
    this.initEventListeners();
    this.loadResults();
  },

  /**
   * Загрузить фильтры
   */
  loadFilters: function() {
    // Жанры
    var genreContainer = document.getElementById('genreCheckboxes');
    if (genreContainer) {
      genreContainer.innerHTML = ALL_GENRES.map(function(genre) {
        return '<label class="genre-checkbox">'
          + '<input type="checkbox" value="' + genre + '" data-genre="' + genre + '">'
          + '<span class="checkmark"></span><span>' + genre + '</span></label>';
      }).join('');
    }

    // Годы
    var yearSelect = document.getElementById('filterYear');
    if (yearSelect) {
      var currentYear = new Date().getFullYear();
      yearSelect.innerHTML = '<option value="">Все года</option>';
      for (var y = currentYear; y >= 2000; y--) {
        yearSelect.innerHTML += '<option value="' + y + '">' + y + '</option>';
      }
    }

    // Читаем параметры из URL
    var params = new URLSearchParams(window.location.search);
    if (params.get('genre')) {
      var genre = params.get('genre');
      document.querySelectorAll('[data-genre="' + genre + '"]').forEach(function(cb) { cb.checked = true; });
      this.currentFilters.genre = genre;
    }
  },

  /**
   * Инициализировать обработчики событий
   */
  initEventListeners: function() {
    var self = this;

    // Применить фильтры
    var applyBtn = document.getElementById('applyFilters');
    if (applyBtn) {
      applyBtn.addEventListener('click', function() { self.applyFilters(); });
    }

    // Сбросить фильтры
    var resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() { self.resetFilters(); });
    }

    // Поиск в каталоге
    var searchInput = document.getElementById('catalogSearch');
    if (searchInput) {
      var timeout;
      searchInput.addEventListener('input', function() {
        clearTimeout(timeout);
        timeout = setTimeout(function() {
          self.currentFilters.query = searchInput.value.trim();
          self.currentPage = 1;
          self.loadResults();
        }, 400);
      });
    }

    // Сортировка
    var sortSelect = document.getElementById('filterSort');
    if (sortSelect) {
      sortSelect.addEventListener('change', function() {
        self.currentFilters.sort = sortSelect.value;
        self.currentPage = 1;
        self.loadResults();
      });
    }

    // Переключатель вида
    var gridBtn = document.getElementById('viewGrid');
    var listBtn = document.getElementById('viewList');
    var grid = document.getElementById('catalogGrid');

    if (gridBtn && grid) {
      gridBtn.addEventListener('click', function() {
        gridBtn.classList.add('active');
        if (listBtn) listBtn.classList.remove('active');
        grid.classList.remove('list-view');
      });
    }

    if (listBtn && grid) {
      listBtn.addEventListener('click', function() {
        listBtn.classList.add('active');
        if (gridBtn) gridBtn.classList.remove('active');
        grid.classList.add('list-view');
      });
    }
  },

  /**
   * Применить фильтры
   */
  applyFilters: function() {
    var checkedGenres = document.querySelectorAll('#genreCheckboxes input:checked');
    this.currentFilters.genre = Array.from(checkedGenres).map(function(cb) { return cb.value; }).join(',');

    var yearSelect = document.getElementById('filterYear');
    this.currentFilters.year = yearSelect ? yearSelect.value : '';

    var statusSelect = document.getElementById('filterStatus');
    this.currentFilters.status = statusSelect ? statusSelect.value : '';

    var sortSelect = document.getElementById('filterSort');
    this.currentFilters.sort = sortSelect ? sortSelect.value : 'rating';

    this.currentPage = 1;
    this.loadResults();
  },

  /**
   * Сбросить фильтры
   */
  resetFilters: function() {
    document.querySelectorAll('#genreCheckboxes input').forEach(function(cb) { cb.checked = false; });
    var yearSelect = document.getElementById('filterYear');
    if (yearSelect) yearSelect.value = '';
    var statusSelect = document.getElementById('filterStatus');
    if (statusSelect) statusSelect.value = '';
    var sortSelect = document.getElementById('filterSort');
    if (sortSelect) sortSelect.value = 'rating';
    var searchInput = document.getElementById('catalogSearch');
    if (searchInput) searchInput.value = '';

    this.currentFilters = { genre: '', year: '', status: '', sort: 'rating', query: '' };
    this.currentPage = 1;
    this.loadResults();
  },

  /**
   * Загрузить результаты из Kodik API
   */
  loadResults: function() {
    if (this.isLoading) return;
    this.isLoading = true;

    var grid = document.getElementById('catalogGrid');
    var count = document.getElementById('resultsCount');
    var pagination = document.getElementById('pagination');

    if (!grid) {
      this.isLoading = false;
      return;
    }

    // Показываем скелетон
    grid.innerHTML = Array(12).fill(0).map(function() {
      return '<div class="skeleton skeleton-card"></div>';
    }).join('');

    var self = this;

    // Запрос к API
    var apiPromise;

    if (this.currentFilters.query) {
      // Поиск по названию
      apiPromise = api.search(this.currentFilters.query, 50);
    } else {
      // Фильтр
      var filters = {
        limit: CONFIG.CARDS_PER_PAGE || 24,
        page: this.currentPage
      };
      if (this.currentFilters.genre) filters.genre = this.currentFilters.genre;
      if (this.currentFilters.year) filters.year = parseInt(this.currentFilters.year);
      if (this.currentFilters.status) filters.status = this.currentFilters.status;
      filters.sort = this.currentFilters.sort;

      apiPromise = api.filter(filters);
    }

    apiPromise.then(function(data) {
      var results = [];
      var total = 0;

      if (data && data.results) {
        results = data.results.map(function(item) { return api.normalizeItem(item); });
        total = data.total || results.length;
      }

      // Если API не вернул результатов — fallback на демо
      if (results.length === 0) {
        results = self._filterDemoData();
        total = results.length;
      }

      // Пагинация
      var perPage = CONFIG.CARDS_PER_PAGE || 24;
      self.totalResults = total;
      self.totalPages = Math.ceil(total / perPage);

      var start = (self.currentPage - 1) * perPage;
      var pageResults = results.slice(start, start + perPage);

      // Отрендерить
      grid.innerHTML = pageResults.map(function(item) {
        return Cards.create(item, 'poster', true);
      }).join('');

      // Обновить счётчик
      if (count) {
        count.innerHTML = 'Найдено: <span>' + total + '</span> аниме';
      }

      // Пагинация
      if (pagination) {
        self.renderPagination(pagination);
      }

      // Анимация появления
      Animations.animateCards(grid);

      self.isLoading = false;
    }).catch(function() {
      // Fallback при ошибке
      var results = self._filterDemoData();
      var perPage = CONFIG.CARDS_PER_PAGE || 24;
      self.totalResults = results.length;
      self.totalPages = Math.ceil(results.length / perPage);
      var start = (self.currentPage - 1) * perPage;

      grid.innerHTML = results.slice(start, start + perPage).map(function(item) {
        return Cards.create(item, 'poster', true);
      }).join('');

      if (count) count.innerHTML = 'Найдено: <span>' + results.length + '</span> аниме';
      if (pagination) self.renderPagination(pagination);
      Animations.animateCards(grid);
      self.isLoading = false;
    });
  },

  /**
   * Фильтрация демо-данных (резерв)
   */
  _filterDemoData: function() {
    var results = DEMO_ANIME.slice();
    var filters = this.currentFilters;

    if (filters.query) {
      var q = filters.query.toLowerCase();
      results = results.filter(function(a) {
        return a.title.toLowerCase().indexOf(q) !== -1 ||
               a.titleOriginal.toLowerCase().indexOf(q) !== -1;
      });
    }

    if (filters.genre) {
      var genres = filters.genre.split(',');
      results = results.filter(function(a) {
        return genres.some(function(g) { return a.genres.indexOf(g) !== -1; });
      });
    }

    if (filters.year) {
      results = results.filter(function(a) { return String(a.year) === filters.year; });
    }

    if (filters.status) {
      results = results.filter(function(a) {
        return a.status === (filters.status === 'ongoing' ? 'Онгоинг' :
               filters.status === 'released' ? 'Завершён' :
               filters.status === 'announced' ? 'Анонс' : '');
      });
    }

    // Сортировка
    switch (filters.sort) {
      case 'rating':
        results.sort(function(a, b) { return (b.rating || 0) - (a.rating || 0); });
        break;
      case 'date':
        results.sort(function(a, b) { return (b.year || 0) - (a.year || 0); });
        break;
      case 'title':
        results.sort(function(a, b) { return a.title.localeCompare(b.title); });
        break;
      case 'year':
        results.sort(function(a, b) { return (b.year || 0) - (a.year || 0); });
        break;
    }

    return results;
  },

  /**
   * Отрендерить пагинацию
   */
  renderPagination: function(container) {
    if (this.totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    var html = '';
    var self = this;

    // Кнопка "Назад"
    html += '<button class="pagination-btn" onclick="Catalog.goToPage(' + (this.currentPage - 1) + ')"'
      + (this.currentPage <= 1 ? ' disabled' : '') + '>'
      + '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">'
      + '<path d="M15 18l-6-6 6-6"/></svg></button>';

    // Страницы
    var maxVisible = 5;
    var startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    var endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      html += '<button class="pagination-btn" onclick="Catalog.goToPage(1)">1</button>';
      if (startPage > 2) {
        html += '<span class="pagination-btn" style="cursor:default;border:none;background:transparent">...</span>';
      }
    }

    for (var i = startPage; i <= endPage; i++) {
      html += '<button class="pagination-btn' + (i === this.currentPage ? ' active' : '') + '" onclick="Catalog.goToPage(' + i + ')">' + i + '</button>';
    }

    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        html += '<span class="pagination-btn" style="cursor:default;border:none;background:transparent">...</span>';
      }
      html += '<button class="pagination-btn" onclick="Catalog.goToPage(' + this.totalPages + ')">' + this.totalPages + '</button>';
    }

    // Кнопка "Вперёд"
    html += '<button class="pagination-btn" onclick="Catalog.goToPage(' + (this.currentPage + 1) + ')"'
      + (this.currentPage >= this.totalPages ? ' disabled' : '') + '>'
      + '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">'
      + '<path d="M9 18l6-6-6-6"/></svg></button>';

    container.innerHTML = html;
  },

  /**
   * Перейти на страницу
   */
  goToPage: function(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadResults();
    var grid = document.getElementById('catalogGrid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

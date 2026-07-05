// search.js — поиск с debounce через Kodik API
const Search = {
  timeoutId: null,
  resultsContainer: null,
  input: null,

  /**
   * Инициализировать глобальный поиск
   */
  init: function(inputId, resultsId) {
    this.input = document.getElementById(inputId);
    this.resultsContainer = document.getElementById(resultsId);

    if (!this.input || !this.resultsContainer) return;

    var self = this;

    this.input.addEventListener('input', function() {
      var query = self.input.value.trim();

      if (self.timeoutId) {
        clearTimeout(self.timeoutId);
      }

      if (query.length < 2) {
        self.resultsContainer.innerHTML = '';
        self.resultsContainer.style.display = 'none';
        return;
      }

      self.timeoutId = setTimeout(function() { self.performSearch(query); }, CONFIG.SEARCH_DEBOUNCE);
    });

    this.input.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        self.close();
      }
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.search-dropdown') && !e.target.closest('.search-toggle')) {
        self.close();
      }
    });
  },

  /**
   * Выполнить поиск через Kodik API
   */
  performSearch: function(query) {
    if (!this.resultsContainer) return;

    this.resultsContainer.style.display = 'grid';
    this.resultsContainer.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';

    var self = this;

    api.search(query, 10).then(function(data) {
      if (data && data.results && data.results.length > 0) {
        var items = data.results.map(function(item) { return api.normalizeItem(item); });
        self.resultsContainer.innerHTML = items.map(function(item) { return Cards.createSearchItem(item); }).join('');
      } else {
        self.resultsContainer.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:30px">'
          + '<p style="color:var(--text-muted)">Ничего не найдено</p></div>';
      }
    }).catch(function() {
      // При ошибке API — fallback на демо-данные
      var lower = query.toLowerCase();
      var results = DEMO_ANIME.filter(function(anime) {
        return anime.title.toLowerCase().indexOf(lower) !== -1 ||
               anime.titleOriginal.toLowerCase().indexOf(lower) !== -1;
      });

      if (results.length > 0) {
        self.resultsContainer.innerHTML = results.map(function(item) { return Cards.createSearchItem(item); }).join('');
      } else {
        self.resultsContainer.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:30px">'
          + '<p style="color:var(--text-muted)">Ничего не найдено</p></div>';
      }
    });
  },

  /**
   * Открыть поиск
   */
  open: function() {
    var dropdown = document.getElementById('searchDropdown');
    if (dropdown) {
      dropdown.classList.add('active');
      var self = this;
      setTimeout(function() {
        if (self.input) self.input.focus();
      }, 100);
    }
  },

  /**
   * Закрыть поиск
   */
  close: function() {
    var dropdown = document.getElementById('searchDropdown');
    if (dropdown) {
      dropdown.classList.remove('active');
    }
    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = '';
      this.resultsContainer.style.display = 'none';
    }
    if (this.input) {
      this.input.value = '';
    }
  }
};

// storage.js — хранение данных пользователя в LocalStorage
const Storage = {
  KEYS: {
    FAVORITES: 'animevault_favorites',
    HISTORY: 'animevault_history',
    PROGRESS: 'animevault_progress',
    SETTINGS: 'animevault_settings'
  },

  // ════════════════════════════════════════════
  // ИЗБРАННОЕ
  // ════════════════════════════════════════════

  /**
   * Получить список избранного
   * @returns {Array} массив объектов аниме
   */
  getFavorites() {
    try {
      const data = localStorage.getItem(this.KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Добавить аниме в избранное
   * @param {object} anime - { id, shikimoriId, title, poster }
   */
  addFavorite(anime) {
    const favorites = this.getFavorites();
    if (!favorites.some(fav => fav.id === anime.id || fav.shikimoriId === anime.shikimoriId)) {
      favorites.unshift({
        id: anime.id,
        shikimoriId: anime.shikimoriId,
        title: anime.title,
        titleOriginal: anime.titleOriginal || '',
        poster: anime.poster || '',
        rating: anime.rating || 0,
        year: anime.year || 0,
        genres: anime.genres || [],
        addedAt: Date.now()
      });
      localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
      return true;
    }
    return false;
  },

  /**
   * Удалить аниме из избранного
   * @param {string|number} id - ID аниме (shikimoriId или локальный id)
   */
  removeFavorite(id) {
    const favorites = this.getFavorites();
    const filtered = favorites.filter(fav => fav.id !== id && fav.shikimoriId !== id);
    if (filtered.length !== favorites.length) {
      localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(filtered));
      return true;
    }
    return false;
  },

  /**
   * Проверить, в избранном ли аниме
   * @param {string|number} id
   * @returns {boolean}
   */
  isFavorite(id) {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav.id === id || fav.shikimoriId === id);
  },

  // ════════════════════════════════════════════
  // ИСТОРИЯ ПРОСМОТРОВ
  // ════════════════════════════════════════════

  /**
   * Получить историю просмотров
   * @returns {Array} массив записей
   */
  getHistory() {
    try {
      const data = localStorage.getItem(this.KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Добавить/обновить запись в истории
   * @param {object} anime - { id, shikimoriId, title, poster, episode, progress }
   */
  addToHistory(anime) {
    const history = this.getHistory();
    const index = history.findIndex(h => h.id === anime.id || h.shikimoriId === anime.shikimoriId);
    
    const entry = {
      id: anime.id,
      shikimoriId: anime.shikimoriId,
      title: anime.title,
      titleOriginal: anime.titleOriginal || '',
      poster: anime.poster || '',
      episode: anime.episode || 1,
      totalEpisodes: anime.totalEpisodes || 0,
      progress: anime.progress || 0,
      translation: anime.translation || '',
      timestamp: Date.now()
    };

    if (index !== -1) {
      // Обновляем существующую запись и перемещаем вверх
      history.splice(index, 1);
      history.unshift(entry);
    } else {
      history.unshift(entry);
    }

    // Ограничиваем историю 100 записями
    if (history.length > 100) {
      history.length = 100;
    }

    localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
    return entry;
  },

  /**
   * Удалить запись из истории
   * @param {string|number} id
   */
  removeFromHistory(id) {
    const history = this.getHistory();
    const filtered = history.filter(h => h.id !== id && h.shikimoriId !== id);
    localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(filtered));
  },

  /**
   * Очистить всю историю
   */
  clearHistory() {
    localStorage.setItem(this.KEYS.HISTORY, JSON.stringify([]));
  },

  // ════════════════════════════════════════════
  // ПРОГРЕСС СЕРИЙ
  // ════════════════════════════════════════════

  /**
   * Сохранить прогресс просмотра
   * @param {string|number} animeId
   * @param {number} episode - номер серии
   * @param {string} translation - название перевода
   * @param {number} progress - процент просмотра (0-100)
   */
  saveProgress(animeId, episode, translation = '', progress = 0) {
    const allProgress = this.getAllProgress();
    allProgress[animeId] = {
      episode,
      translation,
      progress,
      timestamp: Date.now()
    };
    localStorage.setItem(this.KEYS.PROGRESS, JSON.stringify(allProgress));
  },

  /**
   * Получить прогресс для конкретного аниме
   * @param {string|number} animeId
   * @returns {{ episode, translation, progress, timestamp }|null}
   */
  getProgress(animeId) {
    const allProgress = this.getAllProgress();
    return allProgress[animeId] || null;
  },

  /**
   * Получить весь прогресс
   */
  getAllProgress() {
    try {
      const data = localStorage.getItem(this.KEYS.PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  // ════════════════════════════════════════════
  // НАСТРОЙКИ
  // ════════════════════════════════════════════

  /**
   * Получить настройки
   * @returns {object}
   */
  getSettings() {
    try {
      const data = localStorage.getItem(this.KEYS.SETTINGS);
      return data ? JSON.parse(data) : this.getDefaultSettings();
    } catch {
      return this.getDefaultSettings();
    }
  },

  /**
   * Сохранить настройки
   * @param {object} settings - { quality, autoplay, language }
   */
  saveSettings(settings) {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(updated));
  },

  /**
   * Настройки по умолчанию
   */
  getDefaultSettings() {
    return {
      quality: CONFIG.DEFAULT_QUALITY || '720p',
      autoplay: true,
      language: 'русская'
    };
  }
};

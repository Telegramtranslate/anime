// api.js — работа с Kodik API
class KodikAPI {
  constructor() {
    this.baseUrl = CONFIG.KODIK_API_URL;
    this.token = CONFIG.KODIK_TOKEN;
  }

  /**
   * Базовый POST-запрос к Kodik API
   * @param {string} endpoint - эндпоинт (search, list, translations)
   * @param {object} params - параметры запроса
   */
  async request(endpoint, params) {
    params = params || {};
    var url = this.baseUrl + '/' + endpoint + '?token=' + this.token;

    try {
      var response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params)
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      return await response.json();
    } catch (error) {
      console.warn('Ошибка Kodik API (' + endpoint + '):', error.message);
      return null;
    }
  }

  /**
   * Удалить дубликаты по shikimori_id
   */
  deduplicate(results) {
    if (!results || !Array.isArray(results)) return [];
    var seen = {};
    return results.filter(function(item) {
      var id = item.shikimori_id || item.id;
      if (seen[id]) return false;
      seen[id] = true;
      return true;
    });
  }

  /**
   * Получить список популярных (по просмотрам)
   */
  async getPopular(limit, page) {
    limit = limit || 20;
    page = page || 1;
    var data = await this.request('list', {
      types: 'anime-serial,anime',
      limit: String(limit * 2), // запрашиваем с запасом для дедупликации
      page: String(page),
      with_material_data: 'true',
      sort: 'views',
      order: 'desc'
    });
    if (data && data.results) {
      data.results = this.deduplicate(data.results).slice(0, limit);
      data.total = data.results.length;
    }
    return data;
  }

  /**
   * Поиск по названию
   */
  async search(query, limit) {
    limit = limit || 20;
    var data = await this.request('search', {
      title: query,
      with_material_data: 'true',
      limit: String(limit * 2)
    });
    if (data && data.results) {
      data.results = this.deduplicate(data.results).slice(0, limit);
    }
    return data;
  }

  /**
   * Поиск по Shikimori ID
   */
  async getByShikimoriId(id) {
    var data = await this.request('search', {
      shikimori_id: String(id),
      with_material_data: 'true'
    });
    if (data && data.results) {
      data.results = this.deduplicate(data.results);
    }
    return data;
  }

  /**
   * Фильтрация с параметрами
   */
  async filter(filters) {
    filters = filters || {};
    var params = {
      types: 'anime-serial,anime',
      with_material_data: 'true',
      limit: String(filters.limit || 24),
      page: String(filters.page || 1)
    };

    // Жанры — передаём как есть
    if (filters.genre) params.genre = filters.genre;
    if (filters.year) params.year = String(filters.year);

    // Статус
    if (filters.status === 'ongoing' || filters.status === 'Онгоинг') params.material_status = 'ongoing';
    else if (filters.status === 'released' || filters.status === 'Завершён') params.material_status = 'released';
    else if (filters.status === 'announced' || filters.status === 'Анонс') params.material_status = 'announced';

    // Сортировка
    switch (filters.sort) {
      case 'rating':
        params.sort = 'shikimori_rating';
        params.order = 'desc';
        break;
      case 'date':
        params.sort = 'updated_at';
        params.order = 'desc';
        break;
      case 'title':
        params.sort = 'title';
        params.order = 'asc';
        break;
      case 'year':
        params.sort = 'year';
        params.order = 'desc';
        break;
      default:
        params.sort = 'views';
        params.order = 'desc';
    }

    // Запрашиваем с запасом для дедупликации
    var originalLimit = params.limit;
    params.limit = String(parseInt(params.limit) * 2);

    var data = await this.request('list', params);
    if (data && data.results) {
      data.results = this.deduplicate(data.results).slice(0, parseInt(originalLimit));
    }
    return data;
  }

  /**
   * Получить URL плеера
   */
  getPlayerUrl(link, quality) {
    quality = quality || CONFIG.DEFAULT_QUALITY || '720p';
    if (!link) return '';
    var cleanLink = link;
    if (cleanLink.startsWith('//')) cleanLink = 'https:' + cleanLink;
    else if (!cleanLink.startsWith('http')) cleanLink = 'https://kodik.info/' + cleanLink;
    return cleanLink + '?translations=false&quality=' + quality;
  }

  /**
   * Обработать элемент Kodik в единый формат
   */
  normalizeItem(item) {
    var material = item.material_data || {};
    return {
      id: item.id,
      shikimoriId: item.shikimori_id || item.id,
      title: item.title || material.russian || 'Без названия',
      titleOriginal: item.title_orig || material.english || material.japanese || '',
      poster: '', // HTML-постеры в cards.js
      description: material.description || 'Описание отсутствует',
      genres: Array.isArray(material.genres) ? material.genres : [],
      year: item.year || material.year || 0,
      rating: material.shikimori_rating ? parseFloat(material.shikimori_rating) : 0,
      episodes: item.episodes_count || material.episodes || 0,
      episodesCount: item.episodes_count || 0,
      lastEpisode: item.last_episode || 1,
      status: this._getStatusText(material.status || item.status),
      studio: material.studio || '',
      link: item.link || '',
      translation: item.translation || null
    };
  }

  /**
   * Статус на русский
   */
  _getStatusText(status) {
    if (!status) return 'Неизвестно';
    var map = { 'ongoing': 'Онгоинг', 'released': 'Завершён', 'announced': 'Анонс', 'latest': 'Онгоинг' };
    return map[status.toLowerCase()] || status;
  }
}

var api = new KodikAPI();

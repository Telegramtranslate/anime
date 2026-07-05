// api.js — работа с Kodik API (Vercel proxy + CORS fallback)
class KodikAPI {
  constructor() {
    this.token = CONFIG.KODIK_TOKEN;
    this.useProxy = false; // определится автоматически
  }

  /**
   * Базовый запрос к Kodik API
   * Стратегия: Vercel proxy -> напрямую -> CORS прокси -> DEMO
   */
  async request(endpoint, params) {
    params = params || {};
    var queryStr = Object.keys(params).map(function(k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }).join('&');

    // 1. Пробуем Vercel proxy (если сайт на Vercel)
    try {
      var proxyResp = await fetch('/api/kodik?endpoint=' + endpoint + '&' + queryStr);
      if (proxyResp.ok) {
        var data = await proxyResp.json();
        if (data && data.results) {
          this.useProxy = true;
          return data;
        }
      }
    } catch(e) {}

    // 2. Пробуем напрямую (POST)
    var apiUrl = CONFIG.KODIK_API_URL + '/' + endpoint + '?token=' + this.token;
    if (queryStr) apiUrl += '&' + queryStr;

    try {
      var response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      if (response.ok) {
        var directData = await response.json();
        if (directData && directData.results) return directData;
      }
    } catch(e) {}

    // 3. Пробуем CORS-прокси
    var proxies = [
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url=',
    ];
    
    for (var p = 0; p < proxies.length; p++) {
      try {
        var proxyUrl = proxies[p] + encodeURIComponent(apiUrl);
        var pr = await fetch(proxyUrl);
        if (pr.ok) {
          var text = await pr.text();
          try {
            var json = JSON.parse(text);
            if (json && json.results) return json;
            // allorigins оборачивает в { contents }
            if (json && json.contents) {
              var parsed = JSON.parse(json.contents);
              if (parsed && parsed.results) return parsed;
            }
          } catch(e) {}
        }
      } catch(e) {}
    }

    return null;
  }

  /**
   * Дедупликация по shikimori_id
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
   * Популярные
   */
  async getPopular(limit, page) {
    limit = limit || 20;
    page = page || 1;
    var data = await this.request('list', {
      types: 'anime-serial,anime',
      limit: String(limit * 2),
      page: String(page),
      with_material_data: 'true',
      sort: 'shikimori_rating',
      order: 'desc'
    });
    if (data && data.results) {
      data.results = this.deduplicate(data.results).slice(0, limit);
    }
    return data;
  }

  /**
   * Поиск
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
   * Фильтрация
   */
  async filter(filters) {
    filters = filters || {};
    var params = {
      types: 'anime-serial,anime',
      with_material_data: 'true',
      limit: String(filters.limit || 24),
      page: String(filters.page || 1)
    };

    if (filters.genre) params.genre = filters.genre;
    if (filters.year) params.year = String(filters.year);
    if (filters.status === 'ongoing' || filters.status === 'Онгоинг') params.material_status = 'ongoing';
    else if (filters.status === 'released' || filters.status === 'Завершён') params.material_status = 'released';
    else if (filters.status === 'announced' || filters.status === 'Анонс') params.material_status = 'announced';

    switch (filters.sort) {
      case 'rating': params.sort = 'shikimori_rating'; params.order = 'desc'; break;
      case 'date': params.sort = 'updated_at'; params.order = 'desc'; break;
      case 'title': params.sort = 'title'; params.order = 'asc'; break;
      case 'year': params.sort = 'year'; params.order = 'desc'; break;
      default: params.sort = 'shikimori_rating'; params.order = 'desc';
    }

    var originalLimit = params.limit;
    params.limit = String(parseInt(params.limit) * 2);

    var data = await this.request('list', params);
    if (data && data.results) {
      data.results = this.deduplicate(data.results).slice(0, parseInt(originalLimit));
    }
    return data;
  }

  /**
   * URL плеера
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
   * Нормализация элемента
   */
  normalizeItem(item) {
    var material = item.material_data || {};
    return {
      id: item.id,
      shikimoriId: item.shikimori_id || item.id,
      title: this._cleanTitle(item.title || material.russian || 'Без названия'),
      titleOriginal: item.title_orig || material.english || material.japanese || '',
      poster: '',
      description: material.description || 'Описание отсутствует',
      genres: Array.isArray(material.genres) ? material.genres : [],
      year: item.year || material.year || 0,
      rating: material.shikimori_rating ? parseFloat(material.shikimori_rating) : 0,
      episodes: item.episodes_count || material.episodes || 0,
      episodesCount: item.episodes_count || 0,
      lastEpisode: item.last_episode || 1,
      status: this._statusText(material.status || item.status),
      studio: material.studio || '',
      link: item.link || '',
      translation: item.translation || null
    };
  }

  /**
   * Очистить название от лишнего
   */
  _cleanTitle(title) {
    if (!title) return 'Без названия';
    // Убираем [ТВ-4, часть 1] в конце
    return title.replace(/\s*\[.*?\]\s*$/, '').trim();
  }

  _statusText(status) {
    if (!status) return 'Неизвестно';
    var map = { 'ongoing': 'Онгоинг', 'released': 'Завершён', 'announced': 'Анонс', 'latest': 'Онгоинг' };
    return map[status.toLowerCase()] || status;
  }
}

var api = new KodikAPI();

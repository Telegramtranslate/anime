// api.js — работа с Kodik API (через Vercel proxy или напрямую)
class KodikAPI {
  constructor() {
    this.token = CONFIG.KODIK_TOKEN;
    this.onVercel = window.location.hostname !== 'localhost' 
      && window.location.hostname !== '127.0.0.1'
      && window.location.hostname !== ''
      && !window.location.href.startsWith('file://');
  }

  /**
   * Запрос к Kodik API
   * На Vercel: через /api/kodik (решает CORS)
   * Локально: напрямую POST, потом CORS-прокси
   */
  async request(endpoint, params) {
    var queryStr = '';
    if (params) {
      queryStr = Object.keys(params).map(function(k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
      }).join('&');
    }

    // Если на Vercel — через серверную функцию (нет CORS проблем)
    if (this.onVercel) {
      try {
        var url = '/api/kodik?endpoint=' + endpoint + '&' + queryStr;
        var resp = await fetch(url);
        if (resp.ok) {
          var data = await resp.json();
          if (data && data.results) return data;
        }
      } catch(e) {}
      return null;
    }

    // Локально — пробуем напрямую (POST)
    var apiUrl = CONFIG.KODIK_API_URL + '/' + endpoint + '?token=' + this.token;
    if (queryStr) apiUrl += '&' + queryStr;

    try {
      var resp = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      if (resp.ok) {
        var data = await resp.json();
        if (data && data.results) return data;
      }
    } catch(e) {}

    // Локально — через CORS-прокси
    try {
      var proxyResp = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(apiUrl));
      if (proxyResp.ok) {
        var text = await proxyResp.text();
        try {
          var json = JSON.parse(text);
          if (json && json.results) return json;
        } catch(e) {}
      }
    } catch(e) {}

    return null;
  }

  /**
   * Удалить дубликаты (один shikimori_id — один результат)
   */
  deduplicate(arr) {
    if (!arr || !Array.isArray(arr)) return [];
    var seen = {}, result = [];
    for (var i = 0; i < arr.length; i++) {
      var id = arr[i].shikimori_id || arr[i].id;
      if (!seen[id]) {
        seen[id] = true;
        result.push(arr[i]);
      }
    }
    return result;
  }

  /**
   * Популярные аниме (по рейтингу)
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
   * Фильтрация каталога
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
    if (filters.status === 'ongoing') params.material_status = 'ongoing';
    else if (filters.status === 'released') params.material_status = 'released';
    else if (filters.status === 'announced') params.material_status = 'announced';

    switch (filters.sort) {
      case 'rating': params.sort = 'shikimori_rating'; params.order = 'desc'; break;
      case 'date':   params.sort = 'updated_at';       params.order = 'desc'; break;
      case 'title':  params.sort = 'title';             params.order = 'asc';  break;
      case 'year':   params.sort = 'year';              params.order = 'desc'; break;
      default:       params.sort = 'shikimori_rating';  params.order = 'desc';
    }

    var origLimit = params.limit;
    params.limit = String(parseInt(params.limit) * 2);

    var data = await this.request('list', params);
    if (data && data.results) {
      data.results = this.deduplicate(data.results).slice(0, parseInt(origLimit));
    }
    return data;
  }

  /**
   * URL плеера Kodik
   */
  getPlayerUrl(link, quality) {
    quality = quality || '720p';
    if (!link) return '';
    var cl = link;
    if (cl.startsWith('//')) cl = 'https:' + cl;
    else if (!cl.startsWith('http')) cl = 'https://kodik.info/' + cl;
    return cl + '?translations=false&quality=' + quality;
  }

  /**
   * Нормализовать элемент из Kodik в формат сайта
   */
  normalizeItem(item) {
    var m = item.material_data || {};
    // Очищаем название от [ТВ-4, часть 1]
    var title = (item.title || m.russian || 'Без названия').replace(/\s*\[.*?\]\s*$/, '').trim();
    return {
      id: item.id,
      shikimoriId: item.shikimori_id || item.id,
      title: title,
      titleOriginal: item.title_orig || m.english || m.japanese || '',
      poster: '',  // Генерируется в cards.js (HTML-градиент)
      description: m.description || 'Описание отсутствует',
      genres: Array.isArray(m.genres) ? m.genres : [],
      year: item.year || m.year || 0,
      rating: m.shikimori_rating ? parseFloat(m.shikimori_rating) : 0,
      episodes: item.episodes_count || m.episodes || 0,
      episodesCount: item.episodes_count || 0,
      lastEpisode: item.last_episode || 1,
      status: this._statusText(m.status || item.status),
      studio: m.studio || '',
      link: item.link || '',
      translation: item.translation || null
    };
  }

  _statusText(s) {
    if (!s) return 'Неизвестно';
    var map = { ongoing: 'Онгоинг', released: 'Завершён', announced: 'Анонс', latest: 'Онгоинг' };
    return map[s.toLowerCase()] || s;
  }
}

var api = new KodikAPI();

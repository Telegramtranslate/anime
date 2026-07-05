// api.js — работа с Kodik API
// На Vercel: /api/kodik проксирует запросы (решает CORS)
// Локально: POST напрямую

class KodikAPI {
  constructor() {
    this.token = CONFIG.KODIK_TOKEN;
  }

  /**
   * Запрос к Kodik API
   * Стратегия:
   *   1. /api/kodik (Vercel proxy — всегда работает)
   *   2. Прямой POST (для локальной разработки)
   *   3. null → DEMO_ANIME как fallback
   */
  async request(endpoint, params) {
    var qs = params ? Object.keys(params).map(function(k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }).join('&') : '';

    // 1. Пробуем Vercel proxy
    try {
      var r = await fetch('/api/kodik?endpoint=' + endpoint + '&' + qs);
      if (r.ok) {
        var d = await r.json();
        if (d && d.results) return d;
      }
    } catch(e) {}

    // 2. Пробуем напрямую (POST)
    try {
      var url2 = CONFIG.KODIK_API_URL + '/' + endpoint + '?token=' + this.token;
      if (qs) url2 += '&' + qs;
      var r2 = await fetch(url2, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      if (r2.ok) {
        var d2 = await r2.json();
        if (d2 && d2.results) return d2;
      }
    } catch(e) {}

    return null;
  }

  // Дедупликация
  deduplicate(arr) {
    if (!arr) return [];
    var seen = {}, out = [];
    for (var i = 0; i < arr.length; i++) {
      var id = arr[i].shikimori_id || arr[i].id;
      if (!seen[id]) { seen[id] = true; out.push(arr[i]); }
    }
    return out;
  }

  // Популярные
  async getPopular(limit, page) {
    limit = limit || 20;
    page = page || 1;
    var data = await this.request('list', {
      types: 'anime-serial,anime',
      limit: String(limit * 2), page: String(page),
      with_material_data: 'true',
      sort: 'shikimori_rating', order: 'desc'
    });
    if (data && data.results) data.results = this.deduplicate(data.results).slice(0, limit);
    return data;
  }

  // Поиск
  async search(query, limit) {
    limit = limit || 20;
    var data = await this.request('search', {
      title: query, with_material_data: 'true', limit: String(limit * 2)
    });
    if (data && data.results) data.results = this.deduplicate(data.results).slice(0, limit);
    return data;
  }

  // Поиск по Shikimori ID
  async getByShikimoriId(id) {
    var data = await this.request('search', { shikimori_id: String(id), with_material_data: 'true' });
    if (data && data.results) data.results = this.deduplicate(data.results);
    return data;
  }

  // Фильтрация
  async filter(filters) {
    filters = filters || {};
    var p = {
      types: 'anime-serial,anime', with_material_data: 'true',
      limit: String(filters.limit || 24), page: String(filters.page || 1)
    };
    if (filters.genre) p.genre = filters.genre;
    if (filters.year) p.year = String(filters.year);
    if (filters.status === 'ongoing') p.material_status = 'ongoing';
    else if (filters.status === 'released') p.material_status = 'released';
    else if (filters.status === 'announced') p.material_status = 'announced';
    switch (filters.sort) {
      case 'rating': p.sort = 'shikimori_rating'; p.order = 'desc'; break;
      case 'date':   p.sort = 'updated_at';       p.order = 'desc'; break;
      case 'title':  p.sort = 'title';             p.order = 'asc';  break;
      case 'year':   p.sort = 'year';              p.order = 'desc'; break;
      default:       p.sort = 'shikimori_rating';  p.order = 'desc';
    }
    var origLimit = p.limit;
    p.limit = String(parseInt(p.limit) * 2);
    var data = await this.request('list', p);
    if (data && data.results) data.results = this.deduplicate(data.results).slice(0, parseInt(origLimit));
    return data;
  }

  // URL плеера
  getPlayerUrl(link, quality) {
    quality = quality || '720p';
    if (!link) return '';
    var cl = link;
    if (cl.startsWith('//')) cl = 'https:' + cl;
    else if (!cl.startsWith('http')) cl = 'https://kodik.info/' + cl;
    return cl + '?translations=false&quality=' + quality;
  }

  // Нормализация
  normalizeItem(item) {
    var m = item.material_data || {};
    var title = (item.title || m.russian || 'Без названия')
      .replace(/\s*\[.*?\]\s*$/, '').trim();
    return {
      id: item.id,
      shikimoriId: item.shikimori_id || item.id,
      title: title,
      titleOriginal: item.title_orig || m.english || m.japanese || '',
      poster: '',
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

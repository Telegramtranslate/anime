// cards.js — генерация карточек аниме
const Cards = {

  /**
   * Набор цветовых схем для постеров (без #)
   */
  _colors: [
    ['1a0a2e', '16213e'], ['0a1628', '1a1a2e'],
    ['1a0f0a', '2e1a10'], ['0a1a14', '102e1a'],
    ['1a0a14', '2e1020'], ['0f0f1a', '1a1a2e'],
    ['0a1a1a', '0f2a1a'], ['1a1410', '2e1a0a'],
  ],

  /**
   * Выбрать цвета по хэшу названия
   */
  _getColors(title) {
    var hash = 0;
    for (var i = 0; i < Math.min(title.length, 20); i++) {
      hash = ((hash << 5) - hash) + title.charCodeAt(i);
      hash = hash & hash;
    }
    var idx = Math.abs(hash) % this._colors.length;
    return this._colors[idx];
  },

  /**
   * Создать HTML-постер (Background градиент + текст)
   */
  _makePoster(title, size, progress) {
    var colors = this._getColors(title);
    var c1 = colors[0], c2 = colors[1];
    var letter = title.charAt(0).toUpperCase();
    var shortTitle = title.length > 40 ? title.substring(0, 37) + '…' : title;
    var safeTitle = shortTitle.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var isLandscape = size === 'landscape';

    return '<div class="anime-card-poster-bg" style="background:linear-gradient(135deg,#' + c1 + ',#' + c2 + ');position:absolute;top:0;left:0;width:100%;height:100%">'
      + '<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#c9a84c,transparent);opacity:0.5"></div>'
      + '<div style="position:absolute;inset:0;background-image:radial-gradient(circle at 10px 10px,rgba(201,168,76,0.06) 1px,transparent 1px);background-size:20px 20px"></div>'
      + '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-60%);text-align:center;width:100%">'
      + '<div style="font-family:Cinzel,serif;font-size:' + (isLandscape ? '64' : '72') + 'px;font-weight:800;color:rgba(201,168,76,0.12);line-height:1">' + letter + '</div>'
      + '<div style="font-size:10px;color:rgba(201,168,76,0.25);margin-top:4px">&#9673;</div>'
      + '</div>'
      + '<div style="position:absolute;bottom:16px;left:16px;right:16px;text-align:center">'
      + '<div style="font-family:Cinzel,serif;font-size:' + (isLandscape ? '11' : '12') + 'px;font-weight:600;color:#e8e8e8;text-shadow:0 1px 4px rgba(0,0,0,0.5);line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + safeTitle + '</div>'
      + '</div>'
      + (progress > 0 ? '<div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.1)"><div style="height:100%;width:' + progress + '%;background:#c9a84c;box-shadow:0 0 8px rgba(201,168,76,0.5);transition:width 0.3s"></div></div>' : '')
      + '</div>';
  },

  /**
   * Создать HTML карточки аниме
   */
  create(anime, size, showFav, progress) {
    size = size || 'poster';
    showFav = showFav !== false;
    progress = progress || 0;

    var isFav = Storage.isFavorite(anime.id || anime.shikimoriId);
    var sizeClass = size === 'landscape' ? 'anime-card-landscape' : 'anime-card-poster';
    var favClass = isFav ? 'active' : '';
    var posterHtml = this._makePoster(anime.title, size, progress);
    var genresHtml = Array.isArray(anime.genres)
      ? anime.genres.slice(0, 3).map(function(g) { return '<span class="anime-card-genre">' + g + '</span>'; }).join('')
      : '';

    return '<div class="anime-card ' + sizeClass + '" data-id="' + (anime.id || anime.shikimoriId) + '" data-shikimori="' + anime.shikimoriId + '">'
      + posterHtml
      + '<div class="anime-card-gradient"></div>'
      + (showFav ? '<button class="anime-card-fav ' + favClass + '" onclick="event.stopPropagation(); Cards.toggleFav(\'' + (anime.id || anime.shikimoriId) + '\', this)" title="' + (isFav ? 'Удалить из избранного' : 'В избранное') + '">'
        + '<svg viewBox="0 0 24 24" fill="' + (isFav ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2">'
        + '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'
        + '</svg></button>' : '')
      + '<div class="anime-card-info">'
      + '<div class="anime-card-title">' + anime.title + '</div>'
      + '<div class="anime-card-meta">'
      + (anime.rating ? '<span class="anime-card-rating"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> ' + anime.rating + '</span>' : '')
      + (anime.year ? '<span>' + anime.year + '</span>' : '')
      + (anime.episodes ? '<span>' + anime.episodes + ' эп.</span>' : '')
      + '</div>'
      + (genresHtml ? '<div class="anime-card-genres">' + genresHtml + '</div>' : '')
      + '</div>'
      + '<div class="anime-card-overlay" onclick="Cards.openPlayer(\'' + (anime.shikimoriId || anime.id) + '\')">'
      + '<div class="anime-card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>'
      + (anime.description ? '<div class="anime-card-description">' + anime.description.substring(0, 120) + (anime.description.length > 120 ? '...' : '') + '</div>' : '')
      + '<button class="btn btn-gold btn-sm">Смотреть</button>'
      + '</div></div>';
  },

  /**
   * Создать HTML для поиска (маленький постер)
   */
  createSearchItem(anime) {
    var colors = this._getColors(anime.title);
    var letter = anime.title.charAt(0).toUpperCase();
    return '<div class="search-result-item" onclick="Cards.openPlayer(\'' + (anime.shikimoriId || anime.id) + '\')">'
      + '<div style="width:40px;height:56px;border-radius:6px;flex-shrink:0;background:linear-gradient(135deg,#' + colors[0] + ',#' + colors[1] + ');display:flex;align-items:center;justify-content:center;font-family:Cinzel,serif;font-size:20px;font-weight:800;color:rgba(201,168,76,0.2);overflow:hidden;position:relative">'
      + '<div style="position:absolute;inset:0;background-image:radial-gradient(circle at 6px 6px,rgba(201,168,76,0.06) 1px,transparent 1px);background-size:12px 12px"></div>'
      + letter
      + '</div>'
      + '<div class="info"><div class="title">' + anime.title + '</div><div class="year">' + (anime.year || '') + (anime.rating ? ' • ★ ' + anime.rating : '') + '</div></div>'
      + '</div>';
  },

  /**
   * Создать элемент истории
   */
  createHistoryItem(entry) {
    var colors = this._getColors(entry.title);
    var date = new Date(entry.timestamp);
    var dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    var progressPercent = entry.totalEpisodes > 0
      ? Math.round((entry.episode / entry.totalEpisodes) * 100)
      : (entry.progress || 0);

    return '<div class="history-item" onclick="Cards.openPlayer(\'' + (entry.shikimoriId || entry.id) + '\', ' + (entry.episode || 1) + ')">'
      + '<div style="width:56px;height:80px;border-radius:8px;flex-shrink:0;background:linear-gradient(135deg,#' + colors[0] + ',#' + colors[1] + ');display:flex;align-items:center;justify-content:center;font-family:Cinzel,serif;font-size:28px;font-weight:800;color:rgba(201,168,76,0.2);overflow:hidden;position:relative">'
      + '<div style="position:absolute;inset:0;background-image:radial-gradient(circle at 8px 8px,rgba(201,168,76,0.06) 1px,transparent 1px);background-size:16px 16px"></div>'
      + entry.title.charAt(0).toUpperCase()
      + '</div>'
      + '<div class="history-item-info">'
      + '<div class="history-item-title">' + entry.title + '</div>'
      + '<div class="history-item-episode">Серия ' + (entry.episode || 1) + (entry.totalEpisodes ? ' из ' + entry.totalEpisodes : '') + '</div>'
      + '<div class="history-item-progress"><div class="progress-bar"><div class="progress-bar-fill" style="width:' + progressPercent + '%"></div></div><span class="progress-text">' + progressPercent + '%</span></div>'
      + '</div>'
      + '<div class="history-item-date">' + dateStr + '</div>'
      + '<div class="history-item-actions">'
      + '<button class="btn btn-gold btn-sm" onclick="event.stopPropagation(); Cards.openPlayer(\'' + (entry.shikimoriId || entry.id) + '\', ' + (entry.episode || 1) + ')">Продолжить</button>'
      + '<button class="history-item-delete" onclick="event.stopPropagation(); Cards.removeFromHistory(\'' + (entry.shikimoriId || entry.id) + '\', this)" title="Удалить"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>'
      + '</div></div>';
  },

  /**
   * Переключить избранное
   */
  toggleFav: function(id, btn) {
    var anime = this.findAnimeById(id);
    if (!anime) return;

    if (Storage.isFavorite(id)) {
      Storage.removeFavorite(id);
      btn.classList.remove('active');
      btn.querySelector('svg').setAttribute('fill', 'none');
      btn.setAttribute('title', 'В избранное');
      Toast.show('Удалено из избранного');
    } else {
      Storage.addFavorite(anime);
      btn.classList.add('active');
      btn.querySelector('svg').setAttribute('fill', 'currentColor');
      btn.setAttribute('title', 'Удалить из избранного');
      Toast.show('Добавлено в избранное ✓');
    }
  },

  /**
   * Найти аниме по ID среди демо-данных
   */
  findAnimeById: function(id) {
    return DEMO_ANIME.find(function(a) { return a.id === id || a.shikimoriId === id; });
  },

  /**
   * Открыть плеер
   */
  openPlayer: function(shikimoriId, episode) {
    episode = episode || 1;
    if (shikimoriId) {
      window.location.href = 'player.html?shikimori_id=' + shikimoriId + '&ep=' + episode;
    }
  },

  /**
   * Удалить из истории
   */
  removeFromHistory: function(id, el) {
    Storage.removeFromHistory(id);
    var item = el.closest('.history-item');
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    item.style.transition = 'all 0.3s ease';
    setTimeout(function() { item.remove(); }, 300);
    Toast.show('Запись удалена');
  }
};

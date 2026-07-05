// player.js — логика плеера, серии, переводы
class AnimePlayer {
  constructor() {
    this.currentAnime = null;
    this.currentEpisode = 1;
    this.currentTranslation = null;
    this.episodes = [];
    this.translations = [];
    this.totalEpisodes = 1;
    this.iframe = document.getElementById('kodikPlayer');
    this.isLoading = false;
  }

  /**
   * Инициализация из URL параметров
   * URL: player.html?shikimori_id=16498&ep=1
   */
  async init() {
    const params = new URLSearchParams(window.location.search);
    const shikimoriId = params.get('shikimori_id');
    const episode = parseInt(params.get('ep')) || 1;

    if (!shikimoriId) {
      this.showError('Не указан ID аниме');
      return;
    }

    this.currentEpisode = episode;

    // Пробуем получить данные из Kodik API
    const data = await api.getByShikimoriId(shikimoriId);
    
    if (data && data.results && data.results.length > 0) {
      this.loadAnime(data.results[0], episode);
    } else {
      // Fallback на демо-данные
      const demo = DEMO_ANIME.find(a => a.shikimoriId === shikimoriId || a.id === shikimoriId);
      if (demo) {
        this.loadAnimeFromDemo(demo, episode);
      } else {
        this.showError('Аниме не найдено');
      }
    }

    // Инициализация кнопок навигации
    this.initNavButtons();
  }

  /**
   * Загрузить аниме из ответа Kodik API
   */
  loadAnime(data, episode) {
    this.currentAnime = api.normalizeItem(data);
    this.totalEpisodes = this.currentAnime.episodesCount || this.currentAnime.episodes || 1;
    
    // Создаем список серий
    this.episodes = [];
    for (let i = 1; i <= this.totalEpisodes; i++) {
      this.episodes.push({
        number: i,
        title: `Серия ${i}`,
        link: this.currentAnime.link
      });
    }

    // Загружаем плеер
    this.loadPlayer(episode);
    
    // Обновляем информацию
    this.updateInfo();
    
    // Заполняем список серий
    this.renderEpisodes();
    
    // Сохраняем в историю
    Storage.addToHistory({
      id: this.currentAnime.id,
      shikimoriId: this.currentAnime.shikimoriId,
      title: this.currentAnime.title,
      poster: this.currentAnime.poster,
      episode: episode,
      totalEpisodes: this.totalEpisodes,
      progress: Math.round((episode / this.totalEpisodes) * 100)
    });

    // Загружаем похожие
    this.loadSimilar();
  }

  /**
   * Загрузить из демо-данных
   */
  loadAnimeFromDemo(demo, episode) {
    this.currentAnime = demo;
    this.totalEpisodes = demo.episodes || 1;
    
    this.episodes = [];
    for (let i = 1; i <= this.totalEpisodes; i++) {
      this.episodes.push({
        number: i,
        title: `Серия ${i}`,
        link: demo.playerLink || ''
      });
    }

    this.loadPlayer(episode);
    this.updateInfo();
    this.renderEpisodes();
    
    Storage.addToHistory({
      id: demo.id,
      shikimoriId: demo.shikimoriId,
      title: demo.title,
      poster: demo.poster,
      episode: episode,
      totalEpisodes: this.totalEpisodes,
      progress: Math.round((episode / this.totalEpisodes) * 100)
    });

    this.loadSimilar();
  }

  /**
   * Загрузить плеер
   */
  loadPlayer(episode) {
    if (!this.iframe) return;

    this.currentEpisode = episode;
    this.isLoading = true;

    const link = this.episodes[episode - 1]?.link || this.currentAnime?.link || '';
    
    if (link) {
      const playerUrl = api.getPlayerUrl(link, CONFIG.DEFAULT_QUALITY);
      this.iframe.src = playerUrl;
    } else {
      // Демо-режим: используем тестовый плеер
      this.iframe.src = `https://kodik.info/seria/0/demo?shikimori_id=${this.currentAnime?.shikimoriId}&episode=${episode}`;
    }

    // Обновляем активную серию в списке
    document.querySelectorAll('.episode-item').forEach(el => {
      el.classList.toggle('active', parseInt(el.dataset.episode) === episode);
    });

    // Обновляем информацию о текущей серии
    const currentLabel = document.getElementById('currentEpisodeLabel');
    if (currentLabel) {
      currentLabel.textContent = `Серия ${episode} из ${this.totalEpisodes}`;
    }

    // Обновляем кнопки навигации
    this.updateNavButtons();

    this.isLoading = false;
  }

  /**
   * Сменить серию
   */
  changeEpisode(episode) {
    if (episode < 1 || episode > this.totalEpisodes || this.isLoading) return;
    this.loadPlayer(episode);
    
    // Сохраняем прогресс
    Storage.saveProgress(
      this.currentAnime.id || this.currentAnime.shikimoriId,
      episode,
      this.currentTranslation || '',
      Math.round((episode / this.totalEpisodes) * 100)
    );
  }

  /**
   * Сменить перевод
   */
  changeTranslation(translationId) {
    this.currentTranslation = translationId;
    // Перезагружаем плеер с новым переводом
    this.loadPlayer(this.currentEpisode);
  }

  /**
   * Обновить информацию об аниме
   */
  updateInfo() {
    const anime = this.currentAnime;
    if (!anime) return;

    // Постер — генерируем HTML-постер
    const posterContainer = document.getElementById('playerPoster');
    if (posterContainer) {
      var colors = Cards._getColors(anime.title);
      posterContainer.innerHTML = '<div style="width:100%;height:100%;border-radius:12px;background:linear-gradient(135deg,#' + colors[0] + ',#' + colors[1] + ');display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative">'
        + '<div style="position:absolute;inset:0;background-image:radial-gradient(circle at 10px 10px,rgba(201,168,76,0.06) 1px,transparent 1px);background-size:20px 20px"></div>'
        + '<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#c9a84c,transparent);opacity:0.5"></div>'
        + '<div style="font-family:Cinzel,serif;font-size:64px;font-weight:800;color:rgba(201,168,76,0.12)">' + anime.title.charAt(0).toUpperCase() + '</div>'
        + '</div>';
    }

    // Название
    const titleEl = document.getElementById('playerTitle');
    if (titleEl) titleEl.textContent = anime.title;

    // Оригинальное название
    const titleOrigEl = document.getElementById('playerTitleOriginal');
    if (titleOrigEl) titleOrigEl.textContent = anime.titleOriginal;

    // Описание
    const descEl = document.getElementById('playerDescription');
    if (descEl) descEl.textContent = anime.description || 'Описание отсутствует';

    // Теги
    const tagsEl = document.getElementById('playerTags');
    if (tagsEl) {
      const tags = [
        ...(Array.isArray(anime.genres) ? anime.genres : []),
        anime.year ? String(anime.year) : '',
        anime.status || ''
      ].filter(Boolean);
      tagsEl.innerHTML = tags.map(t => `<span class="tag">${t}</span>`).join('');
    }

    // Мета-данные
    const metaMap = {
      'Рейтинг': anime.rating ? `★ ${anime.rating}` : '—',
      'Статус': anime.status || '—',
      'Студия': anime.studio || '—',
      'Эпизодов': String(this.totalEpisodes),
      'Год': String(anime.year || '—')
    };

    const metaGrid = document.getElementById('playerMeta');
    if (metaGrid) {
      metaGrid.innerHTML = Object.entries(metaMap).map(([key, value]) => `
        <div class="meta-item">
          <div class="label">${key}</div>
          <div class="value">${value}</div>
        </div>
      `).join('');
    }
  }

  /**
   * Отрендерить список серий
   */
  renderEpisodes() {
    const list = document.getElementById('episodesList');
    if (!list) return;

    list.innerHTML = this.episodes.map(ep => {
      const isActive = ep.number === this.currentEpisode;
      const progress = Storage.getProgress(this.currentAnime?.id || this.currentAnime?.shikimoriId);
      const isWatched = progress && progress.episode >= ep.number;
      
      return `
        <div class="episode-item ${isActive ? 'active' : ''} ${isWatched ? 'watched' : ''}" 
             data-episode="${ep.number}" 
             onclick="player.changeEpisode(${ep.number})">
          <div class="episode-number">${ep.number}</div>
          <div class="episode-info">
            <div class="episode-title">${ep.title}</div>
            <div class="episode-meta">${isWatched ? 'Просмотрено' : 'Не просмотрено'}</div>
          </div>
          ${isWatched ? '<span class="episode-status">✓</span>' : ''}
        </div>
      `;
    }).join('');

    // Скролл к активной серии
    const activeEl = list.querySelector('.episode-item.active');
    if (activeEl) {
      setTimeout(() => {
        activeEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 200);
    }

    // Обновляем счетчик в заголовке
    const episodeCount = document.getElementById('episodeCount');
    if (episodeCount) {
      episodeCount.textContent = `${this.currentEpisode} / ${this.totalEpisodes}`;
    }
  }

  /**
   * Загрузить похожие аниме
   */
  loadSimilar() {
    const container = document.getElementById('similarGrid');
    if (!container) return;

    // Берем случайные аниме из демо-данных, исключая текущее
    const similar = DEMO_ANIME
      .filter(a => a.id !== this.currentAnime?.id && a.shikimoriId !== this.currentAnime?.shikimoriId)
      .slice(0, 6);

    if (similar.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = similar.map(item => Cards.create(item, 'poster', false)).join('');
  }

  /**
   * Инициализация кнопок навигации серий
   */
  initNavButtons() {
    const prevBtn = document.getElementById('prevEpisode');
    const nextBtn = document.getElementById('nextEpisode');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentEpisode > 1) {
          this.changeEpisode(this.currentEpisode - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentEpisode < this.totalEpisodes) {
          this.changeEpisode(this.currentEpisode + 1);
        }
      });
    }
  }

  /**
   * Обновить состояние кнопок навигации
   */
  updateNavButtons() {
    const prevBtn = document.getElementById('prevEpisode');
    const nextBtn = document.getElementById('nextEpisode');

    if (prevBtn) prevBtn.disabled = this.currentEpisode <= 1;
    if (nextBtn) nextBtn.disabled = this.currentEpisode >= this.totalEpisodes;
  }

  /**
   * Показать ошибку
   */
  showError(message) {
    const wrapper = document.querySelector('.player-wrapper');
    if (wrapper) {
      wrapper.innerHTML = `
        <div class="player-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
          <p>${message}</p>
          <a href="catalog.html" class="btn btn-outline">Вернуться в каталог</a>
        </div>
      `;
    }
  }
}

// Создаём глобальный экземпляр
const player = new AnimePlayer();

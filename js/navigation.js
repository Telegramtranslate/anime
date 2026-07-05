// navigation.js — логика навигации, бургер-меню, активные ссылки

/**
 * Загрузить компоненты header и footer
 */
async function loadComponents() {
  try {
    // Пытаемся загрузить компоненты
    let headerHtml = '';
    let footerHtml = '';

    try {
      const headerResp = await fetch('components/header.html');
      headerHtml = await headerResp.text();
    } catch {
      headerHtml = getDefaultHeader();
    }

    try {
      const footerResp = await fetch('components/footer.html');
      footerHtml = await footerResp.text();
    } catch {
      footerHtml = getDefaultFooter();
    }

    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (headerPlaceholder) headerPlaceholder.innerHTML = headerHtml;
    if (footerPlaceholder) footerPlaceholder.innerHTML = footerHtml;

    // Инициализируем навигацию после загрузки
    initNavigation();
  } catch (error) {
    console.warn('Ошибка загрузки компонентов:', error);
    // Fallback — встраиваем прямо в HTML
  }
}

/**
 * Дефолтный header (если не загрузился из файла)
 */
function getDefaultHeader() {
  return `
    <header class="header" id="mainHeader">
      <div class="container">
        <a href="index.html" class="logo">
          <span class="logo-icon">⬡</span>
          <span class="logo-text">Anime<span class="logo-accent">Vault</span></span>
        </a>
        
        <nav class="nav" id="mainNav">
          <a href="index.html" class="nav-link">Главная</a>
          <a href="catalog.html" class="nav-link">Каталог</a>
          <a href="favorites.html" class="nav-link">Избранное</a>
          <a href="history.html" class="nav-link">История</a>
        </nav>

        <div class="header-actions">
          <button class="search-toggle" id="searchToggle" title="Поиск">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
          <button class="burger" id="burger" title="Меню">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <!-- Выпадающий поиск -->
      <div class="search-dropdown" id="searchDropdown">
        <div class="container">
          <input type="text" id="globalSearch" placeholder="Поиск аниме..." autocomplete="off">
          <div class="search-results" id="searchResults"></div>
        </div>
      </div>
    </header>
  `;
}

/**
 * Дефолтный footer
 */
function getDefaultFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="logo">
              <span class="logo-icon">⬡</span>
              <span class="logo-text">Anime<span class="logo-accent">Vault</span></span>
            </div>
            <p>AnimeVault — твой проводник в мире аниме. Смотри, открывай для себя новое и наслаждайся любимыми сериалами в самом лучшем качестве.</p>
          </div>
          <div class="footer-col">
            <h4>Навигация</h4>
            <a href="index.html">Главная</a>
            <a href="catalog.html">Каталог</a>
            <a href="favorites.html">Избранное</a>
            <a href="history.html">История</a>
          </div>
          <div class="footer-col">
            <h4>Жанры</h4>
            <a href="catalog.html?genre=%D0%AD%D0%BA%D1%88%D0%B5%D0%BD">Экшен</a>
            <a href="catalog.html?genre=%D0%A0%D0%BE%D0%BC%D0%B0%D0%BD%D1%82%D0%B8%D0%BA%D0%B0">Романтика</a>
            <a href="catalog.html?genre=%D0%94%D1%80%D0%B0%D0%BC%D0%B0">Драма</a>
            <a href="catalog.html?genre=%D0%A4%D1%8D%D0%BD%D1%82%D0%B5%D0%B7%D0%B8">Фэнтези</a>
          </div>
          <div class="footer-col">
            <h4>Информация</h4>
            <a href="#">О проекте</a>
            <a href="#">Правообладателям</a>
            <a href="#">Политика конфиденциальности</a>
            <a href="#">Контакты</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} AnimeVault. Все права защищены.</span>
          <span>Данные предоставлены Kodik API</span>
        </div>
      </div>
    </footer>
  `;
}

/**
 * Инициализация навигации
 */
function initNavigation() {
  // Активная ссылка
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

  // Бургер-меню
  const burger = document.getElementById('burger');
  const nav = document.getElementById('mainNav');
  
  if (burger && nav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      nav.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Закрыть при клике на ссылку
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Поиск
  const searchToggle = document.getElementById('searchToggle');
  if (searchToggle) {
    searchToggle.addEventListener('click', () => {
      const dropdown = document.getElementById('searchDropdown');
      if (dropdown) {
        const isActive = dropdown.classList.contains('active');
        if (isActive) {
          Search.close();
        } else {
          Search.open();
        }
      }
    });
  }

  // Инициализация полей поиска
  Search.init('globalSearch', 'searchResults');
}

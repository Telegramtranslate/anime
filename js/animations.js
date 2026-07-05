// animations.js — IntersectionObserver, scroll анимации
const Animations = {

  /**
   * Инициализировать reveal-анимации при скролле
   */
  initReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
  },

  /**
   * Parallax для hero-секции
   */
  initHeroParallax() {
    const hero = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero-bg');
    const heroContent = document.querySelector('.hero-content');
    
    if (!hero || !heroBg) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const heroHeight = hero.offsetHeight;
      
      if (scrollY <= heroHeight) {
        const progress = scrollY / heroHeight;
        
        // Параллакс для фона
        heroBg.style.transform = `scale(${1.05 + progress * 0.1}) translateY(${progress * 30}px)`;
        heroBg.style.opacity = 1 - progress;

        // Параллакс для контента
        if (heroContent) {
          heroContent.style.transform = `translateY(${-40 + progress * 60}px)`;
          heroContent.style.opacity = 1 - progress * 1.2;
        }

        // Затемнение overlay
        const overlay = hero.querySelector('.hero-overlay');
        if (overlay) {
          overlay.style.opacity = 1 + progress;
        }
      }
    });
  },

  /**
   * Анимация header при скролле
   */
  initHeaderScroll() {
    const header = document.getElementById('mainHeader');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      
      // Добавляем класс scrolled при любом скролле
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Скрываем/показываем header
      if (currentScroll > lastScroll && currentScroll > 200) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }

      lastScroll = currentScroll;
    });
  },

  /**
   * Плавный скролл к якорям
   */
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  },

  /**
   * Анимация счетчиков
   */
  initCounters() {
    document.querySelectorAll('.counter').forEach(counter => {
      const target = parseInt(counter.dataset.target) || 0;
      const duration = 2000;
      const step = Math.ceil(target / (duration / 16));
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            let current = 0;
            const update = () => {
              current += step;
              if (current < target) {
                counter.textContent = current;
                requestAnimationFrame(update);
              } else {
                counter.textContent = target;
              }
            };
            update();
            observer.unobserve(counter);
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(counter);
    });
  },

  /**
   * Анимации для карточек при загрузке
   */
  animateCards(container) {
    if (!container) return;
    const cards = container.querySelectorAll('.anime-card');
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'all 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 40);
    });
  },

  /**
   * Инициализировать всё
   */
  init() {
    this.initReveal();
    this.initHeroParallax();
    this.initHeaderScroll();
    this.initSmoothScroll();
    this.initCounters();
  }
};

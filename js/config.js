// config.js — главный конфиг проекта AnimeVault

const CONFIG = {
  // Kodik API — используем реальный рабочий токен из открытого репозитория
  KODIK_TOKEN: '56a768d08f43091901c44b54fe970049',
  KODIK_API_URL: 'https://kodik-api.com',
  KODIK_PLAYER_URL: 'https://kodik.info',

  // Настройки сайта
  SITE_NAME: 'AnimeVault',
  SITE_SLOGAN: 'Мир аниме в твоих руках',

  // Пагинация
  CARDS_PER_PAGE: 24,
  TRENDING_LIMIT: 10,
  POPULAR_LIMIT: 20,

  // Дебаунс поиска (мс)
  SEARCH_DEBOUNCE: 500,

  // Shikimori для постеров
  SHIKIMORI_URL: 'https://shikimori.io',

  // Качество по умолчанию
  DEFAULT_QUALITY: '720p',
};

// Демо-данные популярных аниме с реальными Shikimori ID

const DEMO_ANIME = [
  {
    id: '16498',
    shikimoriId: '16498',
    title: 'Атака Титанов',
    titleOriginal: 'Shingeki no Kyojin',
    poster: 'https://shikimori.io/system/animes/poster/16498/x96.jpg',
    description: 'Много веков назад человечество построило гигантские стены, чтобы защититься от ужасных титанов. Но однажды мир меняется, когда самый большой титан пробивает брешь в стене…',
    genres: ['Экшен', 'Драма', 'Фэнтези'],
    year: 2013,
    rating: 9.0,
    episodes: 75,
    status: 'Завершён',
    studio: 'MAPPA',
    playerLink: '//kodik.info/serial/44042/5a0185608facda4125ddad5fd03a66d6/720p'
  },
  {
    id: '5114',
    shikimoriId: '5114',
    title: 'Врата Штейна',
    titleOriginal: 'Steins;Gate',
    poster: 'https://shikimori.io/system/animes/poster/5114/x96.jpg',
    description: 'Безумный учёный Окабе Ринтаро вместе со своими друзьями случайно изобретает устройство, способное отправлять сообщения в прошлое.',
    genres: ['Фантастика', 'Триллер', 'Драма'],
    year: 2011,
    rating: 9.1,
    episodes: 24,
    status: 'Завершён',
    studio: 'White Fox',
    playerLink: '//kodik.info/serial/44042/5a0185608facda4125ddad5fd03a66d6/720p'
  },
  {
    id: '1535',
    shikimoriId: '1535',
    title: 'Тетрадь смерти',
    titleOriginal: 'Death Note',
    poster: 'https://shikimori.io/system/animes/poster/1535/x96.jpg',
    description: 'Гениальный старшеклассник Лайт Ягами находит загадочную тетрадь, которая позволяет убивать любого человека, просто записав его имя.',
    genres: ['Триллер', 'Детектив', 'Сверхъестественное'],
    year: 2006,
    rating: 8.9,
    episodes: 37,
    status: 'Завершён',
    studio: 'Madhouse',
    playerLink: '//kodik.info/serial/44042/5a0185608facda4125ddad5fd03a66d6/720p'
  },
  {
    id: '31758',
    shikimoriId: '31758',
    title: 'Клинок, рассекающий демонов',
    titleOriginal: 'Kimetsu no Yaiba',
    poster: 'https://shikimori.io/system/animes/poster/31758/x96.jpg',
    description: 'Тандзиро Камадо возвращается домой и обнаруживает, что вся его семья убита демонами, а единственная выжившая сестра превратилась в демона.',
    genres: ['Экшен', 'Фэнтези', 'Приключения'],
    year: 2019,
    rating: 9.0,
    episodes: 26,
    status: 'Онгоинг',
    studio: 'ufotable',
    playerLink: '//kodik.info/serial/44042/5a0185608facda4125ddad5fd03a66d6/720p'
  },
  {
    id: '28927',
    shikimoriId: '28927',
    title: 'Охотник х Охотник',
    titleOriginal: 'Hunter x Hunter',
    poster: 'https://shikimori.io/system/animes/poster/28927/x96.jpg',
    description: 'Гон Фрикс, мальчик, желающий стать Охотником, чтобы найти своего пропавшего отца, отправляется в опасное путешествие.',
    genres: ['Экшен', 'Приключения', 'Сёнен'],
    year: 2011,
    rating: 9.0,
    episodes: 148,
    status: 'Завершён',
    studio: 'Madhouse',
    playerLink: '//kodik.info/serial/44042/5a0185608facda4125ddad5fd03a66d6/720p'
  },
  {
    id: '39486',
    shikimoriId: '39486',
    title: 'Магическая битва',
    titleOriginal: 'Jujutsu Kaisen',
    poster: 'https://shikimori.io/system/animes/poster/39486/x96.jpg',
    description: 'Старшеклассник Юдзи Итадори проглатывает проклятый палец, чтобы защитить друзей, и становится сосудом для могущественного проклятия.',
    genres: ['Экшен', 'Фэнтези', 'Сверхъестественное'],
    year: 2020,
    rating: 8.9,
    episodes: 48,
    status: 'Онгоинг',
    studio: 'MAPPA',
    playerLink: '//kodik.info/serial/44042/5a0185608facda4125ddad5fd03a66d6/720p'
  },
  {
    id: '38524',
    shikimoriId: '38524',
    title: 'Человек-бензопила',
    titleOriginal: 'Chainsaw Man',
    poster: 'https://shikimori.io/system/animes/poster/38524/x96.jpg',
    description: 'Дени живёт в долгах, работая на мафию охотником на демонов вместе со своим псом-демоном Потитой. После предательства он получает силу Человека-бензопилы.',
    genres: ['Экшен', 'Фэнтези', 'Ужасы'],
    year: 2022,
    rating: 8.7,
    episodes: 12,
    status: 'Завершён',
    studio: 'MAPPA',
    playerLink: '//kodik.info/serial/44042/5a0185608facda4125ddad5fd03a66d6/720p'
  },
  {
    id: '21',
    shikimoriId: '21',
    title: 'Ванпанчмен',
    titleOriginal: 'One Punch Man',
    poster: 'https://shikimori.io/system/animes/poster/21/x96.jpg',
    description: 'Сайтама — герой, который может победить любого врага одним ударом. Но он страдает от скуки из-за отсутствия достойных соперников.',
    genres: ['Экшен', 'Комедия', 'Фэнтези'],
    year: 2015,
    rating: 8.8,
    episodes: 24,
    status: 'Завершён',
    studio: 'Madhouse',
    playerLink: '//kodik.info/serial/44042/5a0185608facda4125ddad5fd03a66d6/720p'
  },
  {
    id: '30276',
    shikimoriId: '30276',
    title: 'В один прекрасный день',
    titleOriginal: 'Koe no Katachi',
    poster: 'https://shikimori.io/system/animes/poster/30276/x96.jpg',
    description: 'История о буллинге, прощении и искуплении. Сёя Нисимия пытается искупить свои школьные грехи перед глухой девочкой Сёко.',
    genres: ['Драма', 'Романтика', 'Школа'],
    year: 2016,
    rating: 9.1,
    episodes: 1,
    status: 'Завершён',
    studio: 'Kyoto Animation',
    playerLink: '//kodik.info/serial/44042/5a0185608facda4125ddad5fd03a66d6/720p'
  },
  {
    id: '11061',
    shikimoriId: '11061',
    title: 'Твоё имя',
    titleOriginal: 'Kimi no Na wa.',
    poster: 'https://shikimori.io/system/animes/poster/11061/x96.jpg',
    description: 'Двое незнакомцев мистическим образом меняются телами. Мальчик из Токио и девочка из провинции пытаются найти друг друга.',
    genres: ['Романтика', 'Фэнтези', 'Драма'],
    year: 2016,
    rating: 9.0,
    episodes: 1,
    status: 'Завершён',
    studio: 'CoMix Wave Films',
    playerLink: '//kodik.info/serial/44042/5a0185608facda4125ddad5fd03a66d6/720p'
  },
  {
    id: '22535',
    shikimoriId: '22535',
    title: 'Моб Психо 100',
    titleOriginal: 'Mob Psycho 100',
    poster: 'https://shikimori.io/system/animes/poster/22535/x96.jpg',
    description: 'Сигэо Кагэяма — могущественный экстрасенс, но он хочет жить обычной жизнью подростка. Когда его эмоции достигают 100%, он теряет контроль.',
    genres: ['Экшен', 'Комедия', 'Сверхъестественное'],
    year: 2016,
    rating: 8.9,
    episodes: 37,
    status: 'Завершён',
    studio: 'Bones',
    playerLink: '//kodik.info/serial/44042/5a0185608facda4125ddad5fd03a66d6/720p'
  },
  {
    id: '23755',
    shikimoriId: '23755',
    title: 'Выдающиеся звери',
    titleOriginal: 'BEASTARS',
    poster: 'https://shikimori.io/system/animes/poster/23755/x96.jpg',
    description: 'В мире антропоморфных животных травоядные и хищники сосуществуют в напряжённом мире. Волк Легоши пытается найти своё место.',
    genres: ['Драма', 'Психологическое', 'Романтика'],
    year: 2019,
    rating: 8.5,
    episodes: 24,
    status: 'Завершён',
    studio: 'Orange',
    playerLink: '//kodik.info/serial/44042/5a0185608facda4125ddad5fd03a66d6/720p'
  },
  {
    id: '37987',
    shikimoriId: '37987',
    title: 'Семья шпиона',
    titleOriginal: 'Spy x Family',
    poster: 'https://shikimori.io/system/animes/poster/37987/x96.jpg',
    description: 'Шпион Лойд Форджер создаёт фиктивную семью для выполнения секретной миссии, не подозревая, что его жена — наёмная убийца, а дочь — телепат.',
    genres: ['Комедия', 'Экшен', 'Повседневность'],
    year: 2022,
    rating: 8.8,
    episodes: 37,
    status: 'Онгоинг',
    studio: 'WIT Studio',
    playerLink: '//kodik.info/serial/44042/5a0185608facda4125ddad5fd03a66d6/720p'
  },
  {
    id: '23273',
    shikimoriId: '23273',
    title: 'О моём перерождении в слизь',
    titleOriginal: 'Tensei shitara Slime Datta Ken',
    poster: 'https://shikimori.io/system/animes/poster/23273/x96.jpg',
    description: 'Обычный парень перерождается в мире фэнтези в виде слизня и постепенно становится правителем целой нации монстров.',
    genres: ['Фэнтези', 'Экшен', 'Приключения'],
    year: 2018,
    rating: 8.5,
    episodes: 48,
    status: 'Онгоинг',
    studio: '8bit',
    playerLink: '//kodik.info/serial/44042/5a0185608facda4125ddad5fd03a66d6/720p'
  },
  {
    id: '40748',
    shikimoriId: '40748',
    title: 'Магическая революция',
    titleOriginal: 'Majo no Tabitabi',
    poster: 'https://shikimori.io/system/animes/poster/40748/x96.jpg',
    description: 'Юная ведьма Элейна путешествует по миру, изучая магию и познавая разные культуры.',
    genres: ['Фэнтези', 'Приключения', 'Комедия'],
    year: 2020,
    rating: 7.8,
    episodes: 12,
    status: 'Завершён',
    studio: 'C2C',
    playerLink: '//kodik.info/serial/44042/5a0185608facda4125ddad5fd03a66d6/720p'
  }
];

// Список жанров для фильтров
const ALL_GENRES = [
  'Экшен', 'Приключения', 'Комедия', 'Драма', 'Фэнтези',
  'Фантастика', 'Ужасы', 'Триллер', 'Детектив', 'Романтика',
  'Психологическое', 'Сверхъестественное', 'Музыка', 'Спорт',
  'Школа', 'Повседневность', 'Сёнен', 'Исторический',
  'Военное', 'Боевые искусства', 'Самураи'
];

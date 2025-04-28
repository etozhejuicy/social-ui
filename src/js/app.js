// glightbox
const lightbox = GLightbox({
  touchNavigation: true,
  loop: false,
  autoplayVideos: true,
  selector: '.glightbox',
});

// mobile-menu
let isMobile = window.innerWidth < 992;
const mainMenu = document.querySelector('.menu');
const menuElems = document.querySelectorAll('[data-menu]');
const menuItems = document.querySelectorAll('[data-menu-close]');
const header = document.querySelector('header');
const headerLogo = header.querySelector('.header-logo');
const catalogButtons = document.querySelectorAll('[data-catalog]');
const catalogChapters = document.querySelectorAll('[data-catalog-chapter]');
const catalogMenuInner = document.querySelector('.catalog-menu--inner');
const catalogMenuCategories =
  catalogMenuInner.querySelectorAll('[data-chapter-id]');
const filters = document.querySelector('.configurator');
const filterSearches = document.querySelectorAll('.configurator-search input');
const applyButton = document.createElement('button');
const resetButton = document.querySelector(
  '.configurator button[type="reset"]'
);
const backCatalogButton = document.getElementById('backCatalogChapters');
const catalogMenu = document.querySelector('.catalog-menu');
const burgerButton = document.querySelector('.btn-burger');
const searchForm = document.querySelector('.header-search');
const searchInput = searchForm.querySelector('.header-search input');
const searchResult = document.querySelector('.search-result');
const searchResultTyped = searchResult.querySelector('.search-result-typed');

function updateIsMobile() {
  isMobile = window.innerWidth < 992;
}

updateIsMobile();

window.addEventListener('resize', () => {
  updateIsMobile();
});


window.addEventListener('scroll', setFixedHeader);
window.addEventListener('resize', setFixedHeader);
window.addEventListener('DOMContentLoaded', setFixedHeader);

function setFixedHeader() {
  if (!isMobile) {
    if (window.scrollY >= header.offsetHeight) {
      header.classList.add('fixed');
      catalogMenu.classList.add('fixed');
      searchResult.classList.add('fixed');
    } else {
      header.classList.remove('fixed');
      catalogMenu.classList.remove('fixed');
      searchResult.classList.remove('fixed');
    }
  } else {
    header.classList.remove('fixed');
    catalogMenu.classList.remove('fixed');
    searchResult.classList.remove('fixed');
  }
}

function mobileMenu() {
  if (window.innerWidth >= 1200) {
    closeAllMenus();

    document.addEventListener('click', (event) => {
      if (
        !catalogMenu.contains(event.target) &&
        !Array.from(catalogButtons).some((button) =>
          button.contains(event.target)
        )
      ) {
        closeCatalog();
      }
    });
  } else {
    menuPosition();
  }
}

function openMenu(menuElem) {
  if (menuElem.getAttribute('data-menu') === 'open') {
    menuElem.setAttribute('data-menu', 'closed');
    mainMenu.classList.remove('menu-show');
    document.documentElement.classList.remove('menu-open');
    catalogMenu.classList.remove('active');
    if (filters) {
      filters.classList.remove('active');
    }

    catalogButtons.forEach((catalogButton) => {
      catalogButton.setAttribute('data-catalog', '');
    });
  } else {
    menuElem.setAttribute('data-menu', 'open');
    mainMenu.classList.add('menu-show');
    document.documentElement.classList.add('menu-open');
    catalogMenu.classList.remove('active');
    if (filters) {
      filters.classList.remove('active');
    }
  }
}

function menuPosition() {
  console.error(isMobile);
  const headerRect = header.getBoundingClientRect();
  isMobile ? mainMenu.style.paddingTop = `${headerRect.height}px` : mainMenu.style.paddingTop = 0;
}

function closeMenu() {
  document.querySelector('.btn-burger').setAttribute('data-menu', 'closed');
  mainMenu.classList.remove('menu-show');
  document.documentElement.classList.remove('menu-open');
  if (filters) {
    filters.classList.remove('active');
  }

  catalogButtons.forEach((catalogButton) => {
    catalogButton.setAttribute('data-catalog', '');
  });
}

function closeAllMenus() {
  menuElems.forEach((menuElem) => {
    menuElem.setAttribute('data-menu', 'closed');
  });

  mainMenu.classList.remove('menu-show');

  document.documentElement.classList.remove('menu-open');

  catalogMenu.classList.remove('active');

  if (filters) {
    filters.classList.remove('active');
  }

  catalogButtons.forEach((catalogButton) => {
    catalogButton.setAttribute('data-catalog', '');
  });
}

function toggleCatalog(button) {
  const isActive = catalogMenu.classList.contains('active');

  // Если каталог открыт, закрываем его
  if (isActive) {
    catalogMenu.classList.remove('active');
    burgerButton.setAttribute('data-menu', 'closed');
    document.documentElement.classList.remove('menu-open');

    closeCatalogCategories();
    closeFilters();

    catalogButtons.forEach((catalogButton) => {
      catalogButton.setAttribute('data-catalog', '');
    });
  } else {
    burgerButton.setAttribute('data-menu', 'open');

    // Закрываем мобильное меню, если оно открыто
    if (burgerButton.getAttribute('data-menu') === 'open') {
      closeAllMenus();
      closeSearchForm();

      if (window.innerWidth <= 991) {
        document.documentElement.classList.add('menu-open');
      }
      burgerButton.setAttribute('data-menu', 'open');
    }

    // Открываем каталог
    catalogMenu.classList.add('active');

    positionCatalogMenu(button)

    catalogButtons.forEach((catalogButton) => {
      catalogButton.setAttribute('data-catalog', 'true');
    });
  }
}

function toggleCatalogChapters(chapter) {
  const chapterId = chapter.getAttribute('data-catalog-chapter');

  catalogMenuInner.classList.toggle('categories-show');

  catalogMenuCategories.forEach((link) => {
    const linkChapterId = link.getAttribute('data-chapter-id');

    if (linkChapterId === chapterId) {
      link.style.display = 'flex';
    } else {
      link.style.display = 'none';
    }
  });
}

function openCatalogChapters(chapter) {
  const chapterId = chapter.getAttribute('data-catalog-chapter');

  catalogChapters.forEach((ch) => {
    ch.classList.remove('active');
  });

  const isActive = chapter.classList.contains('active');

  if (isActive) {
    catalogMenuInner.classList.remove('categories-show');

    catalogMenuCategories.forEach((link) => {
      link.style.display = 'none';
    });

    return;
  }

  chapter.classList.add('active');

  catalogMenuInner.classList.add('categories-show');

  catalogMenuCategories.forEach((link) => {
    const linkChapterId = link.getAttribute('data-chapter-id');

    if (linkChapterId === chapterId) {
      link.style.display = 'flex';
    } else {
      link.style.display = 'none';
    }
  });
}

function closeCatalogCategories() {
  if (catalogMenuInner.classList.contains('categories-show')) {
    catalogMenuInner.classList.remove('categories-show');

    catalogChapters.forEach((ch) => {
      ch.classList.remove('active');
    });

    catalogMenuCategories.forEach((link) => {
      link.style.display = 'none';
    });
  }
}

function positionCatalogMenu(button) {
    const buttonRect = button.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    if(!isMobile) {
      catalogMenu.style.top = `${headerRect.bottom + 16}px`;
      catalogMenu.style.paddingTop = '0px';
    } else {
      catalogMenu.style.top = '0px';
      catalogMenu.style.paddingTop = `${headerRect.bottom}px`;
    }
    // !isMobile ? catalogMenu.style.top : catalogMenu.style.paddingTop = !isMobile ? `${headerRect.bottom + 16}px` : `${headerRect.bottom}px`;
    catalogMenu.style.left = !isMobile ? `${buttonRect.left}px` : `${headerRect.left}px`;
}

function closeCatalog() {
  catalogMenu.classList.remove('active');

  closeCatalogCategories();
  closeFilters();

  catalogButtons.forEach((button) => {
    button.setAttribute('data-catalog', '');
  });
}

function closeSearchForm() {
  searchForm.classList.remove('active');
  burgerButton.setAttribute('data-menu', 'closed');
  document.body.classList.remove('menu-open');
  searchResultHide();

  catalogButtons.forEach((button) => {
    button.setAttribute('data-catalog', '');
  });
}

function openSearchForm() {
  closeAllMenus();
  closeMenu();
  closeCatalog();
  searchForm.classList.add('active');
  burgerButton.setAttribute('data-menu', 'open');
  document.body.classList.add('menu-open');
}

function searchToggleClick() {
  const query = searchInput.value.trim();

  if (searchForm.classList.contains('active') && query.length > 3) {
    searchForm.classList.remove('active');
  } else {
    searchForm.classList.add('active');
  }
}

function handleClickOutside(event) {
  if (
    !searchForm.contains(event.target) &&
    searchForm.classList.contains('active')
  ) {
    closeAllMenus();
    closeMenu();
    closeCatalog();
    closeSearchForm();
  } else if (
    !searchForm.contains(event.target) &&
    !searchResult.contains(event.target)
  ) {
    searchResultHide();
  }
}

function searchResultHide() {
  searchResult.querySelector('div').innerHTML = '';
  searchResultTyped.textContent = '';
  searchResult.classList.remove('show');
}

function searchResultPosition() {
  const inputRect = searchInput.getBoundingClientRect();
  const headerRect = header.getBoundingClientRect();

  searchResult.style.top = `${headerRect.height + (isMobile ? 0 : 16)}px`;
  searchResult.style.left = `${inputRect.left}px`;
}

function searchResultShow() {
  searchResultPosition();
  searchResult.classList.add('show');
}

async function searchInputType() {
  const query = searchInput.value.trim();

  if (query.length > 2) {
    const results = [
      {
        name: 'Компоненты',
        image: './assets/images/example/search/item.jpg',
        link: '/components',
      },
      {
        name: 'Слайдер',
        image: './assets/images/example/search/item.jpg',
        link: '/components/slider',
      },
      {
        name: 'Popup-окна',
        image: './assets/images/example/search/item.jpg',
        link: '/components/slider',
      },
      {
        name: 'Карточки',
        image: './assets/images/example/search/item.jpg',
        link: '/components/cards',
      },
      {
        name: 'Семантическая верстка',
        image: './assets/images/example/search/item.jpg',
        link: '/semantic',
      },
    ];

    // Фильтрация результатов
    const filteredResults = results.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );

    searchResultTyped.textContent = `Результаты поиска для: "${query}"`;

    const resultsList = searchResult.querySelector('div');
    resultsList.innerHTML = '';

    if (filteredResults.length > 0) {
      filteredResults.forEach((item) => {
        resultsList.appendChild(createSearchItem(item));
      });
    } else {
      const p = document.createElement('p');
      p.classList.add('small');
      p.textContent = 'Нет результатов';
      resultsList.appendChild(p);
    }

    // if (results.length > 0) {
    //   results.forEach((item) => {
    //     resultsList.appendChild(createSearchItem(item));
    //   });
    // } else {
    //   const p = document.createElement('p');
    //   p.classList.add('small');
    //   p.textContent = 'Нет результатов';
    //   resultsList.appendChild(p);
    // }

    searchResultShow();
  } else {
    searchResultTyped.textContent = 'Ничего не найдено';
    searchResultHide();
  }
}

function createSearchItem(item) {
  const a = document.createElement('a');
  a.setAttribute('href', item.link);
  a.classList.add('search-item');
  a.innerHTML = `
    ${item.image ? `<img src="${item.image}" alt="${item.name}" />` : ``}
    <div class="search-item__content">
      ${item.name ? `<span class="search-item__name">${item.name}</span>` : ``}
    </div>
    <span class="search-item__price"><i class="icon-right"></i></span>
  `;
  return a;
}

function toggleFilters() {
  const isActive = filters.classList.contains('active');

  if (!isActive) {
    document.documentElement.classList.add('menu-open');
    filters.classList.add('active');
  } else {
    document.documentElement.classList.remove('menu-open');
    filters.classList.remove('active');
  }
}

function closeFilters() {
  document.documentElement.classList.remove('menu-open');
  if (filters) {
    filters.classList.remove('active');
  }
}

// Обработчики событий для кнопки поиска и клика вне формы поиска
searchInput.addEventListener('click', searchToggleClick);
document.addEventListener('click', handleClickOutside);
searchInput.addEventListener('click', searchInputType);
searchInput.addEventListener('input', searchInputType);
window.addEventListener('resize', searchResultPosition);
window.addEventListener('scroll', searchResultPosition);
window.addEventListener(
  'scroll',
  positionCatalogMenu(document.querySelector('[data-catalog]'))
);
window.addEventListener(
  'resize',
  positionCatalogMenu(document.querySelector('[data-catalog]'))
);

// Обработчики событий для кнопок каталога
catalogButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    e.stopPropagation();

    toggleCatalog(button);
  });
});

// Обработчики событий для разделов каталога
catalogChapters.forEach((chapter) => {
  if (!isMobile) {
    chapter.addEventListener('mouseenter', (e) => {
      e.stopPropagation();

      openCatalogChapters(chapter);
    });
  } else {
    chapter.addEventListener('click', (e) => {
      e.stopPropagation();

      toggleCatalogChapters(chapter);
    });
  }
});

// Обработчик кнопки "Назад" в меню каталога
backCatalogButton.addEventListener('click', (e) => {
  e.stopPropagation();

  closeCatalogCategories();
});

// Обработчик событий для кнопки открытия меню
menuElems.forEach((menuElem) => {
  menuElem.addEventListener('click', () => {
    openMenu(menuElem);
  });
});

// Обработчик событий для кнопки закрытия меню
menuItems.forEach((menuItem) => {
  menuItem.addEventListener('click', () => {
    closeMenu();
  });
});

// Обработчик событий для закрытия каталога при клике вне каталога
document.addEventListener('click', (event) => {
  if (
    !catalogMenu.contains(event.target) &&
    !Array.from(catalogButtons).some((button) => button.contains(event.target))
  ) {
    if (!isMobile) {
      closeCatalog();
    }
  }
});

// Обработчики событий для отслеживания состояния мобильного меню и его инициализации
window.addEventListener('DOMContentLoaded', mobileMenu);
window.addEventListener('resize', mobileMenu);

// modal logic
const openModalButtons = document.querySelectorAll('[data-modal-open]');
const closeButtons = document.querySelectorAll('[btn-close-modal]');

openModalButtons.forEach((openModalButton) => {
  openModalButton.addEventListener('click', function (e) {
    const modalKey = e.currentTarget.getAttribute('data-modal-open');
    const modal = document.querySelector('[data-modal-id="' + modalKey + '"]');
    if (modal) {
      openModal(modal);
    }
  });
});

function openModal(modal) {
  modal.classList.add('show');
  document.documentElement.classList.add('modal-open');
}

function closeModal(modal) {
  modal.classList.remove('show');
  document.documentElement.classList.remove('modal-open');
}

closeButtons.forEach((closeButton) => {
  closeButton.addEventListener('click', function () {
    const modal = closeButton.closest('.modal');
    if (modal) {
      closeModal(modal);
    }
  });
});

window.addEventListener('click', function (event) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach((modal) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});

// Обработчик для ссылок с якорем
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const modalKey = this.getAttribute('href').substring(1);
    const modal = document.querySelector('[data-modal-id="' + modalKey + '"]');

    if (modal) {
      e.preventDefault();

      openModal(modal);

      history.pushState(
        '',
        document.title,
        window.location.pathname + window.location.search
      );
    }
  });
});

// map logic
const mapLinks = document.querySelectorAll('[data-modal-open="map"]');
const mapModal = document.querySelector('#map-wrapper');

mapLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    loadMap(e);
  });
});

function loadMap(e) {
  e.preventDefault();

  mapModal.innerHTML = `<iframe src="https://yandex.ru/map-widget/v1/?from=mapframe&ll=39.185731%2C51.679399&mode=usermaps&source=mapframe&um=constructor%3A46c9edf9d0e07421f02741b87c01c723acd13a193f9ff82b0d1f4331fab902e4&utm_source=mapframe&z=13" width="560" height="400" frameborder="1" allowfullscreen="true" style="position:relative;"></iframe>`;

  closeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');

      if (modal) {
        mapModal.innerHTML = '';
      }
    });
  });

  document.addEventListener('click', (event) => {
    const modals = document.querySelectorAll('.modal');

    modals.forEach((modal) => {
      if (event.target === modal) {
        mapModal.innerHTML = '';
      }
    });
  });
}

// slider logic
class Slider {
  constructor(sliderElement) {
    this.slides = sliderElement.querySelector('.slides');
    this.slide = sliderElement.querySelectorAll('.slide');
    this.currentIndex = 0;

    this.startX = 0;
    this.startY = 0;
    this.endX = 0;

    this.scrollbar = sliderElement.querySelector('.scrollbar');

    if (this.scrollbar) {
      this.scrollbarThumb = this.scrollbar.querySelector('.scrollbar-thumb');

      this.initScrollbar();
      this.updateScrollbar();
    }

    if (sliderElement.dataset.thumbnailSlider === 'true') {
      const thumbnailSliderId = sliderElement.dataset.thumbnailSliderId;

      this.thumbnailSlider = document.getElementById(thumbnailSliderId);

      if (this.thumbnailSlider) {
        this.thumbnailSlides = this.thumbnailSlider.querySelectorAll('.slide');

        this.initThumbnails();
      }
    }

    // Настройки слайдера
    this.autoplay = sliderElement.dataset.autoplay === 'true';
    this.speed = parseInt(sliderElement.dataset.speed, 10) || 300;
    this.gap = parseInt(sliderElement.dataset.gap) || 0;
    this.infinite = sliderElement.dataset.infinite === 'true';
    this.autoplayInterval = null;
    this.autoplayTimeout = null;
    this.isAnimating = false;
    this.isMouseDown = false;
    this.isDragging = false;
    this.paginationDots = [];
    this.showing = this.parseShowing(
      sliderElement.dataset.showing || '1|1|1|1'
    );

    this.slidesToShow = this.getSlidesToShow();
    this.init();
  }

  parseShowing(showingString) {
    return showingString.split('|').map(Number);
  }

  getSlidesToShow() {
    const windowWidth = window.innerWidth;

    if (windowWidth >= 1200) {
      return this.showing[0];
    } else if (windowWidth >= 900) {
      return this.showing[1];
    } else if (windowWidth >= 576) {
      return this.showing[2];
    } else {
      return this.showing[3];
    }
  }

  init() {
    this.showSlide(this.currentIndex);
    this.createPaginationDots();
    this.addEventListeners();
    this.updateSlidesWidth();
    this.updateScrollbar();
    this.updateThumbnailPosition();
    this.updateNavVisibility();
    if (this.autoplay) {
      this.startAutoplay();
    }

    window.addEventListener('resize', () => {
      this.slidesToShow = this.getSlidesToShow();
      this.getSlidesToShow();
      this.updateScrollbar();
      this.updateSlidesWidth();
      this.updatePaginationDots();
      this.showSlide(this.currentIndex);
      this.updateThumbnailPosition();
      this.updateNavVisibility();
    });
  }

  updateNavVisibility() {
    const totalSlides = this.slide.length;
    const prevButton = this.slides.parentElement.querySelector('.slider-prev');
    const nextButton = this.slides.parentElement.querySelector('.slider-next');
    const paginationContainer =
      this.slides.parentElement.querySelector('.pagination');
    const scrollbar = this.scrollbar;
    const shouldShowControls = totalSlides > this.slidesToShow;

    if (prevButton) {
      prevButton.style.display = shouldShowControls ? '' : 'none';
    }

    if (nextButton) {
      nextButton.style.display = shouldShowControls ? '' : 'none';
    }

    if (paginationContainer) {
      paginationContainer.style.display = shouldShowControls ? '' : 'none';
    }

    if (scrollbar) {
      scrollbar.style.display = shouldShowControls ? '' : 'none';
    }

    // Отключаем свайп, если слайдов меньше или равно видимым
    this.isSwipeEnabled = totalSlides > this.slidesToShow;
  }

  initThumbnails() {
    this.thumbnailSlides.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', () => {
        this.showSlide(index);
      });

      if (index === this.currentIndex) {
        thumbnail.classList.add('active');
      }
    });
  }

  updateThumbnailActiveState() {
    this.thumbnailSlides.forEach((thumbnail, index) => {
      thumbnail.classList.toggle('active', index === this.currentIndex);
    });
  }

  moveThumbnailToStart(index) {
    if (this.isAnimating) return;

    const totalSlides = this.thumbnailSlides.length;
    const maxIndex = totalSlides - 1;

    // Ограничиваем индекс
    this.currentIndex = Math.max(0, Math.min(index, maxIndex));
    this.isAnimating = true;

    // Убираем класс active у всех миниатюр
    this.thumbnailSlides.forEach((thumbnail) =>
      thumbnail.classList.remove('active')
    );

    // Добавляем класс active к текущей миниатюре
    const activeThumbnail = this.thumbnailSlides[this.currentIndex];
    activeThumbnail.classList.add('active');

    const thumbnailsContainer = this.thumbnailSlider.querySelector('.slides');

    // Вычисляем ширину миниатюры и промежутка
    const thumbnailWidth = this.thumbnailSlides[0].clientWidth; // Ширина одной миниатюры
    const gap = this.gap; // Ширина промежутка между миниатюрами

    // Получаем количество видимых миниатюр
    const visibleThumbnails = this.getSlidesToShow(this.thumbnailSlider);
    const totalThumbnails = this.thumbnailSlides.length;

    // Вычисляем смещение для миниатюр
    let offset = this.currentIndex * (thumbnailWidth + gap);

    // Ограничиваем смещение, чтобы оно не выходило за пределы
    const maxOffset =
      (totalThumbnails - visibleThumbnails) * (thumbnailWidth + gap);

    // Проверяем, нужно ли перемещать слайдер миниатюр
    if (this.currentIndex >= totalThumbnails - visibleThumbnails + 1) {
      // Если активный индекс выходит за правую границу
      offset = maxOffset; // Прокручиваем до конца
    } else if (this.currentIndex < visibleThumbnails) {
      // Если активный индекс выходит за левую границу
      offset = 0; // Прокручиваем в начало
    }

    // Устанавливаем смещение для контейнера миниатюр
    thumbnailsContainer.style.transform = `translateX(-${offset}px)`;

    this.updateThumbnailPosition();

    setTimeout(() => {
      this.isAnimating = false;
    }, this.speed);
  }

  updateThumbnailPosition() {
    if (!this.thumbnailSlider) return;

    const thumbnailsContainer = this.thumbnailSlider.querySelector('.slides');
    const totalThumbnails = this.thumbnailSlides.length;
    const thumbnailWidth = this.thumbnailSlides[0].clientWidth;
    const gap = parseInt(this.thumbnailSlider.dataset.gap, 10);

    // Получаем количество видимых миниатюр и преобразуем в число
    const visibleThumbnails = parseInt(
      this.thumbnailSlider.dataset.showing,
      10
    );

    // Вычисляем смещение для миниатюр
    let offset = this.currentIndex * (thumbnailWidth + gap);

    // Ограничиваем смещение, чтобы оно не выходило за пределы
    const maxOffset =
      (totalThumbnails - visibleThumbnails) * (thumbnailWidth + gap);

    // Проверяем, нужно ли перемещать слайдер миниатюр
    if (this.currentIndex > totalThumbnails - visibleThumbnails) {
      // Если активный слайд находится в правой части, прокручиваем до конца
      offset = maxOffset;
    } else if (this.currentIndex < 0) {
      // Если активный слайд находится в левой части, прокручиваем в начало
      offset = 0;
    }

    // Устанавливаем смещение для контейнера миниатюр
    thumbnailsContainer.style.transform = `translateX(-${Math.max(
      0,
      Math.min(offset, maxOffset)
    )}px)`;
  }

  updateSlidesWidth() {
    const totalSlides = this.slide.length;
    const slideWidth =
      (this.slides.clientWidth - this.gap * (this.slidesToShow - 1)) /
      this.slidesToShow;

    // Устанавливаем ширину для каждого слайда
    this.slide.forEach((slide) => {
      slide.style.maxWidth = `${slideWidth}px`;
      slide.tabIndex = '-1';
    });

    this.slides.style.setProperty(
      '--slides-to-show',
      `${this.getSlidesToShow()}`
    );
    this.slides.style.setProperty('--slides-total', `${totalSlides}`);
    this.gap
      ? this.slides.style.setProperty('--slides-gap', `${this.gap}px`)
      : this.slides.style.setProperty('--slides-gap', `0px`);
  }

  createPaginationDots() {
    const paginationContainer =
      this.slides.parentElement.querySelector('.pagination');
    if (paginationContainer) {
      this.slide.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('pagination-dot');
        dot.addEventListener('click', () => this.showSlide(index));
        paginationContainer.appendChild(dot);
        this.paginationDots.push(dot);
      });
      this.updatePaginationDots();
    }
  }

  initScrollbar() {
    this.updateScrollbar();
  }

  updateScrollbar() {
    if (!this.scrollbarThumb) return;

    const totalSlides = this.slide.length;
    const slideWidth = this.slide[0].clientWidth;
    const gap = this.gap;
    const totalWidth = totalSlides * slideWidth + (totalSlides - 1) * gap;
    const visibleWidth = this.slides.clientWidth;

    if (totalWidth <= visibleWidth) {
      this.scrollbarThumb.style.width = '0'; // Скрываем скроллбар

      return;
    }

    // Вычисляем ширину скроллбара
    const scrollbarWidth = (visibleWidth / totalWidth) * visibleWidth;

    this.scrollbarThumb.style.width = `${scrollbarWidth}px`;

    // Вычисляем позицию скроллбара
    const scrollbarPosition =
      this.currentIndex * (slideWidth + gap) * (visibleWidth / totalWidth);

    // Ограничиваем позицию скроллбара, чтобы он не выходил за пределы
    const maxScrollbarPosition = visibleWidth - scrollbarWidth;

    this.scrollbarThumb.style.transform = `translateX(${Math.max(
      0,
      Math.min(Math.ceil(scrollbarPosition), Math.ceil(maxScrollbarPosition))
    )}px)`;
  }

  showSlide(index) {
    if (this.isAnimating) return;

    const totalSlides = this.slide.length;
    const maxIndex = totalSlides - this.slidesToShow;

    // Логика для ограничения индекса
    if (this.slides.parentElement.dataset.infinite === 'true') {
      if (index < 0) {
        this.currentIndex = totalSlides - this.slidesToShow; // Переход к последним слайдам
      } else if (index > maxIndex) {
        this.currentIndex = 0; // Переход к первому слайду
      } else {
        this.currentIndex = index;
      }
    } else {
      // Ограничиваем индекс, чтобы не выходить за пределы
      this.currentIndex = Math.max(0, Math.min(index, maxIndex));
    }

    this.isAnimating = true;
    this.slides.style.transition = `transform ${this.speed}ms ease`;

    // Получаем ширину слайда и промежуток
    const slideWidth = this.slide[0].clientWidth; // Ширина одного слайда
    const gap = this.gap; // Ширина промежутка

    // Вычисляем смещение в пикселях
    let offset = this.currentIndex * slideWidth + this.currentIndex * gap;

    this.slides.style.transform = `translateX(-${offset}px)`;

    // Обновляем активный слайд в миниатюрах
    if (this.thumbnailSlides) {
      this.updateThumbnailActiveState();
      this.updateThumbnailPosition();
    }

    this.onSlideChange(Math.round(this.currentIndex));
    this.updatePaginationDots();
    this.updateNavigationButtons();

    this.stopAutoplay();
    this.updateScrollbar();

    setTimeout(() => {
      this.isAnimating = false;
      this.updatePaginationDots();
      this.resetAutoplay();
    }, this.speed);
  }

  updateNavigationButtons() {
    const prevButton = this.slides.parentElement.querySelector('.slider-prev');
    const nextButton = this.slides.parentElement.querySelector('.slider-next');

    if (prevButton) {
      if (!this.infinite) {
        if (this.currentIndex === 0) {
          prevButton.classList.add('disabled');
        } else {
          prevButton.classList.remove('disabled');
        }
      }
    }

    if (nextButton) {
      const totalSlides = this.slide.length;
      const maxIndex = totalSlides - this.slidesToShow;
      if (!this.infinite) {
        if (this.currentIndex >= maxIndex) {
          nextButton.classList.add('disabled');
        } else {
          nextButton.classList.remove('disabled');
        }
      }
    }
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  onSlideChange(index) {
    const event = new CustomEvent('slideChange', {
      detail: {
        index,
      },
    });
    this.slides.dispatchEvent(event);
    // return index + 1;
  }

  updatePaginationDots() {
    if (this.paginationDots) {
      this.paginationDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === Math.round(this.currentIndex));
      });
    }
  }

  addEventListeners() {
    const handleSwipe = (direction) => {
      this.showSlide(this.currentIndex + direction);
    };

    this.slides.addEventListener('click', (event) => {
      this.disableInteraction(event);
    });

    // Mouse events
    this.slides.addEventListener('mousedown', (event) => {
      this.startSwipe(event.clientX);
      setTimeout(() => {
        this.slides.classList.remove('isDragging');
      }, 500);
      event.preventDefault(); // Предотвращаем стандартное поведение

      // Добавляем обработчик для mousemove на document
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
    });

    // Touch events
    this.slides.addEventListener('touchstart', (event) => {
      this.startSwipe(event.touches[0].clientX);

      // Добавляем обработчик для touchmove на document
      document.addEventListener('touchmove', this.handleTouchMove, {
        passive: false,
      });
      document.addEventListener('touchend', this.handleTouchEnd);
    });

    const prevButton = this.slides.parentElement.querySelector('.slider-prev');
    const nextButton = this.slides.parentElement.querySelector('.slider-next');

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        this.stopAutoplay();
        handleSwipe(-1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        this.stopAutoplay();
        handleSwipe(1);
      });
    }
  }

  startSwipe(startX) {
    this.isMouseDown = true;
    this.startX = startX;
    this.isDragging = false;
    this.slides.style.transition = 'none'; // Отключаем переход
  }

  disableInteraction(event) {
    if (this.isDragging) {
      event.preventDefault();
      event.stopPropagation();

      this.slides.classList.add('isDragging');

      let picture = event.originalTarget;

      if (
        picture.hasAttribute('href') ||
        picture.closest('a') ||
        picture.hasAttribute('src') ||
        picture.closest('picture')
      ) {
        event.preventDefault();

        picture.addEventListener('mousedown', function (e) {
          e.preventDefault();
        });
      }
    } else {
      this.slides.classList.remove('isDragging');
      return;
    }
  }

  // Обработчик для mousemove
  handleMouseMove = (event) => {
    if (!this.isMouseDown || !this.isSwipeEnabled) return;
    this.isDragging = true;

    const endX = event.clientX; // Сохраняем конечное значение X
    const distanceX = endX - this.startX; // Вычисляем расстояние

    this.slides.classList.add('isDragging');

    // Обработка перемещения слайдов
    const slideWidth = 100 / this.slidesToShow;
    this.slides.style.transform = `translateX(-${
      this.currentIndex * slideWidth - (distanceX / window.innerWidth) * 100
    }%)`;
  };

  // Обработчик для mouseup
  handleMouseUp = (event) => {
    if (!this.isMouseDown) return;

    this.isMouseDown = false; // Сбрасываем флаг
    this.slides.style.transition = ''; // Включаем переход обратно

    // Логика для завершения свайпа
    const endX = event.clientX; // Получаем конечное значение X
    const distance = this.startX - endX; // Вычисляем расстояние

    if (distance > 50) {
      this.showSlide(this.currentIndex + 1); // Перемещение вправо
    } else if (distance < -50) {
      this.showSlide(this.currentIndex - 1); // Перемещение влево
    }

    // Удаляем обработчики событий
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  };

  // Обработчик для touchmove
  handleTouchMove = (event) => {
    if (!this.isMouseDown || !this.isSwipeEnabled) return;

    const endX = event.touches[0].clientX; // Сохраняем конечное значение X
    const distanceX = endX - this.startX; // Вычисляем расстояние

    // Обработка перемещения слайдов
    const slideWidth = 100 / this.slidesToShow;
    this.slides.style.transform = `translateX(-${
      this.currentIndex * slideWidth - (distanceX / window.innerWidth) * 100
    }%)`;
  };

  // Обработчик для touchend
  handleTouchEnd = (event) => {
    this.isMouseDown = false; // Сбрасываем флаг
    this.slides.style.transition = ''; // Включаем переход обратно

    const endX = event.changedTouches[0].clientX; // Получаем конечное значение X
    const distance = this.startX - endX; // Вычисляем расстояние

    if (distance > 50) {
      this.showSlide(this.currentIndex + 1); // Перемещение вправо
    } else if (distance < -50) {
      this.showSlide(this.currentIndex - 1); // Перемещение влево
    }

    // Удаляем обработчики событий
    // document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
  };

  resetDragState() {
    this.isMouseDown = false;
    this.isDragging = false;
    this.slides.style.transition = '';
  }

  startAutoplay() {
    this.autoplayInterval = setInterval(() => {
      this.showSlide(
        this.currentIndex +
          (this.slides.parentElement.dataset.slideOnce === 'true'
            ? 1
            : this.slidesToShow)
      );
    }, this.speed + 5000);
  }

  stopAutoplay() {
    clearInterval(this.autoplayInterval);
    clearTimeout(this.autoplayTimeout);
  }

  resetAutoplay() {
    clearTimeout(this.autoplayTimeout);
    this.autoplayTimeout = setTimeout(() => {
      if (this.autoplay) {
        this.startAutoplay();
      }
    }, 5000);
  }
}

// Создаем массив со слайдерами
const sliders = [];

// Инициализация всех слайдеров
document.querySelectorAll('.slider').forEach((sliderElement) => {
  if (sliderElement.dataset.sliderInit === 'true') {
    // Остальные в работе
    const slider = new Slider(sliderElement);

    sliders.push(slider);
  } else {
    // Этот слайдер не будет запущен
    console.log(`Слайдер с id ${sliderElement.id} не будет инициализирован.`);
  }

  // Общая функция для обновления карточки
  function updateCard(cardData, cardElement, index) {
    if (cardData[index]) {
      let { title, description, link, textLink } = cardData[index];

      cardElement.querySelector('[data-card-title]').style.display = !title
        ? 'none'
        : '';
      cardElement.querySelector('[data-card-title]').textContent = title;

      cardElement.querySelector('[data-card-description]').style.display =
        !description ? 'none' : '';
      cardElement.querySelector(
        '[data-card-description]'
      ).innerHTML = `${description}`;

      cardElement.querySelector('[data-card-link]').style.display = !link
        ? 'none'
        : '';
      cardElement.querySelector('[data-card-link]').setAttribute('href', link);
      cardElement.querySelector('[data-card-link]').innerText = textLink;
    }
  }

  // Изменение карточки в первом слайдере
  if (sliderElement.id === 'slider_1') {
    // Инициализация карточки при загрузке
    updateCard(mainCardData, mainCard, sliderElement.currentIndex);

    sliderElement
      .querySelector('.slides')
      .addEventListener('slideChange', (event) => {
        let currentIndex = event.detail.index;
        updateCard(mainCardData, mainCard, currentIndex);
      });
  }
});

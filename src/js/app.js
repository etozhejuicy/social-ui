// glightbox
const lightbox = GLightbox({
  touchNavigation: true,
  loop: false,
  autoplayVideos: true,
  selector: '.glightbox',
});

// mobile-menu
let isMobile = window.innerWidth <= 992;
const mainMenu = document.querySelector('.menu');
const menuElems = document.querySelectorAll('[data-menu]');
const menuItems = document.querySelectorAll('[data-menu-close]');
const header = document.querySelector('header');
const headerLogo = header.querySelector('.header-logo');
const openModalButtons = document.querySelectorAll('[data-modal-open]');
const closeButtons = document.querySelectorAll('[btn-close-modal]');
const mapLinks = document.querySelectorAll('[data-modal-open="map"]');
const mapModal = document.querySelector('#map-wrapper');
const tabContainers = document.querySelectorAll('.tabs-container');
const openHintButtons = document.querySelectorAll('[data-hint-open]');
const inputNumbers = document.querySelectorAll('[data-input-number]');
const inputPhones = document.querySelectorAll('[data-input-phone]');
const catalogButtons = document.querySelectorAll('[data-catalog]');
const navButtons = document.querySelectorAll('[data-nav]');
const catalogChapters = document.querySelectorAll('[data-catalog-chapter]');
const catalogMenuInner = document.querySelector('.catalog-menu--inner');
const catalogMenuCategories =
  catalogMenuInner.querySelectorAll('[data-chapter-id]');
const dropdowns = mainMenu?.querySelectorAll('.menu-dropdown');
const stepBlocks = document.querySelectorAll('.step');
const copyBtns = document.querySelectorAll('[data-copy-btn]');
const shareBtns = document.querySelectorAll('[data-share]');
const dialogButtons = document.querySelectorAll('[data-dialog]');
const notification = document.createElement('div');
const counters = document.querySelectorAll('.counter');
const isVariants = document.querySelector('.variants');
const makeOrderBtns = document.querySelectorAll(
  '[data-make-order], #makeOrder'
);
const askQuestionBtn = document.querySelector(
  '[data-modal-open="askQuestion"]'
);
const backCatalogButton = document.getElementById('backCatalogChapters');
const catalogMenu = document.querySelector('.catalog-menu');
const burgerButton = document.querySelector('.btn-burger');
const searchForm = document.querySelector('.header-search');
const searchInput = searchForm.querySelector('.header-search input');
const searchResult = document.querySelector('.search-result');
const searchResultTyped = searchResult.querySelector('.search-result-typed');
const toggleElements = document.querySelectorAll('[data-collapse-toggle]');
const collapseElements = document.querySelectorAll('[data-collapse-id]');
const supplyItems = document.querySelectorAll('.card-supply');
const layoutGood = document.querySelector('.layout-good');

function updateIsMobile() {
  isMobile = window.innerWidth <= 992;
}

function updateWindowSize() {
  return window.innerWidth;
}

window.addEventListener('resize', updateIsMobile);
window.addEventListener('resize', updateWindowSize);
window.addEventListener('DOMContentLoaded', updateIsMobile);
window.addEventListener('DOMContentLoaded', updateWindowSize);

window.addEventListener('scroll', setFixedHeader);
window.addEventListener('resize', setFixedHeader);
window.addEventListener('DOMContentLoaded', setFixedHeader);

// Функция дебаунса
function debounce(func, delay) {
  let timeout;

  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

function setFixedHeader() {
  if (window.scrollY >= header.offsetHeight) {
    header.classList.add('fixed');
    catalogMenu.classList.add('fixed');
    searchResult.classList.add('fixed');
  } else {
    header.classList.remove('fixed');
    catalogMenu.classList.remove('fixed');
    searchResult.classList.remove('fixed');
  }
}

function mobileMenu() {
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
}

function openMenu(menuElem) {
  if (menuElem.getAttribute('data-menu') === 'open') {
    menuElem.setAttribute('data-menu', 'closed');
    mainMenu.classList.remove('menu-show');
    document.documentElement.classList.remove('menu-open');
    catalogMenu.classList.remove('active');
  } else {
    menuElem.setAttribute('data-menu', 'open');
    mainMenu.classList.add('menu-show');
    document.documentElement.classList.add('menu-open');
    catalogMenu.classList.remove('active');
  }

  searchResultHide();

  catalogButtons.forEach((catalogButton) => {
    catalogButton.setAttribute('data-catalog', '');
  });
}

function closeMenu() {
  document.querySelector('.btn-burger').setAttribute('data-menu', 'closed');
  mainMenu.classList.remove('menu-show');
  document.documentElement.classList.remove('menu-open');

  searchResultHide();

  catalogButtons.forEach((catalogButton) => {
    catalogButton.setAttribute('data-catalog', '');
  });
}

function initDropdownMobileMenu() {
  dropdowns.forEach((dropdown) => {
    dropdown.classList.remove('open');
  });
}

if (updateWindowSize() <= 992) {
  dropdowns.forEach((dropdown) => {
    const button = dropdown.querySelector('b');

    button?.addEventListener('click', (e) => {
      toggleDropdownMenu(button);
    });
  });
}

function toggleDropdownMenu(button) {
  const parent = button.closest('.menu-dropdown');

  const isActive = parent.classList.contains('open');

  if (!isActive) {
    parent.classList.add('open');
  } else {
    parent.classList.remove('open');
  }
}

initDropdownMobileMenu();
window.addEventListener('resize', () => {
  if (window.innerWidth >= 992) {
    initDropdownMobileMenu();
  }
});

function closeAllMenus() {
  menuElems.forEach((menuElem) => {
    menuElem.setAttribute('data-menu', 'closed');
  });

  mainMenu.classList.remove('menu-show');

  document.documentElement.classList.remove('menu-open');

  catalogMenu.classList.remove('active');

  catalogButtons.forEach((catalogButton) => {
    catalogButton.setAttribute('data-catalog', '');
  });

  navButtons.forEach((navButton) => {
    navButton.setAttribute('data-nav', '');
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
    closeSearchForm();

    catalogButtons.forEach((catalogButton) => {
      catalogButton.setAttribute('data-catalog', '');
    });

    navButtons.forEach((navButton) => {
      navButton.setAttribute('data-nav', '');
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
      // burgerButton.setAttribute('data-menu', 'open');
    }

    // Открываем каталог
    catalogMenu.classList.add('active');

    if (window.innerWidth >= 991) {
      positionCatalogMenu(button);
    }

    catalogButtons.forEach((catalogButton) => {
      catalogButton.setAttribute('data-catalog', 'true');
    });
  }
}

function toggleCatalogChapters(chapter) {
  if (!chapter.classList.contains('no-arrow')) {
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
  } else {
    window.location.href = chapter.getAttribute('href');
    return;
  }
}

function initializeChapters() {
  catalogChapters.forEach((chapter) => {
    const chapterId = chapter.getAttribute('data-catalog-chapter');
    let hasMatch = false;

    catalogMenuCategories.forEach((link) => {
      const linkChapterId = link.getAttribute('data-chapter-id');
      if (linkChapterId === chapterId) {
        hasMatch = true;
      }
    });

    if (hasMatch) {
      chapter.classList.remove('no-arrow');
    } else {
      chapter.classList.add('no-arrow');
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

  let hasMatch = false;

  // catalogMenuInner.classList.add('categories-show');

  catalogMenuCategories.forEach((link) => {
    const linkChapterId = link.getAttribute('data-chapter-id');

    if (linkChapterId === chapterId) {
      link.style.display = 'flex';
      hasMatch = true;
    } else {
      link.style.display = 'none';
    }
  });

  catalogMenuInner.classList.toggle('categories-show', hasMatch);
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
  catalogMenu.style.left = `${buttonRect.left}px`;
}

function closeCatalog() {
  catalogMenu.classList.remove('active');

  closeCatalogCategories();

  catalogButtons.forEach((button) => {
    button.setAttribute('data-catalog', '');
  });
}

function dynamicPosHeaderElems() {
  const headerCatalogBtn = header?.querySelector('.header-top .container');
  const burger = header?.querySelector('[data-menu]');

  if (window.innerWidth < 991) {
    if (searchForm && catalogMenuInner) {
      catalogMenuInner.insertBefore(searchForm, catalogMenuInner.firstChild);
    }
    if (burger && catalogMenuInner) {
      headerCatalogBtn.insertBefore(burger, headerCatalogBtn.lastChild);
    }
  } else {
    if (searchForm && headerLogo) {
      headerLogo.after(searchForm);
    }
    if (burger && headerLogo) {
      headerLogo.after(burger);
    }
  }
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
  if (!isMobile) {
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
}

function searchResultHide() {
  searchResult.querySelector('div').innerHTML = '';
  searchResultTyped.textContent = '';
  searchResult.classList.remove('show');
}

function searchResultPosition() {
  const inputRect = searchForm.getBoundingClientRect();
  searchResult.style.top = `${inputRect.bottom + window.scrollY + 4}px`;
  searchResult.style.left = `${inputRect.left}px`;
}

function searchResultShow() {
  searchResultPosition();
  searchResult.classList.add('show');
}

async function searchInputType() {
  const query = searchInput.value.trim();

  if (query.length > 3) {
    // Запрос на страницу /catalog/good-search?good=query и получения json с результатами
    // const response = await fetch(`/catalog/good-search?good="${query}"`);
    // const results = await response.json();
    // console.log(results);
    const results = [
      {
        name: 'Холодильная камера КХН-4,41',
        image: './assets/images/examples/search/item.jpg',
        link: './good.html',
      },
      {
        name: 'Холодильная камера КХН-7,71',
        image: './assets/images/examples/search/item.jpg',
        link: './good.html',
      },
      {
        name: 'Холодильная камера КХН-8,81',
        image: './assets/images/examples/search/item.jpg',
        link: './good.html',
      },
      {
        name: 'Холодильная камера КХН-11,02',
        image: './assets/images/examples/search/item.jpg',
        link: './good.html',
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
    <img src="${item.image}" alt="${item.name}" />
    <div class="search-item__content">
      <span class="search-item__name">${item.name}</span>
    </div>
  `;
  return a;
}

// Обработчики событий для кнопки поиска и клика вне формы поиска
searchInput.addEventListener('click', searchToggleClick);
document.addEventListener('click', handleClickOutside);
searchInput.addEventListener('click', searchInputType);
searchInput.addEventListener('input', searchInputType);
dynamicPosHeaderElems();
window.addEventListener('resize', dynamicPosHeaderElems);
window.addEventListener('resize', searchResultPosition);
window.addEventListener('scroll', searchResultPosition);
window.addEventListener(
  'scroll',
  positionCatalogMenu(document.querySelector('.header-top [data-catalog]'))
);

// Обработчики событий для кнопок каталога
catalogButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    e.stopPropagation();

    toggleCatalog(button);
  });
});

// Обработчики событий для кнопок каталога
navButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    e.stopPropagation();

    toggleNav(button);
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
      e.preventDefault();
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

// Инициализация проверки вложенности в категориях
document.addEventListener('DOMContentLoaded', initializeChapters);

// Обработчики событий для отслеживания состояния мобильного меню и его инициализации
window.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth >= 1200) {
    mobileMenu();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth >= 1200) {
    mobileMenu();
  }
});

// Ввод только цифр для соответствующих полей
inputNumbers.forEach((input) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^0-9]/g, '');
  });
});

function validNumbers(e) {
  const allowedKeys = [
    'Backspace',
    'Tab',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'Delete',
    'Escape',
  ];

  // Разрешенные символы для ввода номера телефона
  const allowedCharacters = /^[0-9+\-() *#]$/;

  const isAllowedKey = allowedKeys.includes(e.key);
  const isAllowedCharacter = allowedCharacters.test(e.key);
  if (!isAllowedKey && !isAllowedCharacter) {
    e.preventDefault();
  }
}

// Ввод только цифр и символов для соответствующих полей
inputPhones.forEach((input) => {
  input.addEventListener('input', (e) => {
    validNumbers(e);
  });
  input.addEventListener('keydown', (e) => {
    validNumbers(e);
  });
  input.addEventListener('change', (e) => {
    validNumbers(e);
  });
});

// modal logic
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

// hint logic
openHintButtons.forEach((openHintButton) => {
  openHintButton.addEventListener('click', function (e) {
    e.stopPropagation();

    const hintKey = e.currentTarget.getAttribute('data-hint-open');
    const hint = document.querySelector('[data-hint-id="' + hintKey + '"]');
    if (hint) {
      openHint(hint, openHintButton);
    }
  });
});

function openHint(hint, button) {
  const hintText = button.getAttribute('data-hint-text');

  if (hintText) {
    hint.textContent = hintText;
  }

  hint.classList.add('show');

  positionHint(hint, button);
}

function closeHint(hint) {
  hint.classList.remove('show');
}

function positionHint(hint, button) {
  const buttonRect = button.getBoundingClientRect();
  const windowWidth = window.innerWidth;

  hint.style.top = `${buttonRect.bottom + window.scrollY + 16}px`;
  hint.style.right = `${windowWidth - buttonRect.right}px`;
}

document.addEventListener('click', (event) => {
  const hints = document.querySelectorAll('.hint');

  hints.forEach((hint) => {
    if (
      !hint.contains(event.target) &&
      !event.target.matches('[data-hint-open]')
    ) {
      closeHint(hint);
    }
  });
});

// map logic
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

  console.log(sliderElement.dataset.thumbnailSliderId);
});

// steps
let radioLimit = 8,
  checkboxLimit = 8;

function stepBreakpoints() {
  const windowWidth = window.innerWidth;

  if (windowWidth > 1360) {
    radioLimit = 8;
    checkboxLimit = 8;
  } else if (windowWidth <= 1360 && windowWidth >= 1280) {
    radioLimit = 6;
    checkboxLimit = 6;
  } else if (windowWidth <= 1280 && windowWidth >= 1200) {
    radioLimit = 6;
    checkboxLimit = 6;
  } else if (windowWidth <= 1200 && windowWidth >= 991) {
    radioLimit = 6;
    checkboxLimit = 4;
  } else if (windowWidth <= 991 && windowWidth >= 840) {
    radioLimit = 6;
    checkboxLimit = 8;
  } else if (windowWidth <= 840 && windowWidth >= 720) {
    radioLimit = 6;
    checkboxLimit = 6;
  } else {
    radioLimit = 6;
    checkboxLimit = 4;
  }
}

function initSteps() {
  stepBlocks.forEach((stepBlock) => {
    const stepTabs = stepBlock.querySelectorAll('[data-step]');
    const stepPrevButton = stepBlock.querySelector('.step-prev');
    const stepNextButton = stepBlock.querySelector('.step-next');
    const stepCounter = stepBlock.querySelector('[data-step-count]');
    const allSteps = stepTabs.length;

    let currentStepIndex = 0;
    let stepProgress = 0;
    let stepProgressElement = stepBlock.querySelector('.step-progress');

    stepTabs.forEach((tab) => {
      updateVisibleItems(tab);
    });

    function updateVisibleItems(tab) {
      const stepVariants = tab.querySelector('.step-variants');
      if (!stepVariants) return;

      const LIMITS = {
        radio: radioLimit,
        checkbox: checkboxLimit,
      };

      const radioItems = stepVariants.querySelectorAll('.radio-variant');
      const checkboxItems = stepVariants.querySelectorAll(
        '.radio-block, .checkbox-block'
      );

      const counts = {
        radio: radioItems.length,
        checkbox: checkboxItems.length,
      };

      const needButton =
        counts.radio > LIMITS.radio || counts.checkbox > LIMITS.checkbox;
      let isExpanded = false;

      let expandButton = stepVariants.nextElementSibling?.matches(
        '[data-expand-variants]'
      )
        ? stepVariants.nextElementSibling
        : null;

      const updateVisibility = () => {
        radioItems.forEach((item, index) => {
          item.style.display = isExpanded || index < LIMITS.radio ? '' : 'none';
        });

        checkboxItems.forEach((item, index) => {
          item.style.display =
            isExpanded || index < LIMITS.checkbox ? '' : 'none';
        });

        if (expandButton) {
          expandButton.textContent = isExpanded ? 'Скрыть' : 'Показать ещё';
        }
      };

      if (needButton) {
        if (!expandButton) {
          expandButton = document.createElement('button');
          expandButton.setAttribute('data-expand-variants', '');
          expandButton.setAttribute('type', 'button');
          expandButton.classList.add(
            'btn',
            'btn-light-grey',
            'btn-sm',
            'btn-rounded'
          );
          expandButton.classList.add('step-button');
          stepVariants.after(expandButton);

          expandButton.addEventListener('click', () => {
            isExpanded = !isExpanded;
            stepVariants.classList.toggle('step-expanded', isExpanded);
            updateVisibility();

            let elementRect = stepBlock.getBoundingClientRect();
            let offsetPosition =
              elementRect.top +
              window.pageYOffset -
              (window.innerWidth >= 992 ? 160 : 78);

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            });

            // stepBlock.scrollIntoView({
            //   behavior: 'smooth',
            //   block: 'start',
            // });
          });
        }
      } else if (expandButton) {
        expandButton.remove();
        expandButton = null;
      }

      updateVisibility();
    }

    function updateStepCounter() {
      const isLastStep = currentStepIndex === allSteps - 1;

      stepCounter.innerText = `Шаг ${currentStepIndex + 1}/${allSteps}`;
      stepNextButton.disabled =
        currentStepIndex === isLastStep ||
        !isRadioSelected() ||
        !inInputChanged();
      stepNextButton.style.display = isLastStep ? 'none' : '';
      stepPrevButton.disabled = currentStepIndex === 0;
      stepPrevButton.style.display = currentStepIndex === 0 ? 'none' : '';

      stepProgress =
        (1 * (currentStepIndex > 0 ? currentStepIndex + 1 : 1) * 100) /
        allSteps;

      stepProgressElement.style.width = `${stepProgress}%`;

      stepTabs.forEach((tab, index) => {
        tab.classList.toggle('active', index === currentStepIndex);
        updateVisibleItems(tab);
      });

      checkValueInputs();
    }

    function inInputChanged() {
      const inputs = stepTabs[currentStepIndex].querySelectorAll(
        '[data-input-number]'
      );

      return Array.from(inputs).every((input) => input.value.trim() !== '');
    }

    function isRadioSelected() {
      const radios = stepTabs[currentStepIndex].querySelectorAll(
        'input[type="radio"], input[type="checkbox"]'
      );

      return Array.from(radios).some((radio) => radio.checked);
    }

    function resetState() {
      stepTabs.forEach((tab) => {
        const radios = tab.querySelectorAll(
          'input[type="radio"], input[type="checkbox"]'
        );
        radios.forEach((radio) => {
          radio.checked = false;
        });
        const inputs = tab.querySelectorAll('[data-input-number]');
        inputs.forEach((input) => {
          input.value = '';
        });
        tab.classList.remove('active');
      });
      currentStepIndex = 0;
      stepProgress = 0;
      updateStepCounter();
    }

    function checkValueInputs() {
      stepTabs.forEach((tab) => {
        const inputs = tab.querySelectorAll('[data-input-number]');

        Array.from(inputs).some((input) => {
          if (
            (inInputChanged() || isRadioSelected()) &&
            input.value.trim() !== ''
          ) {
            input
              .closest('.step-tab')
              .querySelector('input[type="radio"]').checked = false;

            input
              .closest('.step-tab')
              .querySelector('input[type="radio"]').disabled = true;

            stepNextButton.disabled = false;
          } else {
            input
              .closest('.step-tab')
              .querySelector('input[type="radio"]').disabled = false;
          }

          if (isRadioSelected()) {
            stepNextButton.disabled = false;
          }
        });
      });
    }

    resetState();

    stepNextButton.addEventListener('click', () => {
      if (
        currentStepIndex < allSteps - 1 &&
        (isRadioSelected() || inInputChanged())
      ) {
        currentStepIndex++;
        updateStepCounter();

        // add scroll to parent-block
        let elementRect = stepBlock.getBoundingClientRect();
        let offsetPosition =
          elementRect.top +
          window.pageYOffset -
          (window.innerWidth >= 992 ? 160 : 78);

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
        // stepBlock.scrollIntoView({
        //   behavior: 'smooth',
        //   block: 'start',
        // });
      }
    });

    stepPrevButton.addEventListener('click', () => {
      if (currentStepIndex > 0) {
        currentStepIndex--;
        updateStepCounter();

        // add scroll to parent-block
        let elementRect = stepBlock.getBoundingClientRect();
        let offsetPosition =
          elementRect.top +
          window.pageYOffset -
          (window.innerWidth >= 992 ? 160 : 78);

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
        // stepBlock.scrollIntoView({
        //   behavior: 'smooth',
        //   block: 'start',
        // });
      }
    });

    stepTabs.forEach((tab) => {
      const radios = tab.querySelectorAll(
        'input[type="radio"], input[type="checkbox"]'
      );
      radios.forEach((radio) => {
        radio.addEventListener('change', () => {
          stepNextButton.disabled = !isRadioSelected();
        });
      });

      const inputs = tab.querySelectorAll('[data-input-number]');

      inputs.forEach((input) => {
        input.addEventListener('input', () => {
          checkValueInputs();
          stepNextButton.disabled = !inInputChanged();
        });
      });

      checkValueInputs();
    });
  });
}

if (stepBlocks.length > 0) {
  stepBreakpoints();
  window.addEventListener('resize', stepBreakpoints);

  initSteps();
}

// notification logic
function initNotify() {
  notification.classList.add('notification');
  document.body.appendChild(notification);
}

function toggleNotify(content) {
  if (notification.classList.contains('show')) {
    notification.innerHTML = `<p class="small">${content}</p>`;
  } else {
    notification.classList.add('show');
    notification.innerHTML = `<p class="small">${content}</p>`;

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.innerHTML = '';
      }, 250);
    }, 3000);
  }
}

if (notification) {
  document.addEventListener('DOMContentLoaded', initNotify);
}

// copy logic
function copyLink(e) {
  const linkToCopy = e.currentTarget.getAttribute('data-copy-btn');
  const trigger = e.currentTarget;

  navigator.clipboard
    .writeText(linkToCopy)
    .then(() => {
      toggleNotify('Ссылка скопирована в буфер обмена');
      trigger.classList.add('active');

      setTimeout(() => {
        trigger.classList.remove('active');
      }, 3000);
    })
    .catch((err) => {
      console.error('Ошибка при копировании ссылки:', err);
    });
}

copyBtns.forEach((copy) => {
  if (copy) {
    copy.setAttribute('data-copy-btn', window.location.href);
    copy.addEventListener('click', (e) => {
      copyLink(e);
    });
  }
});

// dynamic banners-block place
function updateCartBannersPlace() {
  const goodCartBanners = document.querySelector('.layout-good--banners');
  const sectionContent = document.querySelector('.layout-good--main');
  const goodCartPlace = document.querySelector('.layout-good--cart');

  if (window.innerWidth < 991) {
    if (goodCartBanners && sectionContent) {
      sectionContent.insertBefore(goodCartBanners, sectionContent.lastChild);
    }
  } else {
    if (goodCartBanners && goodCartPlace) {
      goodCartPlace.insertBefore(goodCartBanners, goodCartPlace.lastChild);
    }
  }
}

// dynamic cart-block place
function updateCartBlockPlace() {
  const goodCartElem = document.querySelector('.layout-good--cart');
  const sectionContent = document.querySelector('.layout-good--main');
  const goodCartPlace = document.querySelector('.layout-good--content');

  if (window.innerWidth < 1200) {
    if (goodCartElem && sectionContent) {
      sectionContent.insertBefore(goodCartElem, sectionContent.lastChild);
    }
  } else {
    if (goodCartElem && goodCartPlace) {
      goodCartPlace.insertBefore(goodCartElem, goodCartPlace.lastChild);
    }
  }
}

if (layoutGood) {
  updateCartBlockPlace();
  updateCartBannersPlace();

  window.addEventListener('resize', updateCartBlockPlace);
  window.addEventListener('resize', updateCartBannersPlace);
}

// collapse
function updateCollapseState() {
  toggleElements.forEach((toggle) => {
    const collapseId = toggle.getAttribute('data-collapse-toggle');
    const collapseElement = document.querySelector(
      `[data-collapse-id="${collapseId}"]`
    );

    if (toggle.classList.contains('active')) {
      collapseElement.classList.remove('collapsed');
      collapseElement.style.maxHeight = null;
    }
  });
}

updateCollapseState();

window.addEventListener('resize', updateCollapseState);
window.addEventListener('DOMContentLoaded', updateCollapseState);

// Обработчик событий для тогглеров коллапсов
toggleElements.forEach((toggle) => {
  toggle.addEventListener('click', function () {
    const collapseId = this.getAttribute('data-collapse-toggle');
    const collapseElement = document.querySelector(
      `[data-collapse-id="${collapseId}"]`
    );

    toggle.classList.toggle('active');
    if (collapseElement) {
      collapseElement.classList.toggle('collapsed');
      collapseElement.style.maxHeight = null;
    }

    const isActive = toggle.classList.contains('active');
    const scrollHeight = collapseElement.scrollHeight + 20;
    if (collapseElement) {
      if (isActive) {
        collapseElement.classList.remove('collapsed');

        collapseElement.style.maxHeight = scrollHeight + 'px';
      } else {
        collapseElement.classList.add('collapsed');
        collapseElement.style.maxHeight = null;
      }
    }
  });
});

// Функция для инициализации табов
const initTabs = (tabsContainer) => {
  const tabButtons = tabsContainer.querySelectorAll('.tabs-button');
  const tabs = tabsContainer.querySelectorAll('.tab');

  const activateTab = (tabId, shouldScroll = false) => {
    tabButtons.forEach((btn) => btn.classList.remove('active'));
    tabs.forEach((tab) => tab.classList.remove('active'));

    const activeButton = tabsContainer.querySelector(
      `.tabs-buttons [data-tab-open="${tabId}"]`
    );
    const activeTab = tabsContainer.querySelector(
      `.tab[data-tab-id="${tabId}"]`
    );

    if (activeButton) {
      activeButton.classList.add('active');
    }

    if (activeTab) {
      activeTab.classList.add('active');
      // Прокрутка к активной вкладке только если shouldScroll = true
      if (shouldScroll) {
        activeTab.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  // Обработчик клика по кнопкам вкладок
  tabButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      // если есть аттрибут for у кнопки, то находим элемент с id указанный в for и переводим в checked

      const checkbox = document.querySelector(
        `[id="${button.getAttribute('for')}"]`
      );
      if (checkbox) {
        checkbox.checked = true;
      }
      const tabId = button.getAttribute('data-tab-open');
      activateTab(tabId);
    });
  });

  // Обработчик клика по ссылкам с data-link-tab-open
  const linkTabs = document.querySelectorAll('[data-link-tab-open]');
  linkTabs.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      linkTabs.forEach((l) => l.classList.remove('active'));

      link.classList.add('active');

      const tabId = link.getAttribute('data-link-tab-open');
      activateTab(tabId, true);
    });
  });

  // Проверка наличия якоря в URL
  const hash = window.location.hash.substring(1);
  if (hash) {
    activateTab(hash, true);
  }
};

// Инициализация табов для каждого контейнера
tabContainers.forEach(initTabs);

// card-supply logic
function flipSupply(elem) {
  const isActive = elem.classList.contains('active');

  supplyItems.forEach((supplyItem) => {
    supplyItem.classList.remove('active');
  });

  if (isMobile) {
    if (isActive) {
      elem.classList.remove('active');
    } else {
      elem.classList.add('active');
    }
  }
}

function initFlippySupply() {
  supplyItems.forEach((supplyItem) => {
    if (supplyItem) {
      supplyItem.addEventListener('click', (e) => {
        flipSupply(e.currentTarget);
      });
    }
  });
}

initFlippySupply();
window.addEventListener('resize', () => {
  if (updateIsMobile === true) {
    initFlippySupply();
  }
});

// share logic
shareBtns.forEach((share) => {
  if (share) {
    const type = share.getAttribute('data-share');
    const url = encodeURIComponent(window.location.href);
    const title = document.title ? encodeURIComponent(document.title) : '';

    shareInit(type, share, url, title);
  }
});

function shareInit(type, trigger, url, title) {
  const shareUrls = {
    vk: `https://vk.com/share.php?url=${url}&title=${title}`,
    tg: `https://t.me/share/url?url=${url}&text=${title}`,
    whatsapp: `https://wa.me/?text=${title}%20${url}`,
    mail: `mailto:?subject=${title}&body=${url}`,
  };

  if (shareUrls[type]) {
    trigger.setAttribute('href', shareUrls[type]);
  }
}

// make order on good page
function makeOrder(elem) {
  const orderModal = document.querySelector('[data-modal-id="makeOrder"]');
  const goodTitle = document.querySelector('.layout-good--header h1');
  const orderModalTitle = orderModal.querySelector('.modal-title > *');
  const orderModalInputTitle = orderModal.querySelector(
    'input[name="hiddenModalOrderTitle"]'
  );

  let button = elem.currentTarget,
    buttonId = button.dataset.makeOrder - 1;

  const rows = document?.querySelectorAll('.variants table tr');
  let model = rows[1]?.children[buttonId + 1].innerText;

  orderModalTitle.innerText = isVariants
    ? `${goodTitle.innerText}-${model}`
    : `${goodTitle.innerText}`;

  // Изменение полей модалки
  const updateModalFields = debounce(() => {
    orderModalInputTitle.value = isVariants
      ? `${goodTitle.innerText}-${model}`
      : `${goodTitle.innerText}`;
  }, 300);

  updateModalFields();

  openModal(orderModal);
}

makeOrderBtns.forEach((makeOrderBtn) => {
  if (makeOrderBtn) {
    makeOrderBtn?.addEventListener('click', (elem) => {
      makeOrder(elem);
    });
  }
});

// ask a question on good page
function askQuestion() {
  const questionModal = document.querySelector('[data-modal-id="askQuestion"]');
  const goodTitle = document.querySelector('.layout-good--header h1');
  const questionModalInputTitle = questionModal.querySelector(
    'input[name="modalQuestionHiddenTitle"]'
  );

  // Изменение полей модалки
  const updateModalFields = debounce(() => {
    questionModalInputTitle.value = goodTitle.innerText;
  }, 300);

  updateModalFields();

  openModal(questionModal);
}

askQuestionBtn?.addEventListener('click', askQuestion);

// chat with manager from social-links on good page
dialogButtons.forEach((dialog) => {
  if (dialog) {
    const type = dialog.getAttribute('data-dialog');
    const url = encodeURIComponent(window.location.href);
    const title = document.title ? encodeURIComponent(document.title) : '';

    chatManager(type, dialog, url, title);
  }
});

function chatManager(type, trigger, url, title) {
  const phoneNumber = '+79000000000';
  const userName = 'line_holod';

  const dialogUrls = {
    telegram: `https://t.me/${userName}`,
    whatsapp: `https://wa.me/${phoneNumber}?text=${title}%20${url}`,
  };

  if (dialogUrls[type]) {
    trigger.setAttribute('href', dialogUrls[type]);
  }
}

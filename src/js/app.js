// glightbox
const lightbox = GLightbox({
  touchNavigation: true,
  loop: false,
  autoplayVideos: true,
  selector: '.glightbox',
});

// mobile-menu
let isMobile = window.innerWidth <= 992;
// const openModalButtons = document.querySelectorAll('[data-modal-open]');
// const closeButtons = document.querySelectorAll('[btn-close-modal]');
const mapLinks = document.querySelectorAll('[data-modal-open="map"]');
const mapModal = document.querySelector('#map-wrapper');
const tabContainers = document.querySelectorAll('.tabs-container');
const openHintButtons = document.querySelectorAll('[data-hint-open]');
const inputNumbers = document.querySelectorAll('[data-input-number]');
const inputPhones = document.querySelectorAll('[data-input-phone]');
const catalogButtons = document.querySelectorAll('[data-catalog]');
const navButtons = document.querySelectorAll('[data-nav]');
const catalogChapters = document.querySelectorAll('[data-catalog-chapter]');
const copyBtns = document.querySelectorAll('[data-copy-btn]');
const shareBtns = document.querySelectorAll('[data-share]');
const dialogButtons = document.querySelectorAll('[data-dialog]');
const notification = document.createElement('div');
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

// Функция дебаунса
function debounce(func, delay) {
  let timeout;

  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

// modal logic
// openModalButtons.forEach((openModalButton) => {
//   openModalButton.addEventListener('click', function (e) {
//     const modalKey = e.currentTarget.getAttribute('data-modal-open');
//     const modal = document.querySelector('[data-modal-id="' + modalKey + '"]');
//     if (modal) {
//       openModal(modal);
//     }
//   });
// });

// function openModal(modal) {
//   modal.classList.add('show');
//   document.documentElement.classList.add('modal-open');
// }

// function closeModal(modal) {
//   modal.classList.remove('show');
//   document.documentElement.classList.remove('modal-open');
// }

// closeButtons.forEach((closeButton) => {
//   closeButton.addEventListener('click', function () {
//     const modal = closeButton.closest('.modal');
//     if (modal) {
//       closeModal(modal);
//     }
//   });
// });

// window.addEventListener('click', function (event) {
//   const modals = document.querySelectorAll('.modal');
//   modals.forEach((modal) => {
//     if (event.target === modal) {
//       closeModal(modal);
//     }
//   });
// });

// Обработчик для ссылок с якорем
// document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
//   anchor.addEventListener('click', function (e) {
//     const modalKey = this.getAttribute('href').substring(1);
//     const modal = document.querySelector('[data-modal-id="' + modalKey + '"]');

//     if (modal) {
//       e.preventDefault();

//       openModal(modal);

//       history.pushState(
//         '',
//         document.title,
//         window.location.pathname + window.location.search
//       );
//     }
//   });
// });

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

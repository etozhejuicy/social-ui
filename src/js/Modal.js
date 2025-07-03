class Modal {
  constructor() {
    this.openButtons = document.querySelectorAll('[data-modal-open]');
    this.closeButtons = document.querySelectorAll('[data-modal-close]');
    this.title = '';
    this.content = '';
    this.selector = '';
    this.events();
  }

  events() {
    this.openButtons.forEach((openButton) => {
      openButton.addEventListener('click', (e) => {
        try {
          const modalKey = e.currentTarget.dataset.modalOpen;
          const modal = document.querySelector(
            '[data-modal-id="' + modalKey + '"]'
          );

          this.title = e.currentTarget.dataset.modalTitle;
          this.content = e.currentTarget.dataset.modalContent;
          this.selector = e.currentTarget.dataset.modalClass;

          this.open(modal, this.title, this.content, this.selector);
        } catch (error) {
          console.error(
            `Ошибка, окно не найдено: ${e.currentTarget.dataset.modalOpen} \n ${error}`
          );
        }
      });
    });

    this.closeButtons.forEach((closeButton) => {
      closeButton.addEventListener('click', () => {
        try {
          const modal = closeButton.closest('.modal');

          if (modal) {
            this.close(modal);
          }
        } catch (error) {
          console.error(error);
        }
      });
    });

    window.addEventListener('click', (event) => {
      const modals = document.querySelectorAll('.modal');

      modals.forEach((modal) => {
        if (event.target === modal) {
          this.close(modal);
        }
      });
    });
  }

  open(modal, title, content, selector) {
    const modalTitle = modal?.querySelector('.modal-title');
    const modalContent = modal?.querySelector('.modal-body');

    modal.classList.add('show');
    document.documentElement.classList.add('modal-open');

    if (title) modalTitle.innerHTML = title;
    if (content) modalContent.innerHTML = content;
    if (selector) modal?.classList.add(selector);
  }

  close(modal) {
    modal.classList.remove('show');
    document.documentElement.classList.remove('modal-open');
  }
}

new Modal();

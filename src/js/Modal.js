class Modal {
  constructor() {
    this.openButtons = document.querySelectorAll('[data-modal-open]');
    this.closeButtons = document.querySelectorAll('[data-modal-close]');
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

          this.open(modal);
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

  open(modal) {
    modal.classList.add('show');
    document.documentElement.classList.add('modal-open');
  }

  close(modal) {
    modal.classList.remove('show');
    document.documentElement.classList.remove('modal-open');
  }
}

new Modal();

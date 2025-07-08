class Modal {
  constructor() {
    this.openButtons = document.querySelectorAll('[data-modal-open]');
    this.closeButtons = document.querySelectorAll('[data-modal-close]');
    this.generateButtons = document.querySelectorAll('[data-modal-generate]');
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

          this.open(modal);
        } catch (error) {
          console.error(
            `Ошибка, окно не найдено: ${e.currentTarget.dataset.modalOpen} \n ${error}`
          );
        }
      });
    });

    this.generateButtons.forEach((generateButton) => {
      generateButton.addEventListener('click', (e) => {
        try {
          const existModal = document.querySelector(
            '[data-modal-id="' + e.currentTarget.dataset.modalGenerate + '"]'
          );

          this.title = e.currentTarget.dataset.modalTitle;
          this.content = e.currentTarget.dataset.modalContent;
          this.selector = e.currentTarget.dataset.modalClass;

          if (
            existModal &&
            e.currentTarget.dataset.modalGenerate === existModal.dataset.modalId
          ) {
            this.open(existModal);
          } else {
            this.generate(e);
          }
        } catch (error) {
          console.error(error);
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
    this.setup(modal);
    modal.classList.add('show');
    document.documentElement.classList.add('modal-open');
  }

  generate(e) {
    const modal = document.createElement('div');

    modal.innerHTML = `
            <button class="btn btn-close" data-modal-close>
              <i class="icon-cross"></i>
            </button>
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-title h2"></div>
                <div class="modal-body"></div>
              </div>
            </div>
          `;

    modal.classList.add('modal');
    modal.dataset.modalId = e.currentTarget.dataset.modalGenerate;

    document.body.append(modal);

    setTimeout(() => {
      this.open(modal);
    }, 50);
  }

  setup(modal, title, content, selector) {
    if (modal) {
      const modalTitle = modal?.querySelector('.modal-title');
      const modalContent = modal?.querySelector('.modal-body');

      title ? (this.title = title) : null;
      content ? (this.content = content) : null;
      selector ? (this.selector = selector) : null;

      modalTitle.innerHTML = this.title;
      modalContent.innerHTML = this.content;
      modal?.classList.add(this.selector);
    }
  }

  close(modal) {
    modal.classList.remove('show');
    document.documentElement.classList.remove('modal-open');
  }
}

new Modal();

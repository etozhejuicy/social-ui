// Просто создание окна
// const modal = new Modal();
// modal.create({
// 	title: "Заголовок окна",
// 	content: "<p>Содержимое модального окна</p>"
// });

// ...... //

// Создание с кастомным ID и классом
// modal.create({
// 	id: "custom-modal",
// 	title: "Мое окно",
// 	content: "<p>Контент</p>",
// 	className: "my-custom-modal"
// });

// ...... //

// Создание без автоматического открытия
// const myModal = modal.create({
// 	title: "Окно",
// 	content: "Содержимое",
// 	showImmediately: false
// });

// Позже можно открыть
// myModal.classList.add("show");
// document.documentElement.classList.add("modal-open");

// ...... //

// Обновление существующего модального окна
// Если окно с таким ID уже существует, оно будет обновлено
// modal.create({
// 	id: "existing-modal",
// 	title: "Новый заголовок",
// 	content: "Новое содержимое"
// });

// ...... //

// // Открытие по ID ([data-modal-id])
// const modal = new Modal();

// // Создаем модальное окно
// modal.create({
// 	id: "dynamic-modal",
// 	title: "Динамическое окно",
// 	content: "<p>Создано программно</p>",
// 	className: "custom-modal",
// 	showImmediately: false,
// });

// // Позже открываем его по ID
// modal.open("dynamic-modal");

// ...... //

// // Традиционное использование (по селектору):
// const modal = new Modal();

// // По-прежнему работает с DOM-элементом
// const modalElement = document.querySelector('[data-modal-id="existing-modal"]');
// modal.open(modalElement);

class Modal {
	constructor() {
		this.openButtons = document.querySelectorAll("[data-modal-open]");
		this.closeButtons = document.querySelectorAll("[data-modal-close]");
		this.generateButtons = document.querySelectorAll(
			"[data-modal-generate]"
		);
		this.title = "";
		this.content = "";
		this.selector = "";
		this.events();
	}

	events() {
		this.openButtons.forEach((openButton) => {
			openButton.addEventListener("click", (e) => {
				try {
					const modalKey = e.currentTarget.dataset.modalOpen;
					const modal = document.querySelector(
						'[data-modal-id="' + modalKey + '"]'
					);

					e.currentTarget.dataset.modalTitle
						? (this.title = e.currentTarget.dataset.modalTitle)
						: null;
					e.currentTarget.dataset.modalContent
						? (this.content = e.currentTarget.dataset.modalContent)
						: null;
					e.currentTarget.dataset.modalClass
						? (this.selector = e.currentTarget.dataset.modalClass)
						: null;

					this.open(modal);
				} catch (error) {
					console.error(
						`Ошибка, окно не найдено: ${e.currentTarget.dataset.modalOpen} \n ${error}`
					);
				}
			});
		});

		this.generateButtons.forEach((generateButton) => {
			generateButton.addEventListener("click", (e) => {
				try {
					const existModal = document.querySelector(
						'[data-modal-id="' +
							e.currentTarget.dataset.modalGenerate +
							'"]'
					);

					this.title = e.currentTarget.dataset.modalTitle;
					this.content = e.currentTarget.dataset.modalContent;
					this.selector = e.currentTarget.dataset.modalClass;

					if (
						existModal &&
						e.currentTarget.dataset.modalGenerate ===
							existModal.dataset.modalId
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
			closeButton.addEventListener("click", () => {
				try {
					const modal = closeButton.closest(".modal");

					if (modal) {
						this.close(modal);
					}
				} catch (error) {
					console.error(error);
				}
			});
		});

		window.addEventListener("click", (event) => {
			const modals = document.querySelectorAll(".modal");

			modals.forEach((modal) => {
				if (
					event.target === modal ||
					event.target.closest("[data-modal-close]")
				) {
					this.close(modal);
				}
			});
		});
	}

	generate(e) {
		const modal = document.createElement("div");

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

		modal.classList.add("modal");
		modal.dataset.modalId = e.currentTarget.dataset.modalGenerate;

		document.body.append(modal);

		setTimeout(() => {
			this.open(modal);
		}, 50);
	}

	create(options = {}) {
		const {
			id = `modal-${Date.now()}`,
			title = "",
			content = "",
			className = "",
			showImmediately = true,
		} = options;

		// Проверяем, существует ли уже модальное окно с таким id
		let modal = document.querySelector(`[data-modal-id="${id}"]`);

		if (!modal) {
			// Создаем новое модальное окно
			modal = document.createElement("div");
			modal.classList.add("modal");
			modal.dataset.modalId = id;

			modal.innerHTML = `
				<button class="btn btn-close" data-modal-close>
					<i class="icon-cross"></i>
				</button>
				<div class="modal-dialog">
					<div class="modal-content">
						${title ? `<div class="modal-title h2">${title}</div>` : ""}
						${content ? `<div class="modal-body">${content}</div>` : ""}
					</div>
				</div>
			`;

			document.body.append(modal);

			// Добавляем кастомный класс если указан
			if (className) {
				modal.classList.add(className);
			}
		} else {
			// Обновляем существующее модальное окно
			this.setup(modal, title, content, className);
		}

		// Показываем модальное окно если требуется
		if (showImmediately) {
			this.open(modal);
		}

		return modal;
	}

	// Обновленный метод setup для поддержки параметров
	setup(modal, title = null, content = null, selector = null) {
		if (modal) {
			const modalTitle = modal?.querySelector(".modal-title");
			const modalContent = modal?.querySelector(".modal-body");

			// Используем переданные значения или значения из экземпляра
			const titleToSet = title !== null ? title : this.title;
			const contentToSet = content !== null ? content : this.content;
			const selectorToSet = selector !== null ? selector : this.selector;

			if (titleToSet && titleToSet !== "" && modalTitle) {
				modalTitle.innerHTML = titleToSet;
			}

			if (contentToSet && contentToSet !== "" && modalContent) {
				modalContent.innerHTML = contentToSet;
			}

			if (selectorToSet && selectorToSet !== "") {
				modal.classList.add(selectorToSet);
			}
		}
	}

	// Существующие методы без изменений
	open(modal, callback) {
		// Если передан string - ищем элемент по data-modal-id
		if (typeof modal === "string") {
			modal = document.querySelector(`[data-modal-id="${modal}"]`);

			if (!modal) {
				console.error(`Модальное окно с id "${modal}" не найдено`);
				return;
			}
		}

		// Проверяем, что modal - это DOM-элемент
		if (!(modal instanceof Element)) {
			console.error(
				"Недопустимый параметр модального окна: должен быть элементом DOM или строкой идентификатора окна"
			);
			return;
		}

		this.setup(modal);
		modal.classList.add("show");
		document.documentElement.classList.add("modal-open");

		if (callback && typeof callback === "function") {
			callback();
		}
	}

	resetState() {
		this.title = "";
		this.content = "";
		this.selector = "";
	}

	close(modal) {
		this.resetState(modal);
		modal.classList.remove("show");
		document.documentElement.classList.remove("modal-open");
	}
}

new Modal();

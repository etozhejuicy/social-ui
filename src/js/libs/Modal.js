class Modal {
	constructor() {
		this.openButtons = document.querySelectorAll("[data-modal-open]");
		this.closeButtons = document.querySelectorAll("[data-modal-close]");
		this.generateButtons = document.querySelectorAll(
			"[data-modal-generate]",
		);
		this.title = ``;
		this.description = null;
		this.content = "";
		this.selector = "";
		this.defaultDescriptions = new WeakMap();
		this.events();
	}

	events() {
		this.openButtons.forEach((openButton) => {
			openButton.addEventListener("click", (e) => {
				if (openButton.tagName === "A") e.preventDefault();
				try {
					const modalKey = e.currentTarget.dataset.modalOpen;
					const modal = document.querySelector(
						'[data-modal-id="' + modalKey + '"]',
					);

					e.currentTarget.dataset.modalTitle
						? (this.title = e.currentTarget.dataset.modalTitle)
						: null;

					this.description = e.currentTarget.hasAttribute(
						"data-modal-description",
					)
						? e.currentTarget.dataset.modalDescription
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
						`Ошибка, окно не найдено: ${e.currentTarget.dataset.modalOpen} \n ${error}`,
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
						'"]',
					);

					this.title = e.currentTarget.dataset.modalTitle;
					this.description = e.currentTarget.hasAttribute(
						"data-modal-description",
					)
						? e.currentTarget.dataset.modalDescription
						: null;
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

		// Клик по затемнению закрывает только соответствующее окно.
		window.addEventListener("click", (event) => {
			if (event.target.matches?.(".modal")) {
				this.close(event.target);
			}
		});

		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape") {
				const modals = document.querySelectorAll('.modal');
				modals?.forEach((modal) => {
					this.close(modal);
				});
			}
		});
	}

	generate(e) {
		const modal = document.createElement("div");

		modal.innerHTML = `
            <div class="modal-dialog">
              <div class="modal-content">
								<div class="modal-header">
									<div class="modal-title"></div>
									<button class="btn-close aspected" data-modal-close>
										<i class="icon-x"></i>
									</button>
								</div>
								<div class="modal-description"></div>
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
			title = ``,
			description = "",
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
			modal.setAttribute('role', 'dialog');

			modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        ${title ? `<div class="modal-title">${title}</div>` : ""}
                        <button class="btn-close aspected" data-modal-close>
													<i class="icon-x"></i>
												</button>
                    </div>
										${description ? `<div class="modal-description">${description}</div>` : ""}
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
			this.setup(modal, title, description, content, className);
		}

		// Показываем модальное окно если требуется
		if (showImmediately) {
			this.open(modal);
		}

		return modal;
	}

	setup(modal, title = null, desctiption = null, content = null, selector = null) {
		if (modal) {
			const modalTitle = modal?.querySelector(".modal-title");
			const modalDescription = modal?.querySelector(".modal-description");
			const modalContent = modal?.querySelector(".modal-body");

			// Проверяем, если второй параметр - объект (options), то обрабатываем его
			if (typeof title === "object" && title !== null) {
				const options = title;
				const titleToSet =
					options.title !== undefined ? options.title : this.title;
				const descriptionToSet =
					options.description !== undefined
						? options.description
						: this.description;
				const contentToSet =
					options.content !== undefined
						? options.content
						: this.content;
				const selectorToSet =
					options.selector !== undefined
						? options.selector
						: this.selector;

				if (titleToSet && titleToSet !== "" && modalTitle) {
					modalTitle.innerHTML = titleToSet;
				}

				if (descriptionToSet && descriptionToSet !== "" && modalDescription) {
					modalDescription.innerHTML = descriptionToSet;
				}

				if (contentToSet && contentToSet !== "" && modalContent) {
					modalContent.innerHTML = contentToSet;
				}

				if (selectorToSet && selectorToSet !== "") {
					modal.classList.add(selectorToSet);
				}
			} else {
				// Иначе используем отдельные параметры
				const titleToSet = title !== null ? title : this.title;
				const descriptionToSet = content !== null ? content : this.description;
				const contentToSet = content !== null ? content : this.content;
				const selectorToSet =
					selector !== null ? selector : this.selector;

				if (titleToSet && titleToSet !== "" && modalTitle) {
					modalTitle.innerHTML = titleToSet;
				}

				if (descriptionToSet && descriptionToSet !== "" && modalDescription) {
					modalDescription.innerHTML = descriptionToSet;
				}

				if (contentToSet && contentToSet !== "" && modalContent) {
					modalContent.innerHTML = contentToSet;
				}

				if (selectorToSet && selectorToSet !== "") {
					modal.classList.add(selectorToSet);
				}
			}
		}
	}

	setDescription(modal, description = this.description) {
		const modalDescription = modal?.querySelector(".modal-description");

		if (!modalDescription) return;

		if (!this.defaultDescriptions.has(modalDescription)) {
			this.defaultDescriptions.set(
				modalDescription,
				modalDescription.textContent.trim(),
			);
		}

		const defaultDescription =
			this.defaultDescriptions.get(modalDescription) || "";

		modalDescription.textContent =
			description !== null && description !== undefined
				? description
				: defaultDescription;
	}

	// Открытие модального окна
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
				"Недопустимый параметр модального окна: должен быть элементом DOM или строкой идентификатора окна",
			);
			return;
		}

		// В каждый момент времени показываем только одну модалку.
		// Запоминаем настройки нового окна: close() старого сбрасывает их.
		const nextState = { title: this.title, description: this.description, content: this.content, selector: this.selector };
		document.querySelectorAll(".modal.show").forEach((opened) => {
			if (opened !== modal) this.close(opened);
		});
		Object.assign(this, nextState);
		this.setup(modal);
		this.setDescription(modal);
		modal.classList.add("show");
		document.documentElement.classList.add("modal-open");
		modal.dispatchEvent(new CustomEvent("modal:opened"));

		if (callback && typeof callback === "function") {
			callback();
		}
	}

	resetState() {
		this.title = ``;
		this.description = null;
		this.content = "";
		this.selector = "";
	}

	close(modal) {
		if (!modal || !modal.classList.contains("show")) return;
		this.resetState(modal);
		modal.classList.remove("show");
		document.documentElement.classList.toggle("modal-open", !!document.querySelector(".modal.show"));
		// Универсальный Steps ничего не знает о модалках.
		modal.querySelectorAll("form[data-steps]").forEach((form) => form.reset());
		modal.dispatchEvent(new CustomEvent("modal:closed"));
	}
}
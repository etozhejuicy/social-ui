class Collapse {
	constructor(options = {}) {
		this.config = {
			toggleSelector: "[data-collapse-toggle]",
			collapseSelector: "[data-collapse-id]",
			linkSelector: "[data-collapse-link-open]",
			activeClass: "active",
			collapsedClass: "collapsed",
			closeOthers: false,
			smoothScroll: true,
			scrollOffsetDesktop: 160,
			scrollOffsetMobile: 78,
			animationDuration: 250,
			...options,
		};

		this.toggleElements = null;
		this.collapseElements = null;
		this.linkElements = null;
		this.isInitialized = false;

		this.init();
	}

	/**
	 * Инициализация менеджера
	 */
	init() {
		if (this.isInitialized) return;

		this.toggleElements = document.querySelectorAll(
			this.config.toggleSelector,
		);
		this.collapseElements = document.querySelectorAll(
			this.config.collapseSelector,
		);
		this.linkElements = document.querySelectorAll(this.config.linkSelector);

		this.setupEventListeners();
		this.updateCollapseState();

		this.isInitialized = true;

		// console.log("Collapse инициализирован");
	}

	/**
	 * Настройка обработчиков событий
	 */
	setupEventListeners() {
		// Обработчики для тогглеров
		this.toggleElements.forEach((toggle) => {
			toggle.addEventListener("click", (e) => this.handleToggleClick(e));
		});

		// Обработчики для ссылок
		this.linkElements.forEach((link) => {
			link.addEventListener("click", (e) => this.handleLinkClick(e));
		});

		// Обновление состояния при изменении размера окна
		window.addEventListener("resize", () => this.updateCollapseState());
	}

	/**
	 * Обработка клика по тогглеру
	 */
	handleToggleClick(event) {
		const toggle = event.currentTarget;
		const collapseId = toggle.getAttribute("data-collapse-toggle");

		this.toggleCollapse(collapseId);
	}

	/**
	 * Обработка клика по ссылке
	 */
	handleLinkClick(event) {
		event.preventDefault();

		const link = event.currentTarget;
		const collapseId = link.getAttribute("data-collapse-link-open");

		this.activateCollapse(collapseId);
	}

	/**
	 * Переключение состояния collapse
	 */
	toggleCollapse(collapseId) {
		const toggle = this.getToggleElement(collapseId);
		const collapse = this.getCollapseElement(collapseId);

		if (!toggle || !collapse) return;

		const isActive = toggle.classList.contains(this.config.activeClass);

		if (isActive) {
			toggle.classList.remove(this.config.activeClass);
			toggle.setAttribute("aria-expanded", "false");

			if (this.hasPreview(collapse)) {
				collapse.removeAttribute("aria-hidden");
			} else {
				collapse.setAttribute("aria-hidden", "true");
			}

			this.closeCollapse(collapse);
		} else {
			if (this.config.closeOthers) {
				this.closeAllCollapses(collapseId);
			}

			toggle.classList.add(this.config.activeClass);
			toggle.setAttribute("aria-expanded", "true");

			if (this.hasPreview(collapse)) {
				collapse.removeAttribute("aria-hidden");
			} else {
				collapse.setAttribute("aria-hidden", "false");
			}

			this.openCollapse(collapse);
		}
	}

	/**
	 * Проверка режима превью: в закрытом состоянии остается видимой
	 * первая строка контента вместо полного скрытия блока.
	 */
	hasPreview(collapseElement) {
		return collapseElement.hasAttribute("data-collapse-preview");
	}

	/**
	 * Вычисляет высоту одной строки превью с учетом реальной типографики.
	 */
	updatePreviewHeight(collapseElement) {
		if (!this.hasPreview(collapseElement)) return;

		const previewText =
			collapseElement.querySelector("[data-collapse-preview-text]") ||
			collapseElement.firstElementChild;

		if (!previewText) return;

		const styles = window.getComputedStyle(previewText);
		let lineHeight = Number.parseFloat(styles.lineHeight);

		if (!Number.isFinite(lineHeight)) {
			const fontSize = Number.parseFloat(styles.fontSize) || 16;
			lineHeight = fontSize * 1.4;
		}

		collapseElement.style.setProperty(
			"--collapse-preview-height",
			`${Math.ceil(lineHeight)}px`,
		);
	}

	/**
	 * Высота закрытого состояния. Для обычного collapse это 0,
	 * для preview-collapse — одна строка текста.
	 */
	getCollapsedHeight(collapseElement) {
		if (!this.hasPreview(collapseElement)) return 0;

		this.updatePreviewHeight(collapseElement);

		return (
			Number.parseFloat(
				window
					.getComputedStyle(collapseElement)
					.getPropertyValue("--collapse-preview-height"),
			) || 0
		);
	}

	/**
	 * Открытие collapse
	 */
	openCollapse(collapseElement) {
		// Если пользователь нажал повторно во время анимации,
		// начинаем с фактической текущей высоты.
		const currentHeight = collapseElement.getBoundingClientRect().height;

		collapseElement.style.height = `${currentHeight}px`;
		collapseElement.classList.remove(this.config.collapsedClass);

		// Заставляем браузер зафиксировать начальное состояние.
		collapseElement.offsetHeight;

		const targetHeight = collapseElement.scrollHeight;

		requestAnimationFrame(() => {
			collapseElement.style.height = `${targetHeight}px`;
		});

		const onTransitionEnd = (event) => {
			if (
				event.target !== collapseElement ||
				event.propertyName !== "height"
			) {
				return;
			}

			collapseElement.style.height = "";
			collapseElement.removeEventListener(
				"transitionend",
				onTransitionEnd,
			);
		};

		collapseElement.addEventListener(
			"transitionend",
			onTransitionEnd,
		);
	}

	/**
	 * Закрытие collapse
	 */
	closeCollapse(collapseElement) {
		const currentHeight =
			collapseElement.getBoundingClientRect().height;

		collapseElement.style.height = `${currentHeight}px`;

		// Фиксируем текущую высоту.
		collapseElement.offsetHeight;

		collapseElement.classList.add(
			this.config.collapsedClass,
		);

		const collapsedHeight = this.getCollapsedHeight(collapseElement);

		requestAnimationFrame(() => {
			collapseElement.style.height = `${collapsedHeight}px`;
		});

		const onTransitionEnd = (event) => {
			if (
				event.target !== collapseElement ||
				event.propertyName !== "height"
			) {
				return;
			}

			collapseElement.style.height = "";
			collapseElement.removeEventListener(
				"transitionend",
				onTransitionEnd,
			);
		};

		collapseElement.addEventListener(
			"transitionend",
			onTransitionEnd,
		);
	}

	/**
	 * Активация конкретного collapse (с плавной прокруткой)
	 */
	activateCollapse(collapseId) {
		const toggle = this.getToggleElement(collapseId);

		if (!toggle) return;

		const isActive = toggle.classList.contains(this.config.activeClass);

		if (!isActive) {
			toggle.dispatchEvent(new Event("click"));
		}

		if (this.config.smoothScroll) {
			this.scrollToToggle(toggle);
		}
	}

	/**
	 * Плавная прокрутка к тогглеру
	 */
	scrollToToggle(toggleElement) {
		setTimeout(() => {
			const elementRect = toggleElement.getBoundingClientRect();
			const isDesktop = window.innerWidth >= 992;
			const offset = isDesktop
				? this.config.scrollOffsetDesktop
				: this.config.scrollOffsetMobile;

			const offsetPosition =
				elementRect.top + window.pageYOffset - offset;

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});
		}, this.config.animationDuration);
	}

	/**
	 * Закрытие всех collapses, кроме указанного
	 */
	closeAllCollapses(excludeCollapseId = null) {
		this.toggleElements.forEach((toggle) => {
			const collapseId = toggle.getAttribute("data-collapse-toggle");

			if (collapseId === excludeCollapseId) return;

			const collapse = this.getCollapseElement(collapseId);

			if (toggle.classList.contains(this.config.activeClass)) {
				toggle.classList.remove(this.config.activeClass);
				toggle.setAttribute("aria-expanded", "false");

				if (collapse) {
					if (this.hasPreview(collapse)) {
						collapse.removeAttribute("aria-hidden");
					} else {
						collapse.setAttribute("aria-hidden", "true");
					}

					this.closeCollapse(collapse);
				}
			}
		});
	}

	/**
	 * Обновление состояния всех collapses
	 */
	updateCollapseState() {
		this.toggleElements.forEach((toggle) => {
			const collapseId =
				toggle.getAttribute("data-collapse-toggle");

			const collapse =
				this.getCollapseElement(collapseId);

			if (!collapse) return;

			const isActive =
				toggle.classList.contains(this.config.activeClass);
			const hasPreview = this.hasPreview(collapse);

			this.updatePreviewHeight(collapse);

			toggle.setAttribute(
				"aria-expanded",
				String(isActive),
			);

			collapse.classList.toggle(
				this.config.collapsedClass,
				!isActive,
			);

			// Preview-collapse остается частично видимым, поэтому скрывать
			// весь region от assistive technologies некорректно.
			if (hasPreview) {
				collapse.removeAttribute("aria-hidden");
			} else {
				collapse.setAttribute(
					"aria-hidden",
					String(!isActive),
				);
			}

			collapse.style.height = "";
		});
	}

	/**
	 * Получение элемента тогглера по ID
	 */
	getToggleElement(collapseId) {
		return document.querySelector(
			`${this.config.toggleSelector}[data-collapse-toggle="${collapseId}"]`,
		);
	}

	/**
	 * Получение элемента collapse по ID
	 */
	getCollapseElement(collapseId) {
		return document.querySelector(
			`${this.config.collapseSelector}[data-collapse-id="${collapseId}"]`,
		);
	}

	/**
	 * Открытие collapse по ID
	 */
	open(collapseId) {
		const toggle = this.getToggleElement(collapseId);

		if (!toggle || toggle.classList.contains(this.config.activeClass)) {
			return;
		}

		this.toggleCollapse(collapseId);
	}

	/**
	 * Закрытие collapse по ID
	 */
	close(collapseId) {
		const toggle = this.getToggleElement(collapseId);

		if (!toggle || !toggle.classList.contains(this.config.activeClass)) {
			return;
		}

		this.toggleCollapse(collapseId);
	}

	/**
	 * Открытие всех collapses
	 */
	openAll() {
		this.toggleElements.forEach((toggle) => {
			const collapseId = toggle.getAttribute("data-collapse-toggle");
			if (!toggle.classList.contains(this.config.activeClass)) {
				this.open(collapseId);
			}
		});
	}

	/**
	 * Закрытие всех collapses
	 */
	closeAll() {
		this.toggleElements.forEach((toggle) => {
			const collapseId = toggle.getAttribute("data-collapse-toggle");
			if (toggle.classList.contains(this.config.activeClass)) {
				this.close(collapseId);
			}
		});
	}

	/**
	 * Получение текущего состояния collapse
	 */
	getState(collapseId) {
		const toggle = this.getToggleElement(collapseId);
		return toggle
			? toggle.classList.contains(this.config.activeClass)
			: null;
	}

	/**
	 * Обновление элементов (полезно при динамическом добавлении элементов)
	 */
	refresh() {
		this.toggleElements = document.querySelectorAll(
			this.config.toggleSelector,
		);
		this.collapseElements = document.querySelectorAll(
			this.config.collapseSelector,
		);
		this.linkElements = document.querySelectorAll(this.config.linkSelector);

		this.setupEventListeners();
		this.updateCollapseState();
	}

	/**
	 * Уничтожение менеджера (снятие обработчиков)
	 */
	destroy() {
		this.toggleElements.forEach((toggle) => {
			toggle.removeEventListener("click", this.handleToggleClick);
		});

		this.linkElements.forEach((link) => {
			link.removeEventListener("click", this.handleLinkClick);
		});

		window.removeEventListener("resize", this.updateCollapseState);

		this.isInitialized = false;

		console.log("CollapseManager уничтожен");
	}
}
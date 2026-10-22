class Slider {
	constructor(sliderElement) {
		this.slides = sliderElement.querySelector(".slides");
		this.slide = sliderElement.querySelectorAll(".slide");
		this.currentIndex = 0;
		this.orientation = sliderElement.dataset.orientation || "horizontal";
		this.preventClick = false;
		this.allowScroll = false;
		this.startTouchTime = 0;
		this.startX = 0;
		this.startY = 0;
		this.endX = 0;

		// Добавляем флаг для отключения свайпа
		this.swipeEnabled = sliderElement.dataset.swipeEnabled !== "false";

		this.scrollbar = sliderElement.querySelector(".scrollbar");

		if (this.scrollbar) {
			this.scrollbarThumb =
				this.scrollbar.querySelector(".scrollbar-thumb");

			this.initScrollbar();
			this.updateScrollbar();
		}

		if (sliderElement.dataset.thumbnailSlider === "true") {
			const thumbnailSliderId = sliderElement.dataset.thumbnailSliderId;

			this.thumbnailSlider = document.getElementById(thumbnailSliderId);

			if (this.thumbnailSlider) {
				this.thumbnailSlides =
					this.thumbnailSlider.querySelectorAll(".slide");

				this.initThumbnails();
			}
		}

		// Настройки слайдера
		this.autoplay = sliderElement.dataset.autoplay === "true";
		this.autoplayTime =
			parseInt(sliderElement.dataset.autoplayTime) || 5000;
		this.speed = parseInt(sliderElement.dataset.speed, 10) || 300;
		this.gap = parseInt(sliderElement.dataset.gap) || 0;
		this.infinite = sliderElement.dataset.infinite === "true";
		this.autoplayInterval = null;
		this.autoplayTimeout = null;
		this.isAnimating = false;
		this.isMouseDown = false;
		this.isDragging = false;
		this.paginationDots = [];
		this.navigation = sliderElement?.querySelector(".navigation");
		this.isSliderEnabled = true;
		this.showing = this.parseShowing(
			sliderElement.dataset.showing || "1|1|1|1",
		);
		this.breakpoints = this.parseBreakpoints(
			sliderElement.dataset.breakpoints || "[[0,1]]",
		);

		this.slidesToShow = this.getSlidesToShow();
		this.init();
	}

	updateMaskedClass() {
		const maskedElement = this.slides
			.closest(".slider")
			.querySelector(".masked");
		if (!maskedElement) return;

		// Проверяем условия для mobile версии
		const isMobile = window.innerWidth < 768;
		if (isMobile) {
			maskedElement.classList.add("masked-off");
			maskedElement.classList.remove(
				"masked-right",
				"masked-left",
				"masked-x",
			);
			return;
		}

		maskedElement.classList.remove("masked-off");

		const totalSlides = this.slide.length;
		const slidesToShow = this.slidesToShow;

		if (totalSlides <= slidesToShow) {
			maskedElement.classList.remove(
				"masked-right",
				"masked-left",
				"masked-x",
			);
			return;
		}

		maskedElement.classList.remove(
			"masked-right",
			"masked-left",
			"masked-x",
		);

		if (this.currentIndex === 0) {
			maskedElement.classList.add("masked-right");
		} else if (this.currentIndex >= totalSlides - slidesToShow) {
			maskedElement.classList.add("masked-left");
		} else {
			maskedElement.classList.add("masked-x");
		}
	}

	parseBreakpoints(breakpointsString) {
		try {
			// Если строка начинается с [, пробуем парсить как JSON
			if (breakpointsString.startsWith("[")) {
				return JSON.parse(breakpointsString);
			}
			// Fallback для старого формата "4|3|2|1"
			return this.parseLegacyShowing(breakpointsString);
		} catch (e) {
			console.warn("Invalid breakpoints format, using default:", e);
			return [[0, 1]]; // Дефолт: 1 слайд на всех размерах
		}
	}

	parseLegacyShowing(showingString) {
		const slides = showingString.split("|").map(Number);
		// Создаем стандартные брейкпоинты с этими значениями
		return [
			[1200, slides[0] || 4],
			[900, slides[1] || 3],
			[576, slides[2] || 2],
			[0, slides[3] || 1],
		];
	}

	parseShowing(showingString) {
		return showingString.split("|").map(Number);
	}

	getSlidesToShow() {
		const windowWidth = window.innerWidth;

		// Ищем подходящий брейкпоинт (от большего к меньшему)
		for (let i = this.breakpoints.length - 1; i >= 0; i--) {
			const [minWidth, slides] = this.breakpoints[i];
			if (windowWidth >= minWidth) {
				return Math.max(1, slides); // Минимум 1 слайд
			}
		}

		// Если ничего не найдено, берем первый брейкпоинт
		return this.breakpoints[0]?.[1] || 1;
	}

	// Новый метод для получения количества видимых слайдов в превью-слайдере
	getThumbnailSlidesToShow() {
		if (!this.thumbnailSlider) return 1;

		const thumbnailBreakpoints = this.parseBreakpoints(
			this.thumbnailSlider.dataset.breakpoints || "[[0,1]]",
		);

		const windowWidth = window.innerWidth;

		for (let i = thumbnailBreakpoints.length - 1; i >= 0; i--) {
			const [minWidth, slides] = thumbnailBreakpoints[i];
			if (windowWidth >= minWidth) {
				return Math.max(1, slides);
			}
		}

		return thumbnailBreakpoints[0]?.[1] || 1;
	}

	getAllBreakpoints() {
		return this.breakpoints;
	}

	init() {
		this.showSlide(this.currentIndex);
		this.createPaginationDots();
		this.addEventListeners();
		this.updateSlidesWidth();
		this.updateScrollbar();
		this.updateThumbnailPosition();
		this.updateNavVisibility();
		this.updateMaskedClass();

		if (this.autoplay) {
			this.startAutoplay();
		}

		// Обработчик изменения размера окна с дебаунсом
		let resizeTimeout;
		window.addEventListener("resize", () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				const prevSlidesToShow = this.slidesToShow;
				this.slidesToShow = this.getSlidesToShow();
				this.updateMaskedClass();
				this.updateSlidesWidth();
				this.updateScrollbar();
				this.updatePaginationDots();

				if (prevSlidesToShow !== this.slidesToShow) {
					this.updatePagination();
					this.updateNavVisibility();
				}

				this.showSlide(this.currentIndex);
				this.updateThumbnailPosition();
				this.updateNavVisibility();
			}, 150); // Дебаг 150мс
		});
	}

	disableSwipe() {
		this.isSliderEnabled = false;
	}

	enableSwipe() {
		this.isSliderEnabled = true;
	}

	toggleSwipe(enable) {
		this.isSliderEnabled = enable;
	}

	updateNavVisibility() {
		const totalSlides = this.slide.length;
		const prevButton = this.slides
			.closest(".slider")
			.querySelector(".prev");
		const nextButton = this.slides
			.closest(".slider")
			.querySelector(".next");
		const paginationContainer = this.slides
			.closest(".slider")
			.querySelector(".pagination");
		const scrollbar = this.scrollbar;
		const shouldShowControls = totalSlides > this.slidesToShow;

		if (prevButton) {
			prevButton.style.display = this.isSliderEnabled ? "" : "none";
			prevButton.style.display = shouldShowControls ? "" : "none";
			prevButton.setAttribute("aria-label", "Предыдущий слайд");
		}

		if (nextButton) {
			nextButton.style.display = this.isSliderEnabled ? "" : "none";
			nextButton.style.display = shouldShowControls ? "" : "none";
			nextButton.setAttribute("aria-label", "Следующий слайд");
		}

		if (paginationContainer) {
			paginationContainer.style.display = shouldShowControls
				? ""
				: "none";
			paginationContainer.style.display = this.isSliderEnabled
				? ""
				: "none";

			paginationContainer.classList.toggle("hidden", !shouldShowControls);
		}

		if (scrollbar) {
			scrollbar.style.display = shouldShowControls ? "" : "none";
			this.scrollbar.style.display = this.isSliderEnabled ? "" : "none";
		}

		// Отключаем свайп, если слайдов меньше или равно видимым
		this.isSwipeEnabled = totalSlides > this.slidesToShow;

		if (this.navigation) {
			this.navigation.style.display = shouldShowControls ? "" : "none";
			this.navigation.style.display = this.isSwipeEnabled ? "" : "none";
			this.navigation.style.display = this.isSliderEnabled ? "" : "none";

			this.navigation.classList.toggle("hidden", !shouldShowControls);
		}
	}

	initThumbnails() {
		if (!this.thumbnailSlides) return;

		this.thumbnailSlides.forEach((thumbnail, index) => {
			thumbnail.addEventListener("click", () => {
				this.showSlide(index);
			});

			if (index === this.currentIndex) {
				thumbnail.classList.add("active");
			}
		});
	}

	updateThumbnailActiveState() {
		if (!this.thumbnailSlides) return;

		this.thumbnailSlides.forEach((thumbnail, index) => {
			thumbnail.classList.toggle("active", index === this.currentIndex);
		});
	}

	// Измененный метод для смещения превью-слайдера
	updateThumbnailPosition() {
		if (!this.thumbnailSlider || !this.thumbnailSlides) return;

		const isVertical =
			this.thumbnailSlider.dataset.orientation === "vertical";
		const thumbnailsContainer =
			this.thumbnailSlider.querySelector(".slides");
		const totalThumbnails = this.thumbnailSlides.length;

		// Получаем количество видимых слайдов для превью
		const thumbnailSlidesToShow = this.getThumbnailSlidesToShow();

		// Если все миниатюры помещаются в контейнере, не смещаем
		if (totalThumbnails <= thumbnailSlidesToShow) {
			thumbnailsContainer.style.transform = isVertical
				? `translateY(0px)`
				: `translateX(0px)`;
			return;
		}

		const thumbnailSize = isVertical
			? this.thumbnailSlides[0].clientHeight
			: this.thumbnailSlides[0].clientWidth;

		// Используем gap из превью-слайдера
		const thumbnailGap =
			parseInt(this.thumbnailSlider.dataset.gap, 10) || 0;

		// Вычисляем смещение, чтобы активный слайд был видимым
		let offset = 0;

		if (this.currentIndex >= thumbnailSlidesToShow - 1) {
			// Смещаем так, чтобы активный слайд был видимым
			if (this.currentIndex > totalThumbnails - thumbnailSlidesToShow) {
				// Если приближаемся к концу, показываем последние слайды
				offset =
					(totalThumbnails - thumbnailSlidesToShow) *
					(thumbnailSize + thumbnailGap);
			} else {
				// Смещаем так, чтобы активный слайд был в видимой области
				offset =
					(this.currentIndex - thumbnailSlidesToShow + 2) *
					(thumbnailSize + thumbnailGap);
			}
		}

		// Ограничиваем смещение
		const maxOffset =
			(totalThumbnails - thumbnailSlidesToShow) *
			(thumbnailSize + thumbnailGap);
		offset = Math.max(0, Math.min(offset, maxOffset));

		// Применяем трансформацию
		thumbnailsContainer.style.transform = isVertical
			? `translateY(-${offset}px)`
			: `translateX(-${offset}px)`;
	}

	moveThumbnailToStart(index) {
		if (this.isAnimating) return;

		const totalSlides = this.thumbnailSlides.length;
		const maxIndex = totalSlides - 1;
		const isVertical =
			this.thumbnailSlider.dataset.orientation === "vertical";

		// Ограничиваем индекс
		this.currentIndex = Math.max(0, Math.min(index, maxIndex));
		this.isAnimating = true;

		// Обновляем активную миниатюру
		this.thumbnailSlides.forEach((thumbnail, i) => {
			thumbnail.classList.toggle("active", i === this.currentIndex);
		});

		const thumbnailsContainer =
			this.thumbnailSlider.querySelector(".slides");
		const thumbnailSize = isVertical
			? this.thumbnailSlides[0].clientHeight
			: this.thumbnailSlides[0].clientWidth;
		const gap = this.gap;

		const visibleThumbnails = this.getThumbnailSlidesToShow();
		const totalThumbnails = this.thumbnailSlides.length;

		// Вычисляем смещение
		let offset = this.currentIndex * (thumbnailSize + gap);
		const maxOffset =
			(totalThumbnails - visibleThumbnails) * (thumbnailSize + gap);

		// Корректируем смещение для граничных случаев
		if (this.currentIndex >= totalThumbnails - visibleThumbnails + 1) {
			offset = maxOffset;
		} else if (this.currentIndex < visibleThumbnails) {
			offset = 0;
		}

		// Применяем трансформацию в зависимости от ориентации
		thumbnailsContainer.style.transform = isVertical
			? `translateY(-${offset}px)`
			: `translateX(-${offset}px)`;

		setTimeout(() => {
			this.isAnimating = false;
		}, this.speed);
	}

	updateSlidesWidth() {
		const totalSlides = this.slide.length;

		if (this.orientation === "horizontal") {
			const slideWidth =
				(this.slides.getBoundingClientRect().width -
					this.gap * (this.slidesToShow - 1)) /
				this.slidesToShow;

			this.slide.forEach((slide) => {
				slide.style.maxWidth = `${slideWidth}px`;
				slide.style.height = "auto";
				slide.tabIndex = "-1";
			});
		} else {
			// Вертикальная ориентация
			const slideHeight =
				(this.slides.getBoundingClientRect().height -
					this.gap * (this.slidesToShow - 1)) /
				this.slidesToShow;

			this.slide.forEach((slide) => {
				slide.style.maxWidth = "100%";
				slide.style.height = `${slideHeight}px`;
				slide.tabIndex = "-1";
			});
		}

		this.slides.style.setProperty(
			"--slides-to-show",
			`${this.getSlidesToShow()}`,
		);
		this.slides.style.setProperty("--slides-total", `${totalSlides}`);
		this.gap
			? this.slides.style.setProperty("--slides-gap", `${this.gap}px`)
			: this.slides.style.setProperty("--slides-gap", `0px`);
	}

	updatePagination() {
		// Удаляем старые точки
		const paginationContainer = this.slides
			.closest(".slider")
			.querySelector(".pagination");
		if (paginationContainer) {
			paginationContainer.innerHTML = "";
			this.paginationDots = [];
		}

		// Создаем новые точки с учетом текущего количества видимых слайдов
		this.createPaginationDots();

		// Обновляем активную точку
		this.updatePaginationDots();
	}

	createPaginationDots() {
		const paginationContainer = this.slides
			.closest(".slider")
			.querySelector(".pagination");
		if (paginationContainer) {
			// Очищаем существующие точки
			paginationContainer.innerHTML = "";
			this.paginationDots = [];

			// Вычисляем количество точек пагинации
			const totalSlides = this.slide.length;
			const dotsCount = Math.max(1, totalSlides - this.slidesToShow + 1);

			for (let i = 0; i < dotsCount; i++) {
				const dot = document.createElement("div");
				dot.classList.add("pagination-dot");
				// При клике переходим к соответствующему слайду
				dot.addEventListener("click", () => {
					if (this.isAnimating) return;
					this.showSlide(i);
				});
				paginationContainer.appendChild(dot);
				this.paginationDots.push(dot);
			}
			this.updatePaginationDots();
		}
	}

	updatePaginationDots() {
		if (this.paginationDots && this.paginationDots.length > 0) {
			// Вычисляем активную точку с учетом количества видимых слайдов
			const activeDotIndex = Math.min(
				Math.floor(this.currentIndex),
				this.paginationDots.length - 1,
			);

			this.paginationDots.forEach((dot, index) => {
				dot.classList.toggle("active", index === activeDotIndex);
				dot.setAttribute("role", "button");
				dot.setAttribute("aria-label", `Перейти к слайду ${index + 1}`);

				const isActive = index === activeDotIndex;

				if (isActive) {
					dot.setAttribute("aria-current", "page");
				} else {
					dot.removeAttribute("aria-current");
				}
			});
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
			this.scrollbarThumb.style.width = "0"; // Скрываем скроллбар

			return;
		}

		// Вычисляем ширину скроллбара
		const scrollbarWidth = (visibleWidth / totalWidth) * visibleWidth;

		this.scrollbarThumb.style.width = `${scrollbarWidth}px`;

		// Вычисляем позицию скроллбара
		const scrollbarPosition =
			this.currentIndex *
			(slideWidth + gap) *
			(visibleWidth / totalWidth);

		// Ограничиваем позицию скроллбара, чтобы он не выходил за пределы
		const maxScrollbarPosition = visibleWidth - scrollbarWidth;

		this.scrollbarThumb.style.transform = `translateX(${Math.max(
			0,
			Math.min(
				Math.ceil(scrollbarPosition),
				Math.ceil(maxScrollbarPosition),
			),
		)}px)`;
	}

	showSlide(index) {
		if (this.isAnimating) {
			console.log("Animation in progress, skipping");
			return this.currentIndex;
		}

		this.isAnimating = true;
		// Останавливаем любые активные взаимодействия
		this.isMouseDown = false;
		this.isDragging = false;

		const totalSlides = this.slide.length;
		const maxIndex = totalSlides - this.slidesToShow;

		// Логика для ограничения индекса
		if (this.infinite) {
			if (index < 0) {
				this.currentIndex = totalSlides - this.slidesToShow;
			} else if (index > maxIndex) {
				this.currentIndex = 0;
			} else {
				this.currentIndex = index;
			}
		} else {
			this.currentIndex = Math.max(0, Math.min(index, maxIndex));
		}

		this.isAnimating = true;
		this.slides.style.transition = `transform ${this.speed}ms ease`;

		if (this.orientation === "horizontal") {
			const slideWidth =
				(this.slides.getBoundingClientRect().width -
					this.gap * (this.slidesToShow - 1)) /
				this.slidesToShow;
			const offset =
				this.currentIndex * slideWidth + this.currentIndex * this.gap;
			this.slides.style.transform = `translateX(-${offset}px)`;
		} else {
			// Вертикальная ориентация
			const slideHeight =
				(this.slides.getBoundingClientRect().height -
					this.gap * (this.slidesToShow - 1)) /
				this.slidesToShow;
			const offset =
				this.currentIndex * slideHeight + this.currentIndex * this.gap;
			this.slides.style.transform = `translateY(-${offset}px)`;
		}

		// Обновляем активный слайд в миниатюрах
		if (this.thumbnailSlides) {
			this.updateThumbnailActiveState();
			this.updateThumbnailPosition(); // Обновляем позицию превью
		}

		this.onSlideChange(Math.ceil(this.currentIndex));
		this.updatePaginationDots();
		this.updateNavigationButtons();

		this.stopAutoplay();
		this.updateScrollbar();

		this.updateMaskedClass();

		setTimeout(() => {
			this.isAnimating = false;
			this.updatePaginationDots();
			this.resetAutoplay();
		}, this.speed);

		return this.currentIndex;
	}

	updateNavigationButtons() {
		const prevButton = this.slides
			.closest(".slider")
			.querySelector(".prev");
		const nextButton = this.slides
			.closest(".slider")
			.querySelector(".next");
		const totalSlides = this.slide.length;
		const maxIndex = totalSlides - this.slidesToShow;

		if (prevButton) {
			prevButton.setAttribute("aria-label", "Предыдущий слайд");
			prevButton.setAttribute("role", "button");

			if (!this.infinite) {
				const isDisabled = this.currentIndex === 0;
				prevButton.classList.toggle("disabled", isDisabled);
				prevButton.setAttribute("aria-disabled", isDisabled);

				// Для автопрокрутки - временно включаем кнопку, если она отключена
				if (this.autoplay && isDisabled) {
					prevButton.classList.remove("disabled");
					prevButton.setAttribute("aria-disabled", false);
				}
			} else {
				prevButton.classList.remove("disabled");
				prevButton.setAttribute("aria-disabled", false);
			}
		}

		if (nextButton) {
			nextButton.setAttribute("aria-label", "Следующий слайд");
			nextButton.setAttribute("role", "button");

			if (!this.infinite) {
				const isDisabled = this.currentIndex >= maxIndex;
				nextButton.classList.toggle("disabled", isDisabled);
				nextButton.setAttribute("aria-disabled", isDisabled);

				// Для автопрокрутки - временно включаем кнопку, если она отключена
				if (this.autoplay && isDisabled) {
					nextButton.classList.remove("disabled");
					nextButton.setAttribute("aria-disabled", false);
				}
			} else {
				nextButton.classList.remove("disabled");
				nextButton.setAttribute("aria-disabled", false);
			}
		}

		// Если включен autoplay, обновляем кнопки после завершения анимации
		if (this.autoplay && this.isAnimating) {
			setTimeout(() => this.updateNavigationButtons(), this.speed);
		}
	}

	// Возвращает индекс текущего слайда (начиная с 0)
	getCurrentIndex() {
		return this.currentIndex;
	}

	// Возвращает индекс слайда по его DOM-элементу
	getSlideIndex(slideElement) {
		return Array.from(this.slide).indexOf(slideElement);
	}

	// Возвращает массив индексов текущих видимых слайдов
	getVisibleSlidesIndexes() {
		const indexes = [];
		const totalSlides = this.slide.length;

		for (let i = 0; i < this.slidesToShow; i++) {
			const index = (this.currentIndex + i) % totalSlides;
			indexes.push(index);
		}

		return indexes;
	}

	// Возвращает DOM-элемент слайда по индексу
	getSlideByIndex(index) {
		if (index >= 0 && index < this.slide.length) {
			return this.slide[index];
		}
		return null;
	}

	onSlideChange(index) {
		const event = new CustomEvent("slideChange", {
			detail: {
				index,
			},
		});
		this.slides.dispatchEvent(event);
	}

	addEventListeners() {
		const handleSwipe = (direction) => {
			this.stopAutoplay();
			this.showSlide(this.currentIndex + direction);
		};

		this.slides.addEventListener("click", (event) => {
			this.disableInteraction(event);
		});

		this.slide.forEach((slide) => {
			slide.addEventListener("click", (e) => {
				if (this.isDragging || this.preventClick) {
					e.preventDefault();
					e.stopPropagation();
				}
			});
		});

		// Добавляем проверку на включение свайпа
		if (this.swipeEnabled) {
			// Mouse events
			this.slides.addEventListener("mousedown", (event) => {
				// Игнорируем правую кнопку мыши
				if (event.button !== 0) return;

				this.startSwipe(event);
				setTimeout(() => {
					this.slides.classList.remove("isDragging");
				}, 500);
				event.preventDefault();

				document.addEventListener("mousemove", this.handleMouseMove);
				document.addEventListener("mouseup", this.handleMouseUp);
			});

			// Touch events
			this.slides.addEventListener("touchstart", (event) => {
				this.startSwipe(event);

				document.addEventListener("touchmove", this.handleTouchMove, {
					passive: false,
				});
				document.addEventListener("touchend", this.handleTouchEnd);
			});
		}

		const prevButton = this.slides
			.closest(".slider")
			.querySelector(".prev");
		const nextButton = this.slides
			.closest(".slider")
			.querySelector(".next");

		if (prevButton) {
			prevButton.addEventListener("click", () => {
				if (this.isAnimating) return;
				this.stopAutoplay();
				handleSwipe(-1);
			});
		}

		if (nextButton) {
			nextButton.addEventListener("click", () => {
				if (this.isAnimating) return;
				this.stopAutoplay();
				handleSwipe(1);
			});
		}
	}

	startSwipe(startEvent) {
		if (this.isAnimating || !this.swipeEnabled) return;

		this.isMouseDown = true;
		this.allowScroll = false;
		this.startTouchTime = Date.now();

		// Получаем координаты в зависимости от типа события
		if (startEvent.type === "touchstart") {
			this.startX = startEvent.touches[0].clientX;
			this.startY = startEvent.touches[0].clientY;
		} else {
			this.startX = startEvent.clientX;
			this.startY = startEvent.clientY;
		}

		this.isDragging = false;
		this.slides.style.transition = "none";
	}

	disableInteraction(event) {
		if (this.isDragging) {
			event.preventDefault();
			event.stopPropagation();

			// Если это клик после перетаскивания - блокируем
			if (this.preventClick) {
				event.preventDefault();
				event.stopImmediatePropagation();
				return false;
			}

			let target = event.target;
			while (target && target !== this.slides) {
				if (
					target.tagName === "A" ||
					target.tagName === "BUTTON" ||
					target.onclick
				) {
					target.style.pointerEvents = "none";
					setTimeout(() => {
						target.style.pointerEvents = "";
					}, 100);
					break;
				}
				target = target.parentElement;
			}
		}
	}

	handleMouseMove = (event) => {
		if (!this.isMouseDown || !this.isSwipeEnabled || !this.swipeEnabled)
			return;
		this.handleMove(event.clientX, event.clientY);
	};

	handleTouchMove = (event) => {
		if (!this.isMouseDown || !this.isSwipeEnabled || !this.swipeEnabled)
			return;

		const touch = event.touches[0];
		const diffX = Math.abs(touch.clientX - this.startX);
		const diffY = Math.abs(touch.clientY - this.startY);

		// Если вертикальное движение преобладает - разрешаем скролл
		if (diffY > diffX && diffY > 10) {
			this.allowScroll = true;
			this.resetDragState();
			return;
		}

		// Если горизонтальное движение - блокируем скролл и обрабатываем свайп
		if (diffX > 10) {
			event.preventDefault();
			this.handleMove(touch.clientX, touch.clientY);
		}
	};

	// Общий метод для обработки перемещения
	handleMove(clientX, clientY) {
		this.isDragging = true;
		this.slides.classList.add("isDragging");

		const endX = clientX;
		const endY = clientY;
		this.distanceX = endX - this.startX;
		this.distanceY = endY - this.startY;

		if (this.orientation === "horizontal") {
			const slideWidth =
				(this.slides.getBoundingClientRect().width -
					this.gap * (this.slidesToShow - 1)) /
				this.slidesToShow;
			const offset =
				this.currentIndex * slideWidth + this.currentIndex * this.gap;

			if (this.slides.closest(".slider").dataset.slideOnce === "true") {
				const maxDistance = slideWidth * 0.25;
				this.distanceX = Math.max(
					-maxDistance,
					Math.min(this.distanceX, maxDistance),
				);
			}

			this.slides.style.transform = `translateX(-${offset - this.distanceX}px)`;
		} else {
			const slideHeight =
				(this.slides.getBoundingClientRect().height -
					this.gap * (this.slidesToShow - 1)) /
				this.slidesToShow;
			const offset =
				this.currentIndex * slideHeight + this.currentIndex * this.gap;

			if (this.slides.closest(".slider").dataset.slideOnce === "true") {
				const maxDistance = slideHeight * 0.25;
				this.distanceY = Math.max(
					-maxDistance,
					Math.min(this.distanceY, maxDistance),
				);
			}

			this.slides.style.transform = `translateY(-${offset - this.distanceY}px)`;
		}
	}

	handleMouseUp = (event) => {
		if (!this.isMouseDown || !this.isSwipeEnabled || !this.swipeEnabled)
			return;

		if (this.isDragging) {
			this.preventClick = true;
			setTimeout(() => {
				this.preventClick = false;
			}, 100);
		}

		this.handleEnd();
		document.removeEventListener("mousemove", this.handleMouseMove);
		document.removeEventListener("mouseup", this.handleMouseUp);
	};

	handleTouchEnd = (event) => {
		// Если был скролл - не обрабатываем как свайп
		if (this.allowScroll) {
			this.allowScroll = false;
			return;
		}

		this.handleEnd();
		document.removeEventListener("touchend", this.handleTouchEnd);
	};

	handleEnd() {
		const isTap = Date.now() - this.startTouchTime < 300;

		if (isTap && !this.isDragging) {
			this.resetDragState();
			return;
		}

		this.isMouseDown = false;
		this.slides.style.transition = `transform ${this.speed}ms ease`;

		// Определяем минимальное расстояние для срабатывания свайпа
		const minSwipeDistance = 10;
		const isHorizontalSwipe =
			Math.abs(this.distanceX) > minSwipeDistance &&
			Math.abs(this.distanceX) > Math.abs(this.distanceY);
		const isVerticalSwipe =
			Math.abs(this.distanceY) > minSwipeDistance &&
			Math.abs(this.distanceY) > Math.abs(this.distanceX);

		// Если перемещение слишком маленькое - это клик, игнорируем
		if (!isHorizontalSwipe && !isVerticalSwipe) {
			this.resetDragState();
			return;
		}

		let slidesMoved;

		if (this.orientation === "vertical") {
			const slideHeight =
				(this.slides.getBoundingClientRect().height -
					this.gap * (this.slidesToShow - 1)) /
				this.slidesToShow;

			// Если расстояние меньше минимального, но все равно срабатывает анимация
			if (Math.abs(this.distanceY) < minSwipeDistance) {
				slidesMoved = this.distanceY > 0 ? 1 : -1; // Перемещаем на один слайд
			} else {
				slidesMoved = Math.round(this.distanceY / (slideHeight / 2));
			}
		} else {
			const slideWidth =
				(this.slides.getBoundingClientRect().width -
					this.gap * (this.slidesToShow - 1)) /
				this.slidesToShow;

			// Если расстояние меньше минимального, но все равно срабатывает анимация
			if (Math.abs(this.distanceX) < minSwipeDistance) {
				slidesMoved = this.distanceX > 0 ? 1 : -1; // Перемещаем на один слайд
			} else {
				slidesMoved = Math.round(this.distanceX / (slideWidth / 2));
			}
		}

		let newIndex = this.currentIndex - slidesMoved;
		const totalSlides = this.slide.length;
		const maxIndex = totalSlides - this.slidesToShow;

		if (this.infinite) {
			if (newIndex < 0) {
				newIndex = totalSlides - this.slidesToShow;
			} else if (newIndex > maxIndex) {
				newIndex = 0;
			}
		} else {
			newIndex = Math.max(0, Math.min(newIndex, maxIndex));
		}

		// Сбрасываем состояние перемещения перед анимацией
		this.resetDragState();

		// Диспатчим кастомное событие о начале перемещения
		this.slides.dispatchEvent(
			new CustomEvent("sliderMoveStart", {
				bubbles: true,
				detail: { fromIndex: this.currentIndex, toIndex: newIndex },
			}),
		);

		this.showSlide(newIndex);

		// Диспатчим событие о завершении перемещения после анимации
		setTimeout(() => {
			this.slides.dispatchEvent(
				new CustomEvent("sliderMoveEnd", {
					bubbles: true,
					detail: { currentIndex: this.currentIndex },
				}),
			);
		}, this.speed);
	}

	resetDragState() {
		this.isMouseDown = false;
		this.isDragging = false;
		this.distanceX = 0;
		this.distanceY = 0;
		this.slides.classList.remove("isDragging");
		this.slides.style.transition = "";
	}

	startAutoplay() {
		this.autoplayInterval = setInterval(() => {
			this.showSlide(
				this.currentIndex +
				(this.slides.closest(".slider").dataset.slideOnce === "true"
					? 1
					: 1),
			);
		}, this.speed + this.autoplayTime);
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
		}, this.autoplayTime);
	}
}

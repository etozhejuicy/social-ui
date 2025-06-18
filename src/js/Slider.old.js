// slider logic
class Slider {
  constructor(sliderElement) {
    this.slides = sliderElement.querySelector('.slides');
    this.slide = sliderElement.querySelectorAll('.slide');
    this.currentIndex = 0;
    this.orientation = sliderElement.dataset.orientation || 'horizontal';

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
    const isVertical = this.thumbnailSlider.dataset.orientation === 'vertical';

    // Ограничиваем индекс
    this.currentIndex = Math.max(0, Math.min(index, maxIndex));
    this.isAnimating = true;

    // Обновляем активную миниатюру
    this.thumbnailSlides.forEach((thumbnail, i) => {
      thumbnail.classList.toggle('active', i === this.currentIndex);
    });

    const thumbnailsContainer = this.thumbnailSlider.querySelector('.slides');
    const thumbnailSize = isVertical
      ? this.thumbnailSlides[0].clientHeight
      : this.thumbnailSlides[0].clientWidth;
    const gap = this.gap;

    const visibleThumbnails = this.getSlidesToShow(this.thumbnailSlider);
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

  updateThumbnailPosition() {
    if (!this.thumbnailSlider) return;

    const isVertical = this.thumbnailSlider.dataset.orientation === 'vertical';
    const thumbnailsContainer = this.thumbnailSlider.querySelector('.slides');
    const totalThumbnails = this.thumbnailSlides.length;
    const thumbnailSize = isVertical
      ? this.thumbnailSlides[0].clientHeight
      : this.thumbnailSlides[0].clientWidth;
    const gap = parseInt(this.thumbnailSlider.dataset.gap, 10);
    const visibleThumbnails = parseInt(
      this.thumbnailSlider.dataset.showing,
      10
    );

    let offset = this.currentIndex * (thumbnailSize + gap);
    const maxOffset =
      (totalThumbnails - visibleThumbnails) * (thumbnailSize + gap);

    // Корректировка смещения
    if (this.currentIndex > totalThumbnails - visibleThumbnails) {
      offset = maxOffset;
    } else if (this.currentIndex < 0) {
      offset = 0;
    }

    // Применяем трансформацию
    thumbnailsContainer.style.transform = isVertical
      ? `translateY(-${Math.max(0, Math.min(offset, maxOffset))}px)`
      : `translateX(-${Math.max(0, Math.min(offset, maxOffset))}px)`;
  }

  updateSlidesWidth() {
    const totalSlides = this.slide.length;

    if (this.orientation === 'horizontal') {
      const slideWidth =
        (this.slides.getBoundingClientRect().width -
          this.gap * (this.slidesToShow - 1)) /
        this.slidesToShow;

      this.slide.forEach((slide) => {
        slide.style.maxWidth = `${slideWidth}px`;
        slide.style.height = 'auto';
        slide.tabIndex = '-1';
      });
    } else {
      // Вертикальная ориентация
      const slideHeight =
        (this.slides.getBoundingClientRect().height -
          this.gap * (this.slidesToShow - 1)) /
        this.slidesToShow;

      this.slide.forEach((slide) => {
        slide.style.maxWidth = '100%';
        slide.style.height = `${slideHeight}px`;
        slide.tabIndex = '-1';
      });
    }

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

    if (this.orientation === 'horizontal') {
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
      this.updateThumbnailPosition();
    }

    this.onSlideChange(Math.ceil(this.currentIndex));
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
      prevButton.setAttribute('aria-label', 'Предыдущий слайд');
      prevButton.setAttribute('role', 'button');

      if (!this.infinite) {
        if (this.currentIndex === 0) {
          prevButton.classList.add('disabled');
          prevButton.setAttribute('aria-disabled', true);
        } else {
          prevButton.classList.remove('disabled');
          prevButton.setAttribute('aria-disabled', false);
        }
      }
    }

    if (nextButton) {
      const totalSlides = this.slide.length;
      const maxIndex = totalSlides - this.slidesToShow;

      nextButton.setAttribute('aria-label', 'Следующий слайд');
      nextButton.setAttribute('role', 'button');

      if (!this.infinite) {
        if (this.currentIndex >= maxIndex) {
          nextButton.classList.add('disabled');
          nextButton.setAttribute('aria-disabled', true);
        } else {
          nextButton.classList.remove('disabled');
          nextButton.setAttribute('aria-disabled', false);
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
      this.stopAutoplay();
      this.showSlide(this.currentIndex + direction);
    };

    this.slides.addEventListener('click', (event) => {
      this.disableInteraction(event);
    });

    // Mouse events
    this.slides.addEventListener('mousedown', (event) => {
      // Игнорируем правую кнопку мыши
      if (event.button !== 0) return;

      this.startSwipe(event);
      setTimeout(() => {
        this.slides.classList.remove('isDragging');
      }, 500);
      event.preventDefault();

      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
    });

    // Touch events
    this.slides.addEventListener('touchstart', (event) => {
      this.startSwipe(event);
      event.preventDefault();

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

  startSwipe(startEvent) {
    this.isMouseDown = true;

    // Получаем координаты в зависимости от типа события
    if (startEvent.type === 'touchstart') {
      this.startX = startEvent.touches[0].clientX;
      this.startY = startEvent.touches[0].clientY;
    } else {
      this.startX = startEvent.clientX;
      this.startY = startEvent.clientY;
    }

    this.isDragging = false;
    this.slides.style.transition = 'none';
  }

  disableInteraction(event) {
    if (this.isDragging) {
      event.preventDefault();
      event.stopPropagation();
      this.slides.classList.add('isDragging');

      let target = event.target;
      while (target && target !== this.slides) {
        if (
          target.tagName === 'A' ||
          target.hasAttribute('href') ||
          target.hasAttribute('onclick') ||
          target.onclick
        ) {
          event.preventDefault();
          target.style.pointerEvents = 'none';
          setTimeout(() => {
            target.style.pointerEvents = '';
          }, 100);
          break;
        }
        target = target.parentElement;
      }
    }
  }

  handleMouseMove = (event) => {
    if (!this.isMouseDown || !this.isSwipeEnabled) return;
    this.handleMove(event.clientX, event.clientY);
  };

  handleTouchMove = (event) => {
    if (!this.isMouseDown || !this.isSwipeEnabled) return;
    this.handleMove(event.touches[0].clientX, event.touches[0].clientY);
    event.preventDefault();
  };

  // Общий метод для обработки перемещения
  handleMove(clientX, clientY) {
    this.isDragging = true;
    this.slides.classList.add('isDragging');

    const endX = clientX;
    const endY = clientY;
    this.distanceX = endX - this.startX;
    this.distanceY = endY - this.startY;

    if (this.orientation === 'horizontal') {
      const slideWidth =
        (this.slides.getBoundingClientRect().width -
          this.gap * (this.slidesToShow - 1)) /
        this.slidesToShow;
      const offset =
        this.currentIndex * slideWidth + this.currentIndex * this.gap;

      if (this.slides.parentElement.dataset.slideOnce === 'true') {
        const maxDistance = slideWidth * 0.25;
        this.distanceX = Math.max(
          -maxDistance,
          Math.min(this.distanceX, maxDistance)
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

      if (this.slides.parentElement.dataset.slideOnce === 'true') {
        const maxDistance = slideHeight * 0.25;
        this.distanceY = Math.max(
          -maxDistance,
          Math.min(this.distanceY, maxDistance)
        );
      }

      this.slides.style.transform = `translateY(-${offset - this.distanceY}px)`;
    }
  }

  handleMouseUp = (event) => {
    if (!this.isMouseDown || !this.isSwipeEnabled) return;
    this.handleEnd();
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  };

  handleTouchEnd = (event) => {
    this.handleEnd();
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
  };

  handleEnd() {
    this.isMouseDown = false;
    this.slides.style.transition = `transform ${this.speed}ms ease`;

    // Определяем минимальное расстояние для срабатывания свайпа (10px)
    const minSwipeDistance = 25;
    const isHorizontalSwipe = Math.abs(this.distanceX) > minSwipeDistance;
    const isVerticalSwipe = Math.abs(this.distanceY) > minSwipeDistance;

    // Если перемещение слишком маленькое - это клик, игнорируем
    if (!isHorizontalSwipe && !isVerticalSwipe) {
      this.resetDragState();
      return;
    }

    let slidesMoved;

    if (this.orientation === 'horizontal') {
      const slideWidth =
        (this.slides.getBoundingClientRect().width -
          this.gap * (this.slidesToShow - 1)) /
        this.slidesToShow;

      if (this.slides.parentElement.dataset.slideOnce === 'true') {
        slidesMoved = this.distanceX > 0 ? 1 : -1;
      } else {
        slidesMoved = Math.round(this.distanceX / slideWidth);
      }
    } else {
      const slideHeight =
        (this.slides.getBoundingClientRect().height -
          this.gap * (this.slidesToShow - 1)) /
        this.slidesToShow;

      if (this.slides.parentElement.dataset.slideOnce === 'true') {
        slidesMoved = this.distanceY > 0 ? 1 : -1;
      } else {
        slidesMoved = Math.round(this.distanceY / slideHeight);
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
      new CustomEvent('sliderMoveStart', {
        bubbles: true,
        detail: { fromIndex: this.currentIndex, toIndex: newIndex },
      })
    );

    this.showSlide(newIndex);

    // Диспатчим событие о завершении перемещения после анимации
    setTimeout(() => {
      this.slides.dispatchEvent(
        new CustomEvent('sliderMoveEnd', {
          bubbles: true,
          detail: { currentIndex: this.currentIndex },
        })
      );
    }, this.speed);
  }

  resetDragState() {
    this.isMouseDown = false;
    this.isDragging = false;
    this.distanceX = 0;
    this.distanceY = 0;
    this.slides.classList.remove('isDragging');
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

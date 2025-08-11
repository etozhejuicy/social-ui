const stepBlocks = document.querySelectorAll('.step');

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
        tab.classList.remove('active');
        tab.classList.toggle('process', index === currentStepIndex);

        setTimeout(() => {
          tab.classList.remove('process');
          tab.classList.toggle('active', index === currentStepIndex);
        }, 250);

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
        tab.classList.remove('process');
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

class Validate {
	constructor(formElement) {
		this.form = formElement;

		if (!this.form) {
			console.warn("Элемент формы не найден");
			return;
		}

		this.submitButton = this.form.querySelector('button[type="submit"]');
		this.resetButtons = this.form.querySelectorAll('button[type="reset"]');

		// Поведение отправки задаётся самой формой и не влияет на правила валидации.
		this.options = {
			ajax: this.form.hasAttribute("data-form-ajax"),
			successModal: this.form.dataset.successModal || null,
			resetOnSuccess: this.form.hasAttribute("data-reset-on-success"),
			closeModalOnSuccess: this.form.hasAttribute(
				"data-close-modal-on-success",
			),
		};

		// Используем уже созданный глобальный экземпляр Modal,
		// чтобы каждая форма не регистрировала свои глобальные обработчики.
		this.modal = window.modal || null;

		// Success-модалка создаётся только для тех форм, которые её запрашивают.
		if (this.options.successModal && this.modal) {
			this.modal.create({
				id: this.options.successModal,
				title: "",
				content: `<p class="text-center">${this.form.dataset.successMessage ||
					"Ваша заявка успешно отправлена!"
					}</p>`,
				className: "modal-notify",
				showImmediately: false,
			});
		}

		this.setupEvents();
	}

	setupEvents() {
		// Отслеживаем изменения полей для активации/деактивации кнопки (если нужно)
		this.form.addEventListener("change", () => this.checkFormFilled());

		const inputs = this.form.querySelectorAll("input, textarea, select");
		inputs.forEach((input) => {
			input.addEventListener("input", () => this.checkFormFilled());
			input.addEventListener("change", () => this.checkFormFilled());
		});

		// Ограничиваем ввод телефона только на keydown.
		// События input/change не содержат e.key и не подходят для этой проверки.
		this.getPhoneInputs().forEach((input) => {
			input.addEventListener("keydown", (e) => this.validPhoneNumbers(e));
		});

		// Сброс состояния валидации после reset формы
		this.form.addEventListener("reset", () => {
			setTimeout(() => {
				this.resetValidationStyles();
				this.checkFormFilled();
			}, 0);
		});

		// Инициализация валидации полей
		this.initFieldValidation();

		// Основной обработчик отправки
		this.form.addEventListener("submit", (e) => this.handleSubmit(e));
	}

	getPhoneInputs() {
		return Array.from(
			this.form.querySelectorAll(
				'[data-input-phone], input[type="tel"], input[name*="tel"]',
			),
		);
	}

	getEmailInputs() {
		return Array.from(
			this.form.querySelectorAll(
				'input[type="email"], [data-input-email], input[name*="email"]',
			),
		);
	}

	getRequiredTextInputs() {
		const phoneSelector =
			'[data-input-phone], input[type="tel"], input[name*="tel"]';
		const emailSelector =
			'input[type="email"], [data-input-email], input[name*="email"]';

		return Array.from(
			this.form.querySelectorAll(
				'input[type="text"][required], input:not([type])[required], textarea[required]',
			),
		).filter(
			(input) =>
				!input.matches(phoneSelector) && !input.matches(emailSelector),
		);
	}

	isFieldAvailable(input) {
		return Boolean(
			input && !input.disabled && input.getClientRects().length > 0,
		);
	}

	// Инициализация валидации на инпутах (без обработчика submit)
	initFieldValidation() {
		const events = ["input", "blur"];

		this.getRequiredTextInputs().forEach((input) => {
			events.forEach((event) => {
				input.addEventListener(event, () => this.validateRequired(input));
			});
		});

		this.getPhoneInputs().forEach((input) => {
			events.forEach((event) => {
				input.addEventListener(event, () => this.validatePhone(input));
			});
		});

		this.getEmailInputs().forEach((input) => {
			events.forEach((event) => {
				input.addEventListener(event, () => this.validateEmail(input));
			});
		});
	}

	// Проверка всей формы перед отправкой
	validateForm() {
		let isValid = true;

		// Проверяем все обязательные простые текстовые поля
		this.getRequiredTextInputs().forEach((input) => {
			if (!this.isFieldAvailable(input)) return;

			if (!this.isRequiredValid(input)) {
				this.markInvalid(input, "Пожалуйста, заполните это поле");
				isValid = false;
			} else {
				this.markValid(input);
			}
		});

		// Проверяем все телефонные поля.
		// Пустое необязательное поле допустимо, required — обязательно.
		this.getPhoneInputs().forEach((input) => {
			if (!this.isFieldAvailable(input)) return;

			if (!this.isPhoneValid(input)) {
				const message =
					input.value.trim() === ""
						? "Пожалуйста, введите номер телефона"
						: "Пожалуйста, введите корректный номер телефона";
				this.markInvalid(input, message);
				isValid = false;
			} else {
				this.markValid(input);
			}
		});

		// Проверяем все email-поля с учётом required
		this.getEmailInputs().forEach((input) => {
			if (!this.isFieldAvailable(input)) return;

			if (!this.isEmailValid(input)) {
				const message =
					input.value.trim() === ""
						? "Пожалуйста, заполните это поле"
						: "Пожалуйста, введите корректный email";
				this.markInvalid(input, message);
				isValid = false;
			} else {
				this.markValid(input);
			}
		});

		return isValid;
	}

	// Вспомогательные методы для подсветки
	markInvalid(input, message) {
		input.setCustomValidity(message);
		input.style.borderColor = "var(--error)";
		input.reportValidity();
	}

	markValid(input) {
		input.setCustomValidity("");
		input.style.borderColor = "";
	}

	// Методы валидации (перенесены из checkValidForms)
	isEmailValid(input) {
		if (!input) return true;
		const value = input.value.trim();
		if (value === "") return !input.required;
		if (value.length < 6) return false;
		if (!value.includes("@")) return false;
		const atIndex = value.indexOf("@");
		if (atIndex === 0 || atIndex === value.length - 1) return false;
		const localPart = value.substring(0, atIndex);
		const forbiddenChars = ["!", "#", "$", "%", "&", "~"];
		for (let char of forbiddenChars) {
			if (localPart.includes(char)) return false;
		}
		const afterAt = value.substring(atIndex + 1);
		if (!afterAt.includes(".")) return false;
		const lastDotIndex = value.lastIndexOf(".");
		if (lastDotIndex > value.length - 3) return false;
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		return emailRegex.test(value);
	}

	validateEmail(input) {
		if (this.isEmailValid(input)) {
			input.setCustomValidity("");
			input.style.borderColor = "";
			return;
		}

		const message =
			input.value.trim() === ""
				? "Пожалуйста, заполните это поле"
				: "Пожалуйста, введите корректный email";
		input.setCustomValidity(message);
	}

	isRequiredValid(input) {
		if (!input) return false;
		return input.value.trim() !== "";
	}

	validateRequired(input) {
		if (this.isRequiredValid(input)) {
			input.setCustomValidity("");
			input.style.borderColor = "";
		} else {
			input.setCustomValidity("Пожалуйста, заполните это поле");
		}
	}

	isPhoneValid(input) {
		if (!input) return false;
		const value = input.value.trim();

		if (value === "") {
			return !input.required;
		}

		// Если на поле подключён Inputmask, используем его критерий завершённости.
		if (
			input.inputmask &&
			typeof input.inputmask.isComplete === "function"
		) {
			return input.inputmask.isComplete() === true;
		}

		// Универсальный fallback без маски: разумный диапазон для телефонного номера.
		// Он предотвращает принятие слишком коротких и произвольно длинных значений.
		const digitsOnly = value.replace(/\D/g, "");
		return digitsOnly.length >= 10 && digitsOnly.length <= 15;
	}

	validatePhone(input) {
		if (this.isPhoneValid(input)) {
			input.setCustomValidity("");
			input.style.borderColor = "";
			return;
		}

		const message =
			input.value.trim() === ""
				? "Пожалуйста, введите номер телефона"
				: "Пожалуйста, введите корректный номер телефона";
		input.setCustomValidity(message);
	}

	validPhoneNumbers(e) {
		// Не блокируем системные сочетания: Ctrl/Cmd+A/C/V/X и т.п.
		if (e.ctrlKey || e.metaKey || e.altKey) {
			return;
		}

		const allowedKeys = [
			"Backspace",
			"Tab",
			"Enter",
			"ArrowLeft",
			"ArrowRight",
			"ArrowUp",
			"ArrowDown",
			"Delete",
			"Home",
			"End",
			"Escape",
		];

		if (allowedKeys.includes(e.key)) {
			return;
		}

		// Блокируем только недопустимые печатные символы.
		// Служебные клавиши (F1–F12 и др.) не затрагиваем.
		const allowedCharacters = /^[0-9+\-() ]$/;
		if (e.key.length === 1 && !allowedCharacters.test(e.key)) {
			e.preventDefault();
		}
	}

	// Обработчик отправки
	handleSubmit(e) {
		// Валидация остаётся той же самой для всех подключённых форм.
		if (!this.validateForm()) {
			e.preventDefault();
			return;
		}

		// Обычные формы Validate не перехватывает.
		// AJAX-отправка включается только явно через data-form-ajax.
		if (!this.options.ajax) {
			return;
		}

		e.preventDefault();

		// const recaptchaMeta = document.querySelector(
		// 	'meta[name="recaptcha-site-key"]',
		// );

		// const siteKey = recaptchaMeta.getAttribute("content")?.trim();

		// grecaptcha
		// 	.execute(siteKey, { action: "submit" })
		// 	.then((token) => {
		// 		document
		// 			.querySelectorAll('[name="recaptcha_response"]')
		// 			.forEach((elem) => {
		// 				elem.value = token;
		// 			});
		// 	})
		// 	.catch((error) => {
		// 		console.error("Не удалось получить токен reCAPTCHA", error);
		// 	});

		// Форма валидна – отправляем через fetch
		const formData = new FormData(this.form);
		const fileInputs = this.form.querySelectorAll(
			'input[type="file"][name]',
		);
		fileInputs.forEach((input) => {
			const files = Array.from(input.files || []);
			if (files.length === 0) return;

			const fieldName = input.name || "attachments[]";
			formData.delete(fieldName);
			if (fieldName.endsWith("[]")) {
				formData.delete(fieldName.slice(0, -2));
			}

			files.forEach((file) => formData.append(fieldName, file));
		});

		fetch(this.form.action, {
			// Сохраняем прежнее поведение: если method не указан, AJAX-форма идёт POST.
			method: this.form.getAttribute("method")?.toUpperCase() || "POST",
			body: formData,
		})
			.then((response) => {
				if (response.ok) {
					if (this.options.closeModalOnSuccess && this.modal) {
						const modalForm = this.form.closest(".modal");
						if (modalForm) {
							this.modal.close(modalForm);
						}
					}

					if (this.options.successModal && this.modal) {
						this.modal.open(this.options.successModal);
					}

					if (this.options.resetOnSuccess) {
						this.form.reset();
						this.resetValidationStyles();
					}
				} else {
					alert(
						"Произошла ошибка при отправке формы. Попробуйте позже.",
					);
				}
			})
			.catch((error) => {
				console.error("Error:", error);
				alert("Ошибка соединения. Проверьте интернет.");
			});
	}

	// Сброс стилей валидации после очистки формы
	resetValidationStyles() {
		const inputs = this.form.querySelectorAll("input, textarea, select");
		inputs.forEach((input) => {
			input.setCustomValidity("");
			input.style.borderColor = "";
		});
	}

	checkFormFilled() {
		// Ваша логика для активации/деактивации кнопки отправки (закомментировано)
		// Можно реализовать, если нужно
	}
}
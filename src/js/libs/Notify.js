class Notify {
	constructor(options = {}) {
		this.positions = new Set([
			"top-left",
			"top-right",
			"bottom-left",
			"bottom-right",
		]);

		this.options = {
			position: "bottom-right",
			duration: 3000,
			closable: true,
			...options,
		};

		this.options.position = this.normalizePosition(this.options.position);
		this.containers = new Map();
		this.notifications = new Set();
		this.timers = new WeakMap();
		this.counter = 0;
	}

	normalizePosition(position) {
		if (this.positions.has(position)) return position;

		console.warn(
			`Notify: неизвестная позиция "${position}". Используется "bottom-right".`,
		);

		return "bottom-right";
	}

	setPosition(position) {
		this.options.position = this.normalizePosition(position);
		return this;
	}

	getContainer(position = this.options.position) {
		const normalizedPosition = this.normalizePosition(position);
		let container = this.containers.get(normalizedPosition);

		if (container && document.body.contains(container)) {
			return container;
		}

		container = document.createElement("div");
		container.className = `notify-container notify-container--${normalizedPosition}`;
		container.dataset.notifyContainer = normalizedPosition;
		container.setAttribute("aria-live", "polite");
		container.setAttribute("aria-atomic", "false");

		document.body.append(container);
		this.containers.set(normalizedPosition, container);

		return container;
	}

	create(message, options = {}) {
		const config = {
			position: this.options.position,
			duration: this.options.duration,
			closable: this.options.closable,
			type: "default",
			...options,
		};

		config.position = this.normalizePosition(config.position);

		const notification = document.createElement("div");
		const id = options.id || `notify-${++this.counter}`;
		const type = String(config.type || "default").trim().toLowerCase();

		notification.classList.add("notify");
		if (type !== "default") {
			notification.classList.add(`notify-${type}`);
		}

		notification.dataset.notifyId = id;
		notification.dataset.notifyType = type;
		notification.dataset.notifyPosition = config.position;
		notification.setAttribute("role", type === "error" ? "alert" : "status");
		notification.setAttribute("aria-hidden", "true");

		const content = document.createElement("div");
		content.className = "notify-content";

		if (message instanceof Node) {
			content.append(message);
		} else {
			content.textContent = String(message ?? "");
		}

		notification.append(content);

		if (config.closable) {
			const closeButton = document.createElement("button");
			closeButton.className = "notify-close aspected t2";
			closeButton.type = "button";
			closeButton.setAttribute("aria-label", "Закрыть уведомление");
			closeButton.innerHTML = '<i class="icon-x" aria-hidden="true"></i>';
			closeButton.addEventListener("click", () => this.close(notification));
			notification.append(closeButton);
		}

		return { notification, config };
	}

	show(message, options = {}) {
		const { notification, config } = this.create(message, options);
		const container = this.getContainer(config.position);

		container.append(notification);
		this.notifications.add(notification);

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				if (!notification.isConnected) return;
				notification.classList.add("show");
				notification.setAttribute("aria-hidden", "false");
			});
		});

		const duration = Number(config.duration);
		if (Number.isFinite(duration) && duration > 0) {
			const timer = window.setTimeout(() => {
				this.close(notification);
			}, duration);

			this.timers.set(notification, timer);
		}

		return notification;
	}

	open(message, options = {}) {
		return this.show(message, options);
	}

	resolveNotification(target) {
		if (target instanceof Element) {
			return target.classList.contains("notify")
				? target
				: target.closest(".notify");
		}

		if (typeof target === "string") {
			return [...this.notifications].find(
				(notification) => notification.dataset.notifyId === target,
			) || null;
		}

		return null;
	}

	close(target) {
		const notification = this.resolveNotification(target);
		if (!notification || !this.notifications.has(notification)) return false;

		const timer = this.timers.get(notification);
		if (timer) {
			clearTimeout(timer);
			this.timers.delete(notification);
		}

		notification.classList.remove("show");
		notification.setAttribute("aria-hidden", "true");
		this.notifications.delete(notification);

		let removed = false;
		const removeNotification = () => {
			if (removed) return;
			removed = true;

			const container = notification.parentElement;
			notification.remove();

			if (container?.classList.contains("notify-container") && !container.children.length) {
				const position = container.dataset.notifyContainer;
				container.remove();
				this.containers.delete(position);
			}
		};

		notification.addEventListener("transitionend", removeNotification, { once: true });
		window.setTimeout(removeNotification, 300);

		return true;
	}

	closeAll(position = null) {
		const normalizedPosition = position
			? this.normalizePosition(position)
			: null;

		[...this.notifications].forEach((notification) => {
			if (
				normalizedPosition &&
				notification.dataset.notifyPosition !== normalizedPosition
			) {
				return;
			}

			this.close(notification);
		});
	}
}
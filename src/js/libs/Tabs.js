class Tabs {
	constructor() {
		this.groups = new Map();
		this.init();
	}

	init() {
		document.querySelectorAll(".tabs-container").forEach((container, index) => {
			this.initContainer(container, index);
		});

		document.addEventListener("click", (event) => {
			const link = event.target.closest("[data-link-tab-open]");
			if (!link) return;

			event.preventDefault();
			this.activateTab(
				link.dataset.linkTabOpen,
				link.dataset.tabGroup || "default",
				true,
			);
		});

		window.addEventListener("hashchange", () => this.openFromHash());
		this.openFromHash();
	}

	initContainer(container, index) {
		const triggers = [...container.querySelectorAll("[data-tab-open]")];
		const panels = [...container.querySelectorAll("[data-tab-id]")];
		if (!triggers.length || !panels.length) return;

		const groupName =
			triggers[0].dataset.tabGroup ||
			panels[0].dataset.tabGroup ||
			`tabs-${index}`;

		const group = { container, triggers, panels };
		this.groups.set(groupName, group);

		triggers.forEach((trigger) => {
			trigger.addEventListener("click", (event) => {
				if (event.target.closest("[data-not-prevent]")) return;

				const input = trigger.querySelector(
					'input[type="radio"], input[type="checkbox"]',
				);

				// Для label + input управляем checked только через Tabs.
				if (input) event.preventDefault();

				const tabId = trigger.dataset.tabOpen;
				const isActive = trigger.classList.contains("active");
				const canCollapse = this.canCollapse(container);

				if (isActive && canCollapse) {
					this.closeGroup(groupName);
					return;
				}

				this.activateTab(tabId, groupName);
			});
		});

		// Начальное состояние: checked input -> .active -> первая вкладка.
		const checkedTrigger = triggers.find((trigger) =>
			trigger.querySelector('input[type="radio"]:checked, input[type="checkbox"]:checked'),
		);
		const activeTrigger = triggers.find((trigger) => trigger.classList.contains("active"));
		const initialTrigger = checkedTrigger || activeTrigger || triggers[0];

		if (initialTrigger) {
			this.activateTab(initialTrigger.dataset.tabOpen, groupName, false, false);
		}

		this.initNavigation(groupName);
	}

	// Стрелки работают лишь при фактическом переполнении горизонтальных вкладок.
	initNavigation(groupName) {
		const group = this.groups.get(groupName);
		const nav = group.container.querySelector("[data-tabs-nav]");
		const scroller = nav?.querySelector(".tabs-buttons");
		const previous = nav?.querySelector("[data-tabs-prev]");
		const next = nav?.querySelector("[data-tabs-next]");
		console.log(nav, scroller, previous, next)
		if (!nav || !scroller || !previous || !next) return;

		const move = (direction) => {
			const currentIndex = group.triggers.findIndex((trigger) =>
				trigger.classList.contains("active"),
			);
			const target = group.triggers[currentIndex + direction];
			if (target) this.activateTab(target.dataset.tabOpen, groupName);
		};

		previous.addEventListener("click", () => move(-1));
		next.addEventListener("click", () => move(1));

		const update = () => {
			const first = group.triggers[0];
			const last = group.triggers[group.triggers.length - 1];
			// Сравниваем с ПОЛНОЙ шириной навигации, а не с шириной
			// скроллера, суженной уже показанными стрелками.
			const contentWidth = last.offsetLeft + last.offsetWidth - first.offsetLeft;
			const isMobile = window.matchMedia("(max-width: 575.98px)").matches;
			const overflow = isMobile && contentWidth > nav.clientWidth + 1;
			previous.hidden = !overflow;
			next.hidden = !overflow;

			const activeIndex = group.triggers.findIndex((trigger) =>
				trigger.classList.contains("active"),
			);
			previous.disabled = !overflow || activeIndex <= 0;
			next.disabled = !overflow || activeIndex < 0 || activeIndex === group.triggers.length - 1;
		};

		group.updateNavigation = update;
		if (typeof ResizeObserver !== "undefined") {
			const observer = new ResizeObserver(update);
			observer.observe(nav);
			group.triggers.forEach((trigger) => observer.observe(trigger));
		}
		window.addEventListener("resize", update, { passive: true });
		update();
	}

	canCollapse(container) {
		return (
			container.dataset.tabsCollapse === "mobile" &&
			window.matchMedia("(max-width: 575.98px)").matches
		);
	}

	activateTab(tabId, groupName = "default", shouldScroll = false, emitEvent = true) {
		const group = this.groups.get(groupName);
		if (!group) return;

		const activeTrigger = group.triggers.find(
			(trigger) => trigger.dataset.tabOpen === tabId,
		);
		const activePanel = group.panels.find(
			(panel) => panel.dataset.tabId === tabId,
		);

		if (!activeTrigger || !activePanel) return;

		group.triggers.forEach((trigger) => {
			const active = trigger === activeTrigger;
			trigger.classList.toggle("active", active);
			trigger.setAttribute("aria-selected", String(active));

			const input = trigger.querySelector('input[type="radio"], input[type="checkbox"]');
			if (input) input.checked = active;
		});

		group.panels.forEach((panel) => {
			const active = panel === activePanel;
			panel.classList.toggle("active", active);
			panel.setAttribute("aria-hidden", String(!active));
		});

		this.scrollTriggerIntoView(activeTrigger);
		group.updateNavigation?.();

		if (shouldScroll) {
			activePanel.scrollIntoView({ behavior: "smooth", block: "start" });
		}

		if (emitEvent) {
			document.dispatchEvent(
				new CustomEvent("tab:changed", {
					detail: { tabId, groupName },
				}),
			);
		}
	}

	closeGroup(groupName) {
		const group = this.groups.get(groupName);
		if (!group) return;

		group.triggers.forEach((trigger) => {
			trigger.classList.remove("active");
			trigger.setAttribute("aria-selected", "false");

			const input = trigger.querySelector('input[type="radio"], input[type="checkbox"]');
			if (input) input.checked = false;
		});

		group.panels.forEach((panel) => {
			panel.classList.remove("active");
			panel.setAttribute("aria-hidden", "true");
		});

		group.updateNavigation?.();
		document.dispatchEvent(
			new CustomEvent("tab:changed", {
				detail: { tabId: null, groupName },
			}),
		);
	}

	scrollTriggerIntoView(trigger) {
		const scroller = trigger.closest(".tabs-buttons");
		if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return;

		// Прокручиваем только полосу вкладок, не всю страницу контактов.
		const left = trigger.offsetLeft;
		const right = left + trigger.offsetWidth;
		let target = scroller.scrollLeft;
		if (left < target) target = left;
		else if (right > target + scroller.clientWidth) target = right - scroller.clientWidth;

		if (Math.abs(target - scroller.scrollLeft) > 1) {
			scroller.scrollTo({
				left: target,
				behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
					? "auto" : "smooth",
			});
		}
	}

	openFromHash() {
		const tabId = window.location.hash.slice(1);
		if (!tabId) return;

		for (const [groupName, group] of this.groups) {
			if (group.panels.some((panel) => panel.dataset.tabId === tabId)) {
				this.activateTab(tabId, groupName);
				break;
			}
		}
	}
}
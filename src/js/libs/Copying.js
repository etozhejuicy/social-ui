class Copying {
	constructor() {
		this.triggers = document.querySelectorAll(
			'[data-share="copy"], [link-copy]'
		);

		if (this.triggers.length < 0) return;

		this.setupEvents();
	}

	setupEvents() {
		this.triggers.forEach((trigger) => {
			trigger.setAttribute("data-copy-url", window.location.href);

			trigger.addEventListener("click", (e) => {
				this.copyLink(e);
			});
		});
	}

	copyLink(e) {
		const trigger = e.currentTarget;
		const linkToCopy = trigger.getAttribute("data-copy-url");

		const startEvents = () => {
			trigger.classList.add("copy-success");
			trigger.classList.add("active");
			trigger.style.setProperty("pointer-events", "none");

			setTimeout(() => {
				endEvents();
			}, 1000);
		};

		const endEvents = () => {
			trigger.classList.remove("copy-success");
			trigger.classList.remove("active");

			trigger.style.removeProperty("pointer-events");
		};

		navigator.clipboard
			.writeText(linkToCopy)
			.then(() => {
				startEvents();
				window.notify.show("Ссылка успешно скопирована", {
					type: "success",
				});
			})
			.catch((err) => {
				console.error("Ошибка при копировании ссылки:", err);
				window.notify.show("Ошибка при копировании ссылки", {
					type: "error",
				});
			});
	}
}
class Alert {
	constructor() {
		this.closeButton = document.querySelector("[data-alert-close]");
		this.events();
	}

	events() {
		window.addEventListener("click", (event) => {
			if (event.target.closest("[data-alert-close]")) {
				this.close(event);
			}
		});
	}

	close(e) {
		let alert = e.originalTarget.closest(".alert");

		alert.remove();
	}
}

new Alert();

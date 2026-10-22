class Sharing {
	constructor() {
		this.triggers = document.querySelectorAll("[data-share]");

		if (this.triggers.length < 0) return;

		this.triggers.forEach((trigger) => {
			if (!trigger) return;

			if (trigger) {
				const type = trigger.getAttribute("data-share");
				const url = encodeURIComponent(window.location.href);
				const title = document.title
					? encodeURIComponent(document.title)
					: "";

				this.setup(type, trigger, url, title);
			}
		});
	}

	setup(type, trigger, url, title) {
		const shareUrls = {
			vk: `https://vk.com/share.php?url=${url}&title=${title}`,
			max: `https://max.ru/share/url?url=${url}&text=${title}`,
			telegram: `https://t.me/share/url?url=${url}&text=${title}`,
			mail: `mailto:?subject=${title}&body=${url}`,
		};

		if (shareUrls[type]) {
			trigger.setAttribute("href", shareUrls[type]);
		}
	}
}
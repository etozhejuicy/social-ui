(() => {
	const getCookie = (name) => {
		const match = document.cookie.match(
			new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
		);
		return match ? decodeURIComponent(match[1]) : undefined;
	};

	const setCookie = (name, value) => {
		const expires = new Date(9999, 0, 1).toUTCString();
		document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;
	};

	const removeBanner = (banner) => {
		if (banner) banner.remove();
	};

	const init = () => {
		const banner = document.querySelector('.cookies');
		const accepted = getCookie('OAuth_cookie_privacy_policy_new');

		if (accepted) {
			removeBanner(banner);
			return;
		}

		if (!banner) return;
		banner.style.display = '';

		const agreeBtns = banner.querySelectorAll('.close_cookies, .cookies_button');

		const onAgree = () => {
			setCookie('OAuth_cookie_privacy_policy_new', 'accepted');
			removeBanner(banner);
		};

		agreeBtns.forEach((button) => button.addEventListener('click', onAgree));
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init, { once: true });
	} else {
		init();
	}
})();
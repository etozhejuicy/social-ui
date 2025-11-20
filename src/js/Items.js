class Items {
	constructor() {
		this.items = [];

		this.events();
	}

	events() {
		console.log(this.items.length);
	}
}

new Items();

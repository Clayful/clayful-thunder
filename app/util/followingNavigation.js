const set = require('lodash.set');

module.exports = function($container, follow, menuItems = []) {

	const id = Math.random().toString().slice(2);

	const itemMap = menuItems.reduce((o, item, i) => {
		return set(o, [`${id}.${i}`], item);
	}, {});

	const items = menuItems.map((item, i) => {
		return `<li><span data-scroll-to="${id}.${i}">${item.name}</span></li>`;
	}).join('');

	$container
		.addClass('thunder--following-nav-container')
		.addClass(follow ? 'sticky' : '')
		.html(`<ul class="thunder--following-nav">${items}</ul>`);

	$container.on('click', '[data-scroll-to]', function(event) {

		event.preventDefault();

		const itemId = $(this).data('scrollTo');
		const item = itemMap[itemId];

		return item.$el.get(0).scrollIntoView();

	});

};
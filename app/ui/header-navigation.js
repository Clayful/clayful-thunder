const kebabCase = require('lodash.kebabCase');

module.exports = function() {

	if (!this.options.header) return '';

	const templates = [];
	const { items, actions } = this.options.header;

	const toAttributes = (component, directives) => {

		const [primary, ...rest] = directives;

		return [
			`data-thunder-${primary}="${component}"`,
			...rest.map(({ option, value }) => {
				return `data-thunder-${kebabCase(option)}="${value}"`;
			})
		].join(' ');
	};
	const menuItem = (component, message) => {
		return `<li><a ${toAttributes(component, actions[component])}>${message}</a></li>`;
	};

	items.forEach(type => {

		if (type === 'customer') {

			if (this.authenticated()) {

				templates.push(`
					<li><a data-thunder-logout>${this.polyglot.t('header-navigation.logout')}</a></li>
				`);

				templates.push(menuItem(
					'customer-dashboard',
					this.polyglot.t('header-navigation.profile')
				));

			} else {

				templates.push(menuItem(
					'customer-register',
					this.polyglot.t('header-navigation.register')
				));

				templates.push(menuItem(
					'customer-login',
					this.polyglot.t('header-navigation.login')
				));

			}

		}

		if (type === 'search-purchase') {

			if (!this.authenticated()) {

				templates.push(menuItem(
					'search-purchase',
					this.polyglot.t('header-navigation.searchOrder')
				));

			}

		}

		if (type === 'cart') {

			templates.push(menuItem(
				'cart',
				this.polyglot.t('header-navigation.cart')
			));

		}

	});

	return `
		<div id="thunder--header-navigation">
			<ul>
				${templates.join('')}
			</ul>
		</div>
	`;

};
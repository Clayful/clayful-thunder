module.exports = function() {

	if (!this.options.header) return '';

	const templates = [];
	const { items } = this.options.header;

	const menuItem = (component, message) => {
		return `<li><a data-component="${component}">${message}</a></li>`;
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
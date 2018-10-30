module.exports = function() {

	const Thunder = this;

	const body = $('body');

	this.Cart.load();

	// Cache overlay DOMs
	this.overlay.background = $(this.overlay.background).addClass('hidden');
	this.overlay.container = $(this.overlay.container).addClass('hidden');
	this.overlay.body = this.overlay.container.find('#thunder--overlay-body');

	// Append close button to the overlay's header
	this.overlay.container
		.find('#thunder--overlay-header')
		.append(this.uis['overlay-navigation']());

	body.append(this.overlay.background);
	body.append(this.overlay.container);

	// Bind click events for DOMs with data-thunder-* attributes.
	body.on('click', '[data-thunder-open]', openOverlay);
	body.on('click', '[data-thunder-close]', () => this.close());
	body.on('click', '[data-thunder-logout]', () => this.logout());
	body.on('click', '[data-thunder-render][data-thunder-render-target]', renderComponentInTarget);

	// Render components for DOMs with 'data-thunder-render',
	// and without 'data-thunder-render-target'.
	body.find('[data-thunder-render]:not([data-thunder-render-target])').each(renderComponent);

	this.header();

	// Check whether authentication tokens are expired.
	// If it is expired -> Log out and unset from the storage...
	this.authenticated('customer');
	this.authenticated('order');

	function openOverlay($event) {

		$event.preventDefault();

		const data = $(this).data();
		const componentName = data.thunderOpen;

		// Pass the data from the caller DOM
		Thunder.open(componentName, data);

	}

	function renderComponent() {

		Thunder.render($(this), $(this).data('thunderRender'), {});
	}

	function renderComponentInTarget($event) {

		$event.preventDefault();

		const data = $(this).data();
		const { thunderRender, thunderRenderTarget } = data;

		Thunder.render($(thunderRenderTarget), thunderRender, data);
	}

};
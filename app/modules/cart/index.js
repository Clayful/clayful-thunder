const set = require('lodash.set');

module.exports = Thunder => {

	const implementation = {
		name: 'cart'
	};

	implementation.options = () => ({
		orderActions: Object.keys(Thunder.options.paymentMethods), // 'order', 'subscription'
		items:        null, // Item filter - e.g., ['item1', 'item2', ...]

		onCheckout: function($container, context, type) {

			Thunder.render($container, 'checkout', {
				type:  type,
				items: context.options.items,
				back:  {
					$container: $container,
					component:  implementation.name,
					options:    context.options
				}
			});
		}
	});

	implementation.pre = function(context, callback) {

		context.options.orderActions = Thunder.util.parseArrayString(context.options.orderActions);

		const errors = {
			default: context.m('cartReadFailed')
		};

		return getCart(context.options.items).then(cart => {
			return callback(null, set(context, 'cart', cart.cart));
		}, err => Thunder.util.requestErrorHandler(
			err.responseJSON,
			errors,
			callback
		));

	};

	implementation.init = function(context) {

		const $container = $(this);
		const $cartItems = $(this).find('.thunder--cart-items');

		$container.on('click', '.thunder--delete-cart-item', deleteItem);
		$container.on('click', '.thunder--apply-changes', applyChanges);
		$container.on('click', '.thunder--checkout button', checkout);

		function recalculate() {

			const errors = {
				default: context.m('cartReadFailed')
			};

			return getCart(context.options.items).then(cart => {

				context.cart = cart.cart;

				const template = Thunder.component(implementation.name).template(context);
				const cartItemsTemplate = $(template).find('.thunder--cart-items').html();

				$cartItems.find('*').off();
				$cartItems.html(cartItemsTemplate);
				Thunder.util.quantityInput($cartItems);

			}, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors
			));

		}

		function deleteItem() {

			const spinner = Thunder.util.makeAsyncButton($(this), { bind: false });

			spinner.run();

			const itemId = $(this).data('item');
			const bundleItemId = $(this).data('bundleItem');

			const errors = {
				default: context.m('deleteItemFailed')
			};

			if (Thunder.authenticated()) {

				if (bundleItemId) {

					return Thunder.request({
						method: 'PUT',
						url:    `/v1/me/cart/items/${itemId}`,
						data:    { bundleItems: { [bundleItemId]: null } }
					}).then(() => {
						spinner.done();
						recalculate();
					}, err => Thunder.util.requestErrorHandler(
						err.responseJSON,
						errors,
						err => spinner.done()
					));

				} else {

					return Thunder.request({
						method: 'DELETE',
						url:    `/v1/me/cart/items/${itemId}`
					}).then(() => {
						spinner.done();
						recalculate();
					}, err => Thunder.util.requestErrorHandler(
						err.responseJSON,
						errors,
						err => spinner.done()
					));

				}

			} else {

				if (bundleItemId) {

					const update = {
						bundleItems: { [bundleItemId]: null }
					};

					Thunder.Cart.updateItem(itemId, update, err => {

						if (err) {
							spinner.done();
							return Thunder.notify('error', errors[err.code || 'default'] || errors.default);
						}

						spinner.done();
						recalculate();

					});

				} else {

					return Thunder.Cart.deleteItem(itemId, err => {

						if (err) {
							spinner.done();
							return Thunder.notify('error', errors[err.code || 'default'] || errors.default);
						}

						spinner.done();
						recalculate();

					});

				}

			}

		}

		function applyChanges() {

			const spinner = Thunder.util.makeAsyncButton($(this), { bind: false });

			spinner.run();

			const quantityChanged = [];
			const $quantityInputs = $container.find('.thunder--cart-item-quantity input');

			$quantityInputs.each(function() {

				const itemId = $(this).data('item');
				const bundleId = $(this).data('bundleItem');
				const originalQuantity = $(this).data('originalQuantity');
				const newQuantity = parseInt($(this).val());

				if (newQuantity === originalQuantity) return;

				quantityChanged.push({
					item:     itemId,
					bundle:   bundleId || null,
					quantity: newQuantity
				});

			});

			const updates = quantityChanged.reduce((o, change) => {

				const { item, bundle, quantity } = change;

				o[item] = o[item] || {};

				const toUpdate = o[item];

				if (bundle) {
					toUpdate.bundleItems = toUpdate.bundleItems || {};
					toUpdate.bundleItems[bundle] = { quantity };
				} else {
					toUpdate.quantity = quantity;
				}

				return o;

			}, {});

			const errors = {
				default: context.m('itemUpdateFailed')
			};

			if (Thunder.authenticated()) {

				const itemIdsToUpdate = Object.keys(updates);

				if (itemIdsToUpdate.length === 0) {
					// There are no items to update
					return spinner.done();
				}

				return $.when(...itemIdsToUpdate.map(itemId => {

					return Thunder.request({
						method: 'PUT',
						url:    `/v1/me/cart/items/${itemId}`,
						data:   updates[itemId]
					}).then(() => {

						spinner.done();
						return recalculate();

					}, err => Thunder.util.requestErrorHandler(
						err.responseJSON,
						errors,
						err => spinner.done()
					));

				}));

			} else {

				Object.keys(updates).forEach(itemId => {
					return Thunder.Cart.updateItem(itemId, updates[itemId], $.noop);
				});

				spinner.done();
				return recalculate();

			}

		}

		function checkout() {

			const cart = context.cart;
			const hasError = code => cart.errors.some(err => err.code === code);

			if (hasError('empty-cart')) {
				return Thunder.notify('error', context.m('isEmptyCart'));
			}

			if (hasError('item-error')) {
				return Thunder.notify('error', context.m('hasErredItem'));
			}

			return Thunder.execute(
				context.options.onCheckout,
				$container,
				context,
				$(this).data('checkoutType')
			);

		}

	};

	function getCart(items) {

		const query = items ? { items: items.toString() } : {};

		const request = Thunder.authenticated() ? {
			method: 'POST',
			url:    '/v1/me/cart',
			query:  query
		} : {
			method: 'POST',
			url:    '/v1/me/non-registered/cart',
			query:  query,
			data:   { items: Thunder.Cart.items },
		};

		return Thunder.request(request);

	}

	return implementation;

};
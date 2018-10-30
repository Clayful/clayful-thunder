module.exports = Thunder => {

	const Cart = {
		storage: '__items__',
		items:   []
	};

	Cart.load = () => {

		const storage = Thunder.plugins.cartStorage;

		Cart.items = JSON.parse(storage.getItem(Cart.storage) || '[]');
	};

	Cart.persist = () => {

		const storage = Thunder.plugins.cartStorage;

		storage.setItem(Cart.storage, JSON.stringify(Cart.items));
	};

	Cart.totalItems = items => {

		return (Cart.items || items).reduce((sum, item) => {
			return sum + 1 + (item.bundleItems ? item.bundleItems.length : 0);
		}, 0);

	};

	Cart.addItem = (item, callback) => {

		const items = $.extend(true, [], Cart.items);

		item._id = (Math.random() + '').slice(2, 17);

		if (item.bundleItems) {
			item.bundleItems.forEach(item => {
				item._id = (Math.random() + '').slice(2, 17);
			});
		}

		items.push(item);

		if (Cart.totalItems(items) >= 50) {
			return callback(CartError('items-exceeded'));
		}

		Cart.items = items;

		Cart.persist();

		return callback(null, item);

	};

	Cart.updateItem = (itemId, update, callback) => {

		itemId = itemId + '';

		const items = $.extend(true, [], Cart.items);
		const found = items.find(item => item._id === itemId);

		if (!found) {
			return callback(CartError('no-item'));
		}

		const bundleItems = update.bundleItems;

		delete update.bundleItems;

		$.extend(found, update);

		if (bundleItems) {

			found.bundleItems = found.bundleItems || [];

			for (const bundleId in bundleItems) {

				const item = found.bundleItems.find(item => item._id === bundleId);
				const update = bundleItems[bundleId];

				if (!item && update) {
					found.bundleItems.push(update);
				}

				if (update) {
					$.extend(item, update);
				}

				if (update === null) {
					const index = found.bundleItems.indexOf(item);

					found.bundleItems.splice(index, 1);
				}

			}

		}

		if (Cart.totalItems(items) >= 50) {
			return callback(CartError('items-exceeded'));
		}

		Cart.items = items;

		Cart.persist();

		return callback(null, found);

	};

	Cart.deleteItem = (itemId, callback) => {

		itemId = itemId + '';

		const items = $.extend(true, [], Cart.items);
		let index = null;

		for (let i = 0; i < items.length; i++) {

			const item = items[i];

			if (item._id === itemId) {
				index = i;
				break;
			}

		}

		if (index === null) {
			return callback(CartError('no-item'));
		}

		items.splice(index, 1);

		Cart.items = items;

		Cart.persist();

		return callback();

	};

	Cart.empty = callback => {

		Cart.items = [];

		Cart.persist();

		return callback();

	};

	return Cart;

	function CartError(code, message = code) {

		const err = new Error(message);

		err.code = code;

		return err;

	}

};
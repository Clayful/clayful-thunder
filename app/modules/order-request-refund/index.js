const set = require('lodash.set');

module.exports = Thunder => {

	const implementation = {
		name: 'order-request-refund'
	};

	implementation.options = () => ({
		order:            '', // Order ID to refund
		reasonCategories: Thunder.options.refundReasonCategories,

		onRequestRefundSuccess: function($container, context) {

			Thunder.notify('success', context.m('requestRefundSuccess'));

			const back = context.options.back;

			if (!back) return;

			return Thunder.render(back.$container, back.component, back.options);
		}
	});

	implementation.pre = function(context, callback) {

		let order = null;

		return fetchOrder(context.options.order)
				.then(o => {
					order = o;
					return fetchCurrency(order.currency.payment.code);
				})
				.then(([currency]) => success(order, currency));

		function success(order, currency) {

			context.currency = $.extend(currency, {
				// Override precision with a snapshot version
				precision: order.currency.payment.precision
			});

			const refundsInProcess =
				order.refunds
					.filter(({ status }) => status !== 'cancelled');

			// { [itemId]: shipment, ... }
			const itemToShipmentMap = order.shipments.reduce((o, shipment) => {

				return shipment.items.reduce((o, item) => {

					return set(o, item._id, shipment);

				}, o);

			}, {});

			// { [itemId]: quantity, ... }
			const refundedItemQuantityMap = refundsInProcess.reduce((o, refund) => {

				return refund.items.reduce((o, { item, quantity }) => {
					o[item._id] = o[item._id] || 0;
					o[item._id] += quantity.raw;
					return o;
				}, o);

			}, {});

			// { [shipmentId]: amount, ... }
			const refundedShipmentAmountMap = refundsInProcess.reduce((o, refund) => {

				return refund.shipments.reduce((o, { shipment, fee }) => {
					o[shipment._id] = o[shipment._id] || 0;
					o[shipment._id] = Thunder.util.toPrecision(
						o[shipment._id] + fee.withTax.raw,
						context.currency.precision
					);
					return o;
				}, o);

			}, {});

			order.items.forEach(item => [].concat(item, item.bundleItems || []).forEach(item => {

				const shipment = itemToShipmentMap[item._id];
				const refundedItemQuantity = refundedItemQuantityMap[item._id] || 0;

				item.shipment = shipment;
				item.refundableQuantity = item.quantity.raw - refundedItemQuantity;

			}));

			order.shipments.forEach(shipment => {

				const refundedShipmentAmount = refundedShipmentAmountMap[shipment._id] || 0;

				shipment.refundableFee = Thunder.util.toPrecision(
					shipment.fee.withTax.raw - refundedShipmentAmount,
					context.currency.precision
				);

			});

			order.hasRefundableItem = order.items.some(item => {
				return [].concat(item, item.bundleItems || []).some(item => {
					return item.refundableQuantity > 0;
				});
			});

			return callback(null, set(context, 'order', order));
		}

		function fetchOrder(order) {

			const errors = {
				default: context.m('orderReadFailed')
			};

			return Thunder.request({
				method: 'GET',
				url:    `/v1/me/orders/${order}`,
				fields: [
					'items',
					'shipments',
					'refunds',
					'transactions',
					'total',
				].join(',')
			}).then(null, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors,
				callback
			));

		}

		function fetchCurrency(code) {

			const errors = {
				default: context.m('currencyReadFailed')
			};

			return Thunder.request({
				method: 'GET',
				url:    `/v1/currencies`,
				query: { code }
			}).then(null, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors,
				callback
			));

		}

	};

	implementation.init = function(context) {

		const {
			order,
			currency
		} = context;

		const categoryMap = context.options.reasonCategories.reduce((o, category) => {
			return set(o, category.label, category);
		}, {});

		const itemMap = order.items.reduce((o, item) => {
			return [].concat(item, item.bundleItems || []).reduce((o, item) => {
				return set(o, item._id, item);
			}, o);
		}, {});

		const shipmentMap = order.shipments.reduce((o, shipment) => {
			return set(o, shipment._id, shipment);
		}, {});

		const shipmentItemQuantityMap = order.shipments.reduce((o, shipment) => {
			return shipment.items.reduce((o, item) => {
				return set(o, [shipment._id, item._id], item.quantity.raw);
			}, o);
		}, {});

		const $container = $(this);
		const $backToOrder = $(this).find('.thunder--back-to-order');
		const $cartItems = $(this).find('.thunder--cart-item');
		const $toggleItemSelection = $(this).find('.thunder--toggle-item-selection');
		const $refundQuantity = $(this).find('.thunder--cart-item input[name="refundQuantity"]');
		const $refundCategory = $(this).find('.thunder--refund-category');
		const $refundReason = $(this).find('.thunder--refund-reason');
		const $requiresReason = $(this).find('.thunder--requires-refund-reason');
		const $totalDetail = $(this).find('.thunder--refund-total-detail');
		const $refundItemsTotal = $(this).find('.thunder--refund-items-total td');
		const $refundShippingTotal = $(this).find('.thunder--refund-shipping-total td');
		const $refundTotal = $(this).find('.thunder--refund-total td');
		const $requestRefund = $(this).find('.thunder--request-refund');
		const requestButtonSpinner = Thunder.util.makeAsyncButton($requestRefund, { bind: false });

		$toggleItemSelection.on('click', toggleItemSelection);
		$refundQuantity.on('change', refundQuantityChanged);
		$refundCategory.on('change', updateRefundTotal);

		Thunder.util.bindBackButton($backToOrder, context);

		Thunder.util.makeRecaptcha({
			componentName: implementation.name,
			button:        $requestRefund,
			validate:      validateRequest,
			callback:      requestRefund
		});

		updateRefundTotal();

		function getOneItemPrice(item) {
			return item.price.withTax.raw / item.quantity.raw;
		}

		function markItemActive($cartItem, active, quantity) {

			const $toggleButton = $cartItem.find('.thunder--toggle-item-selection');
			const $refundQuantity = $cartItem.find('input[name="refundQuantity"]');
			const item = itemMap[$cartItem.data('item')];

			if (active) {
				$cartItem.data('active', true).removeClass('inactive');
				$toggleButton.text(context.m('removeFromRefund'));
				$refundQuantity.val(
					quantity === undefined ?
						item.refundableQuantity :
						quantity
				);
			} else {
				$cartItem.data('active', false).addClass('inactive');
				$toggleButton.text(context.m('addToRefund'));
				$refundQuantity.val(0);
			}

		}

		function toggleItemSelection(event) {

			event.preventDefault();

			const $cartItem = $(this).parents('.thunder--cart-item');

			markItemActive($cartItem, !$cartItem.data('active'));
			updateRefundTotal();
		}

		function refundQuantityChanged() {

			const $cartItem = $(this).parents('.thunder--cart-item');
			const quantity = parseInt($(this).val());

			markItemActive($cartItem, !!quantity, quantity);
			updateRefundTotal();
		}

		function updateRefundTotal() {

			$cartItems.each(function() {

				const $cartItem = $(this);
				const $refundAmount = $cartItem.find('.thunder--cart-item-refund-amount');
				const item = itemMap[$cartItem.data('item')];
				const quantity = parseInt($cartItem.find('input[name="refundQuantity"]').val());

				const refundAmount = Thunder.util.formatPrice(
					getOneItemPrice(item) * quantity,
					currency
				);

				$refundAmount.text(refundAmount);

			});

			const category = categoryMap[$refundCategory.val()];

			if (!category) {
				$requiresReason.removeClass('hidden');
				$totalDetail.addClass('hidden');
				return;
			}

			const refundItems = getRefundItems();
			const refundShipments = getRefundShipments(category, refundItems);

			const itemsTotal = refundItems.reduce((sum, { item, quantity }) => {
				return sum + (getOneItemPrice(item) * quantity);
			}, 0);

			const shippingTotal = refundShipments.reduce((sum, shipment) => {
				return sum + shipment.refundableFee;
			}, 0);

			const total = itemsTotal + shippingTotal;

			$refundItemsTotal.text(Thunder.util.formatPrice(itemsTotal, currency));
			$refundShippingTotal.text(Thunder.util.formatPrice(shippingTotal, currency));
			$refundTotal.text(Thunder.util.formatPrice(total, currency));

			$requiresReason.addClass('hidden');
			$totalDetail.removeClass('hidden');

		}

		function getRefundItems() {

			return $refundQuantity.map(function() {

				return {
					item:     itemMap[$(this).parents('[data-item]').data('item')],
					quantity: parseInt($(this).val()),
				};

			}).get().filter(({ quantity }) => quantity);

		}

		function getRefundShipments(category, refundItems) {

			if (!category) {
				return [];
			}

			const shipmentToRefundItems = {};

			refundItems.forEach(refundItem => {

				const shipment = refundItem.item.shipment;

				if (!shipment) return;

				shipmentToRefundItems[shipment._id] =
					(shipmentToRefundItems[shipment._id] || []).concat(refundItem);
			});

			const shipmentIdsToRefund = Object.keys(shipmentToRefundItems);

			return shipmentIdsToRefund.map(shipmentId => {

				// Clone first to avoid side effects
				const shipmentItemQuantity = $.extend({}, shipmentItemQuantityMap[shipmentId]);
				const refundItems = shipmentToRefundItems[shipmentId];

				refundItems.forEach(({ item, quantity }) => {
					shipmentItemQuantity[item._id] -= quantity;
				});

				const areAllItemsRefunded =
					Object.keys(shipmentItemQuantity)
						.every(itemId => shipmentItemQuantity[itemId] === 0);

				return {
					shipment: shipmentMap[shipmentId],
					shouldRefund: areAllItemsRefunded ?
								category.shippingFee.allItems :
								category.shippingFee.someItems
				};

			}).filter(({ shipment, shouldRefund }) => {

				// When the shipment should be refunded
				// and its refundable fee is greater than 0
				return shouldRefund &&
						shipment.refundableFee > 0;

			}).map(({ shipment }) => shipment);

		}

		function getRequestDetail() {

			const category = categoryMap[$refundCategory.val()];
			const items = getRefundItems();
			const shipments = getRefundShipments(category, items).map(s => s._id);

			items.forEach(detail => detail.item = detail.item._id);

			const reason = {
				category: category ?
							context.m(category.label) :
							null,
				body:     $refundReason.val(),
			};

			return { items, shipments, reason };
		}

		function validateRequest() {

			const {
				items,
				reason: {
					category
				}
			} = getRequestDetail();

			if (!items.length) {
				Thunder.notify('error', context.m('atLeastOneItemRequired'));
				return false;
			}

			if (!category) {
				Thunder.notify('error', context.m('reasonCategoryRequired'));
				return false;
			}

			return true;

		}

		function requestRefund(token, resetRecaptcha) {

			requestButtonSpinner.run();

			const detail = getRequestDetail();

			detail.reason = `[${detail.reason.category}] ${detail.reason.body || ''}`.trim();

			const resetState = () => {
				requestButtonSpinner.done();
				return resetRecaptcha && resetRecaptcha();
			};

			const errors = {
				'invalid-order-status': context.m('invalidOrderStatus'),
				default:                context.m('requestRefundFailed'),
			};

			return Thunder.request({
				method:    'POST',
				url:       `/v1/me/orders/${order._id}/refunds`,
				data:      detail,
				recaptcha: token,
			}).then(() => {

				resetState();

				Thunder.execute(
					context.options.onRequestRefundSuccess,
					$container,
					context
				);

			}, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors,
				resetState
			));

		}

	};

	return implementation;

};
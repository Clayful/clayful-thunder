const _set = require('lodash.set');
const _get = require('lodash.get');
const camelCase = require('lodash.camelcase');

module.exports = Thunder => {

	const implementation = {
		name: 'order-detail'
	};

	implementation.options = () => ({
		order:              '',   // Order ID to render
		updateTransactions: true, // Update transactions before getting an order
		customerFields:     Thunder.options.customerOrderFields.map(field => field.split(':')[0]),
		recipientFields:    Thunder.options.recipientFields.map(field => field.split(':')[0]),

		onRequestRefund:    function($container, context, order) {
			return Thunder.render($container, 'order-request-refund', {
				order: order._id,
				back:  {
					$container: $container,
					component:  implementation.name,
					options:    context.options
				}
			});
		}
	});

	implementation.pre = function(context, callback) {

		const { order } = context.options;

		context.couponDetail = coupon => {
			return coupon ?
					context.m('discountedBy', { value: coupon.discount.value.converted }) :
					'';
		};

		context.fulfillmentTracker = ({ tracking }) => {

			const message = [
				tracking.company,
				tracking.uid ? `(${tracking.uid})` : null,
			].filter(v => v).join(' ');

			return tracking.url ?
					`<a href="${tracking.url}">${message || context.m('viewTracker')}</a>` :
					`<span>${message}</span>`;
		};

		context.refundTotalDetail = total => [
			typeof total.items.price.withTax.raw === 'number' ?
				context.m('refundItemTotal', { total: total.items.price.withTax.converted }) :
				null,
			typeof total.shipping.fee.withTax.raw === 'number' ?
				context.m('refundShippingTotal', { total: total.shipping.fee.withTax.converted }) :
				null,
		].filter(v => v).join(' + ');

		context.calculateExpiresAt = (order, item) => {

			const { type, value } = item.download.policy.expires;

			if (!type) return null;

			return type === 'at' ?
				new Date(value.raw) :
				Thunder.util.addTime(order.createdAt.raw, type, value.raw);
		};

		context.toDateValues = date => ({
			year:  date.getFullYear().toString(),
			month: (date.getMonth() + 1).toString(),
			date:  date.getDate().toString(),
			hours: date.getHours().toString(),
		});

		const translationKeys = {
			'name.first': 'firstName',
			'name.last':  'lastName',
			'name.full':  'fullName',
		};

		context.customerFields = Thunder.util.parseArrayString(
			context.options.customerFields
		).map(key => ({
			key: key,
			translationKey: camelCase(['customer', translationKeys[key] || key]),
		}));

		context.recipientFields = Thunder.util.parseArrayString(
			context.options.recipientFields
		).map(key => ({
			key: key,
			translationKey: camelCase(['address', translationKeys[key] || key]),
		}));

		context.undownloadableStatuses = {
			placed:       true,
			cancelled:    true,
			'under-paid': true,
		};

		return context.options.updateTransactions ?
				// Since we are trying to make the order up-to-date with the best effort,
				// proceed following processes even if `updateTransactions` execution fails.
				updateTransactions().then(
					() => fetchOrder().then(order => success(order)),
					() => fetchOrder().then(order => success(order))
				) :
				fetchOrder().then(order => success(order));

		function success(order) {

			// Make `updateTransactions` option as `true`,
			// event if it was passed as `false`.
			context.options.updateTransactions = true;

			const findDiscount = type => discount => {
				return discount.coupon && discount.coupon.type === type;
			};
			const findCartDiscount = findDiscount('cart');
			const findProductDiscount = findDiscount('product');

			const allItems = order.items.reduce((items, item) => {
				return items.concat(item, item.bundleItems || []);
			}, []);
			const itemsAndShipments = [].concat(allItems, order.shipments);

			allItems.forEach(item => {
				// 환불 여부 플래그
				item.refunded = Thunder.util.checkItemRefunded(order, item._id);

				// 다운로드 가능 여부 플래그
				item.downloadable = (
					item.type === 'downloadable' && // 다운로드 상품이면서
					!item.refunded &&               // 환불되지 않았고
					(
						// 다운로드 가능 횟수 제한이 없거나, 제한량을 넘기지 않았고
						!item.download.policy.count ||
						item.download.downloaded.raw < item.download.policy.count.raw
					) &&
					(
						// 만료 날짜 제한이 없거나, 만료일이 지나지 않은 상품
						!item.download.policy.expires.type ||
						context.calculateExpiresAt(order, item).valueOf() > Date.now()
					)
				);

			});

			itemsAndShipments.forEach(item => {

				item.appliedCoupon = (
					item.discounts.find(findProductDiscount) || { coupon: null }
				).coupon;

			});

			order.shippingStatus = Thunder.util.orderShippingStatus(order);

			order.appliedCoupon = (
				(
					itemsAndShipments.find(item => {
						return item.discounts.find(findCartDiscount);
					}) || { discounts: [] }
				).discounts.find(findCartDiscount) || { coupon: null }
			).coupon;

			order.hasTangibleItem = allItems.some(item => item.type === 'tangible');

			context.order = order;

			context.vbanks = order.transactions.reduce((vbanks, transaction) => {
				return vbanks.concat(transaction.vbanks || []);
			}, []).filter(vbank => {

				const expiresAt = _get(vbank, 'expiresAt.raw');

				// 만료 기간이 없으면 만료 되지 않은 것으로 간주
				if (!expiresAt) return true;

				// Filter out expired virtual bank details
				return !Thunder.util.isExpired(expiresAt);

			});

			// Set payment details.
			const thunderPaymentMethodMap =
				(Thunder.options.paymentMethods.order || [])
					.reduce((o, p) => _set(o, p.id, p), {});

			// Filter viable payment methods where..
			const paymentMethods = order.transactions.map(({ paymentMethod, vbanks }) => {

				const thunderPaymentMethod =
					thunderPaymentMethodMap[paymentMethod._id] ||
					thunderPaymentMethodMap[paymentMethod.slug];

				const shouldDisplay = (
					// the payment method is configured for Thunder and..
					thunderPaymentMethod &&
					// the payment (by the method) is not for later
					!thunderPaymentMethod.payLater &&
					(
						!vbanks.length ||      // the payment method is not for virtual banks
						vbanks.some(vbank => { // or one or more virtual banks are expired

							const expiresAt = _get(vbank, 'expiresAt.raw');

							// 만료 기간이 없으면 만료 되지 않은 것으로 간주
							if (!expiresAt) return false;

							return Thunder.util.isExpired(expiresAt);

						})
					)
				);

				return shouldDisplay ? thunderPaymentMethod : null;

			}).filter(v => v);

			// Should display a payment form when,
			// - The order's status is 'placed'
			// - One or more viable payment methods exist
			const shouldPay =
				order.status === 'placed' &&
				paymentMethods.length;

			context.paymentMethods = paymentMethods;
			context.shouldPay = shouldPay;

			return callback(null, context);
		}

		function updateTransactions() {

			return Thunder.request({
				method: 'PUT',
				url:    `/v1/me/orders/${order}/transactions`,
			});

		}

		function fetchOrder() {

			const errors = {
				default: context.m('orderReadFailed')
			};

			return Thunder.request({
				method: 'GET',
				url:    `/v1/me/orders/${order}`,
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
			paymentMethods,
			shouldPay,
		} = context;

		const $container = $(this);
		const $backToOrders = $(this).find('.thunder--back-to-orders');
		const $subscriptionid = $(this).find('.thunder--subscription-id a');
		const $markAsReceived = $(this).find('.thunder--mark-order-as-received');
		const $markAsNotReceived = $(this).find('.thunder--mark-order-as-not-received');
		const $cancelOrder = $(this).find('.thunder--cancel-order');
		const $cancellationForm = $(this).find('.thunder--order-cancellation-form');
		const $cancellationReason = $cancellationForm.find('textarea');
		const $cancelButton = $cancellationForm.find('button');
		const $requestRefund = $(this).find('.thunder--request-refund');
		const $downloadButton = $(this).find('.thunder--download-button');

		const cancelButtonSpinner = Thunder.util.makeAsyncButton($cancelButton);

		$downloadButton.on('click', getDownloadLink);
		$subscriptionid.on('click', viewSubscription);
		$markAsReceived.on('click', markAsReceived);
		$markAsNotReceived.on('click', markAsNotReceived);
		$cancelOrder.on('click', startCancellation);
		$cancelButton.on('click', cancelOrder);
		$requestRefund.on('click', requestRefund);
		$(this).on('click', '.thunder--cancel-refund', startRefundCancellation);
		$(this).on('click', '.thunder--refund-cancellation-form button', cancelRefund);

		Thunder.util.bindBackButton($backToOrders, context);

		// Render a payment form if it's needed.
		if (shouldPay) {

			const $paymentFormContainer = $(this).find('.thunder--payment-form-container');
			const $makePayment = $(this).find('.thunder--make-payment');
			const makePaymentSpinner = Thunder.util.makeAsyncButton($makePayment, { bind: false });

			Thunder.render($paymentFormContainer, 'payment-form', {
				type: 'order',
				paymentMethods: paymentMethods.map(p => p.id)
			}, (err, { interfaces: paymentHandler }) => $makePayment.on('click', () => {

				const validationError = paymentHandler.validate();

				if (validationError) {
					return Thunder.notify('error', validationError.message);
				}

				makePaymentSpinner.run();

				return paymentHandler.makePayment({
					cart:     order,
					order:    order,
					customer: order.customer
				}, err => {

					if (err) {
						Thunder.notify('error', context.m('paymentFailed'));
						return makePaymentSpinner.done();
					}

					Thunder.notify('success', context.m('paymentSuccess'));
					makePaymentSpinner.done();
					return Thunder.render($container, implementation.name, $.extend(context.options, {
						updateTransactions: true
					}));

				});

			}));
		}

		function getDownloadLink() {

			const $item = $(this).parents('[data-item]').eq(0);
			const itemId = $item.data('bundleItem') || $item.data('item');
			const orderId = context.order._id;

			return Thunder.request({
				method: 'POST',
				url:    `/v1/me/orders/${orderId}/items/${itemId}/download/url`,
			}).then(res => {
				if (!res.url) return;

				const $countView = $item.find('.thunder--download-count-view').eq(0);

				if ($countView.length) {
					$countView.data('current', $countView.data('current') + 1);
					$countView.text(context.m('nTimesDownloaded', $countView.data()));
				}

				window.open(res.url);

			}, err => {
				if (err.responseJSON.errorCode === 'fully-used-item') {
					return Thunder.notify('error', context.m('fullyUsedDownloadable'));
				}
				if (err.responseJSON.errorCode === 'expired-item') {
					return Thunder.notify('error', context.m('expiredDownloadable'));
				}
				if (err.responseJSON.errorCode === 'refunded-item') {
					return Thunder.notify('error', context.m('refundedItem'));
				}
			});
		}

		function viewSubscription() {

			return Thunder.render($container, 'subscription-detail', {
				subscription: order.subscription._id,
				back: {
					$container: $container,
					component:  implementation.name,
					options:    context.options
				}
			});

		}

		function markAsReceived() {

			const errors = {
				'invalid-order-status': context.m('invalidOrderStatus'),
				default: context.m('markAsReceivedFailed'),
			};

			return Thunder.request({
				method: 'POST',
				url:    `/v1/me/orders/${order._id}/received`,
			}).then(() => {

				Thunder.notify('success', context.m('markAsReceivedSuccess'));

				return Thunder.render($container, implementation.name, $.extend(context.options, {
					updateTransactions: false
				}));

			}, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors
			));

		}

		function markAsNotReceived() {

			const errors = {
				'invalid-order-status': context.m('invalidOrderStatus'),
				default: context.m('markAsNotReceivedFailed'),
			};

			return Thunder.request({
				method: 'DELETE',
				url:    `/v1/me/orders/${order._id}/received`,
			}).then(() => {

				Thunder.notify('success', context.m('markAsNotReceivedSuccess'));

				return Thunder.render($container, implementation.name, $.extend(context.options, {
					updateTransactions: false
				}));

			}, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors
			));

		}

		function startCancellation() {
			$(this).addClass('hidden');
			$cancellationForm.removeClass('hidden');
			$cancellationReason.focus();
		}

		function cancelOrder(event) {

			event.preventDefault();

			const data = Thunder.util.formToJSON($cancellationForm.serializeArray());

			const errors = {
				'invalid-order-status': context.m('invalidOrderStatus'),
				default: context.m('cancellationFailed'),
			};

			const resetState = () => {
				cancelButtonSpinner.done();
			};

			return Thunder.request({
				method: 'POST',
				url:    `/v1/me/orders/${order._id}/cancellation`,
				data:   data,
			}).then(() => {

				resetState();

				Thunder.notify('success', context.m('cancellationSuccess'));

				return Thunder.render($container, implementation.name, $.extend(context.options, {
					updateTransactions: false
				}));

			}, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors,
				resetState
			));

		}

		function requestRefund() {
			Thunder.execute(
				context.options.onRequestRefund,
				$container,
				context,
				order
			);
		}

		function startRefundCancellation(event) {

			event.preventDefault();

			const $refund = $(this).parents('[data-refund]');
			const $cancellationForm = $refund.find('.thunder--refund-cancellation-form');

			$(this).addClass('hidden');
			$cancellationForm.removeClass('hidden');

		}

		function cancelRefund(event) {

			event.preventDefault();

			const $refund = $(this).parents('[data-refund]');
			const $cancellationForm = $refund.find('.thunder--refund-cancellation-form');
			const refundId = $refund.data('refund');

			const data = Thunder.util.formToJSON($cancellationForm.serializeArray());

			return cancel().then(() => {
				Thunder.notify('success', context.m('refundCancellationSuccess'));
				return Thunder.render($container, implementation.name, $.extend(context.options, {
					updateTransactions: false
				}));
			});

			function cancel() {

				const errors = {
					'invalid-refund-status': context.m('invalidRefundStatus'),
					default:                 context.m('refundCancellationFailed')
				};

				return Thunder.request({
					method: 'POST',
					url:    `/v1/me/orders/${order._id}/refunds/${refundId}/cancellation`,
					data:   data
				}).then(null, err => Thunder.util.requestErrorHandler(
					err.responseJSON,
					errors
				));

			}

		}

	};

	return implementation;

};
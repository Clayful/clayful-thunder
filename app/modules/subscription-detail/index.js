const get = require('lodash.get');
const set = require('lodash.set');
const camelCase = require('lodash.camelcase');

module.exports = Thunder => {

	const implementation = {
		name: 'subscription-detail'
	};

	implementation.options = () => ({
		subscription:    '', // Subscription ID to render
		customerFields:  Thunder.options.customerOrderFields.map(field => field.split(':')[0]),
		recipientFields: Thunder.options.recipientFields.map(field => field.split(':')[0]),
	});

	implementation.pre = function(context, callback) {

		const { subscription } = context.options;

		context.couponDetail = coupon => {

			if (!coupon) return '';

			return [
				context.m('discountedBy', { value: coupon.discount.value.converted }),
				'&#10;(',
				context.m(({
					first: 'firstNTimesDiscounted',
					last:  'lastNTimesDiscounted',
					every: 'allDiscounted',
				})[coupon.subscription.type], {
					count: get(coupon.subscription, 'value.converted'),
					smart_count: get(coupon.subscription, 'value.raw'),
				}),
				')'
			].join('');

		};

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

		const errors = {
			default: context.m('subscriptionReadFailed')
		};

		return Thunder.request({
			method: 'GET',
			url:    `/v1/me/subscriptions/${subscription}`,
		}).then(subscription => {

			const itemMap = subscription.items.reduce((o, item) => {
				return [].concat(item, item.bundleItems || []).reduce((o, item) => {
					return set(o, item._id, item);
				}, o);
			}, {});

			const discount = subscription.discount || {};

			Object.keys(discount).forEach(scope => {

				if (scope === 'shipping') {
					// IMPORTANT: For now we will only display 'items' and 'cart' coupons
					return;
				}

				[].concat(discount[scope]).forEach(({ item, coupon }) => {

					if (!coupon) return;

					return item ?
							set(itemMap[item._id], 'appliedCoupon', coupon) :
							set(subscription, 'appliedCoupon', coupon);
				});

			});

			const scheduleStatus = subscription.status === 'cancelled' ? 'cancelled' : null;

			subscription.schedules.forEach(schedule => {
				// When the subscription is cancelled,
				// make all schedules' statuses as 'cancelled' as well unless a schedule is 'done'.
				schedule.status = schedule.status === 'done' ?
									schedule.status :
									scheduleStatus || schedule.status;
			});

			context.subscription = subscription;

			// Set payment details.
			const paymentMethod = subscription.paymentMethod;

			const thunderPaymentMethodMap =
				Thunder.options.paymentMethods.subscription
					.reduce((o, p) => set(o, p.id, p), {});

			const thunderPaymentMethod =
				thunderPaymentMethodMap[paymentMethod._id] ||
				thunderPaymentMethodMap[paymentMethod.slug];

			const shouldPay =
				subscription.status === 'pending' &&
				thunderPaymentMethod;

			context.paymentMethod = thunderPaymentMethod;
			context.shouldPay = shouldPay;

			return callback(null, context);

		}, err => Thunder.util.requestErrorHandler(
			err.responseJSON,
			errors,
			callback
		));

	};

	implementation.init = function(context) {

		const {
			subscription,
			paymentMethod,
			shouldPay
		} = context;

		const $container = $(this);
		const $backToSubscriptions = $(this).find('.thunder--back-to-subscriptions');
		const $cancelSubscription = $(this).find('.thunder--cancel-subscription');
		const $cancellationForm = $(this).find('.thunder--subscription-cancellation-form');
		const $cancellationReason = $cancellationForm.find('textarea');
		const $cancelButton = $cancellationForm.find('button');
		const $viewOrder = $(this).find('[data-order][data-status="done"]');
		const $omittedSchedules = $(this).find('.thunder--subscription-omitted-schedules');
		const $viewAllSchedules = $(this).find('.thunder--view-all-schedules');
		const $hiddenSchedules = $(this).find('.thunder--subscription-schedule.hidden');

		const cancelButtonSpinner = Thunder.util.makeAsyncButton($cancelButton);

		$cancelSubscription.on('click', startCancellation);
		$cancelButton.on('click', cancelSubscription);
		$viewAllSchedules.on('click', viewAllSchedules);
		$viewOrder.on('click', '.thunder--schedule-order', event => {
			return Thunder.render($container, 'order-detail', {
				order: $(event.delegateTarget).data('order'),
				back: {
					$container: $container,
					component:  implementation.name,
					options:    context.options
				}
			});
		});

		Thunder.util.bindBackButton($backToSubscriptions, context);

		// Render a payment form if it's needed.
		if (shouldPay) {

			const $paymentFormContainer = $(this).find('.thunder--payment-form-container');
			const $makePayment = $(this).find('.thunder--make-payment');
			const makePaymentSpinner = Thunder.util.makeAsyncButton($makePayment, { bind: false });

			Thunder.render($paymentFormContainer, 'payment-form', {
				type: 'subscription',
				paymentMethods: [paymentMethod.id]
			}, (err, { interfaces: paymentHandler }) => $makePayment.on('click', () => {

				const validationError = paymentHandler.validate();

				if (validationError) {
					return Thunder.notify('error', validationError.message);
				}

				const card = paymentHandler.getCard();

				makePaymentSpinner.run();

				return paymentHandler.makePayment({
					subscription: subscription,
					customer:     subscription.customer
				}, err => {

					if (err) {
						Thunder.notify('error', context.m('paymentFailed'));
						return makePaymentSpinner.done();
					}

					const errors = {
						default: context.m('schedulingFailed')
					};

					return Thunder.request({
						method: 'POST',
						url:    `/v1/me/subscriptions/${subscription._id}/scheduled`,
						data:   card ? { card } : {}
					}).then(() => {

						Thunder.notify('success', context.m('schedulingSuccess'));
						makePaymentSpinner.done();
						return Thunder.render($container, implementation.name, context.options);

					}, err => Thunder.util.requestErrorHandler(
						err.responseJSON,
						errors,
						() => makePaymentSpinner.done()
					));

				});

			}));
		}

		function startCancellation() {
			$(this).addClass('hidden');
			$cancellationForm.removeClass('hidden');
			$cancellationReason.focus();
		}

		function cancelSubscription(event) {

			event.preventDefault();

			const data = Thunder.util.formToJSON($cancellationForm.serializeArray());

			const errors = {
				'invalid-subscription-status': context.m('invalidSubscriptionStatus'),
				default: context.m('cancellationFailed'),
			};

			const resetState = () => {
				cancelButtonSpinner.done();
			};

			return Thunder.request({
				method: 'POST',
				url:    `/v1/me/subscriptions/${subscription._id}/cancellation`,
				data:   data,
			}).then(() => {

				resetState();

				Thunder.notify('success', context.m('cancellationSuccess'));

				return Thunder.render($container, implementation.name, context.options);

			}, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors,
				resetState
			));

		}

		function viewAllSchedules() {
			$omittedSchedules.addClass('hidden');
			$hiddenSchedules.removeClass('hidden');
		}

	};

	return implementation;

};
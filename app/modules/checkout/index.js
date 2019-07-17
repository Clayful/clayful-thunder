const get = require('lodash.get');
const set = require('lodash.set');
const camelCase = require('lodash.camelcase');
const CouponHandler = require('./lib/couponHandler.js');
const CustomerHandler = require('./lib/customerHandler.js');
const AddressHandler = require('./lib/addressHandler.js');
const SubscriptionHandler = require('./lib/subscriptionHandler.js');
const RecaptchaHandler = require('./lib/recaptchaHandler.js');

module.exports = Thunder => {

	const translationKeys = {
		'name.first': 'firstName',
		'name.last':  'lastName',
		'name.full':  'fullName',
	};

	const implementation = {
		name: 'checkout'
	};

	implementation.options = () => ({
		type:              'order', // 'order' or 'subscription'
		items:             null,    // Item filter - e.g., ['item1', 'item2', ...]
		customerFields:    Thunder.options.customerOrderFields,
		recipientFields:   Thunder.options.recipientFields,
		addressDisabled:   Thunder.options.addressDisabled,
		subscriptionPlans: Thunder.options.subscriptionPlans,
		termsLink:         Thunder.options.legal.orderTerms.link,
		termsText:         Thunder.options.legal.orderTerms.text,
		privacyLink:       Thunder.options.legal.orderPrivacy.link,
		privacyText:       Thunder.options.legal.orderPrivacy.text,
		onCheckoutSuccess: function($container, context, checkoutDetail) {

			const { order, subscription } = checkoutDetail;

			return Thunder.render($container, 'checkout-success', {
				type:    subscription ? 'subscription' : 'order',
				subject: (subscription || order)._id,
			});
		},
		onPaymentFailure: function($container, context, checkoutDetail) {

			const { order, subscription } = checkoutDetail;
			const type = subscription ? 'subscription' : 'order';

			Thunder.notify('error', context.m('paymentFailed'));

			return Thunder.render($container, `${type}-detail`, {
				[type]: (subscription || order)._id
			});

		}
	});

	implementation.pre = function(context, callback) {

		const {
			type,
			items,
			customerFields,
			recipientFields,
			subscriptionPlans,
			termsLink,
			termsText,
			privacyLink,
			privacyText,
		} = context.options;

		context.agreements = [
			(termsLink || termsText) ? 'terms' : null,
			(privacyLink || privacyText) ? 'privacy' : null,
		].filter(v => v);

		const $container = $(this);

		const defaultCartQuery = items ? { items: items.toString() } : {};
		const defaultCartData = {};

		const disabledAddressFields =
			Thunder.util.parseArrayString(context.options.addressDisabled)
				.reduce((o, field) => set(o, field, true), {});

		context.isSubscription = context.options.type === 'subscription';

		context.useSearchAddress = !!Thunder.plugins.searchAddress;

		context.disabled = field => {
			return disabledAddressFields[field] &&
					context.useSearchAddress ? 'readonly' : '';
		};

		const toFieldDetail = (prefix = '') => field => {

			const [key, required] = field.split(':');

			return {
				required:       required === 'required',
				key:            key,
				translationKey: camelCase([prefix, translationKeys[key] || key])
			};

		};

		context.customerFields =
			Thunder.util.parseArrayString(customerFields)
				.map(toFieldDetail('customer'));

		context.recipientFields =
			Thunder.util.parseArrayString(recipientFields)
				.map(toFieldDetail('address'));

		const requestFailed = err => Thunder.util.requestErrorHandler(
			err.responseJSON,
			{
				default: context.m('checkoutPreparationFailed')
			},
			callback
		);

		return $.when(Thunder.authenticated() ? Thunder.request({
			method: 'GET',
			url:    '/v1/me',
			query:  {
				raw:    true,
				fields: [
					'name',
					'email',
					'mobile',
					'phone',
					'gender',
					'birthdate',
					'country',
					'language',
					'currency',
					'timezone',
					'address.primary',
				].join(',')
			}
		}) : null).then(customer => {

			const primaryAddress = get(customer, 'address.primary', null);

			if (primaryAddress) {

				defaultCartData.address = {
					shipping: primaryAddress,
					billing:  primaryAddress
				};
			}

			context.customer = customer || null;
			context.address = primaryAddress || AddressHandler.defaultAddress();

			return $.when(
				Thunder.request({
					method: 'GET',
					url:    '/v1/countries',
					query:  { fields: 'code' }
				}),
				getCart({
					query: defaultCartQuery,
					data:  defaultCartData,
				}),
				Thunder.authenticated() ? Thunder.request({
					method: 'GET',
					url:    '/v1/me/coupons',
					query:  {
						limit: 120,
						fields: [
							'name',
							'active',
							'only',
							'type',
							'discount',
							'category',
							'price',
							'subscription',
							'expiresAt'
						].join(',')
					},
				}) : null,
				context.isSubscription ? Thunder.request({
					method: 'GET',
					url:    '/v1/subscriptions/plans',
					query: {
						ids:    subscriptionPlans.map(({ id }) => id).join(','),
						fields: ['name', 'immediate', 'interval'].join(','),
						sort:   'ids',
					}
				}) : null
			);

		}, requestFailed).then((countries, cart, coupons, plans) => {

			const hasCartError = cart[0].cart.errors
									.some(err => err.code !== 'shipping-address-required');

			if (hasCartError) {
				return Thunder.render($container, 'cart', {
					orderActions: Object.keys(Thunder.options.paymentMethods),
					items:        context.options.items
				});
			}

			context.countries = countries[0];
			context.cart = cart[0].cart;
			context.subscription = cart[0].subscription || null;
			context.subscriptionPlans = (plans ? plans[0] : []).map(plan => {
				return $.extend(plan, subscriptionPlans.find(s => s.id === plan._id));
			});
			context.coupons = coupons ? coupons[0] : [];

			CouponHandler.setApplicableCoupons(
				context.options.type,
				context.cart,
				context.coupons
			);

			return callback(null, context);

		}, requestFailed);

	};

	implementation.init = function(context) {

		const $paymentFormContainer = $(this).find('.thunder--payment-form-container');

		Thunder.render($paymentFormContainer, 'payment-form', {
			type: context.options.type
		}, (err, { interfaces: paymentHandler }) => {

			const $container = $(this);
			const $backToCart = $(this).find('.thunder--back-to-cart');
			const $cartItems = $(this).find('.thunder--cart-items table');
			const $goToUpdateCustomer = $(this).find('.thunder--go-to-update-customer');
			const $sameForRecipient = $(this).find('[name="sameForRecipient"]');
			const $saveAsPrimaryAddress = $(this).find('#thunder--save-primary-address-agreement');
			const $searchAddress = $(this).find('.thunder--search-address');
			const $disabledAddressInputs = $(this).find('.thunder--address-location div [readonly]').parent();
			const $applyAddress = $(this).find('.thunder--apply-address');
			const $orderRequest = $(this).find('[name="request"]');
			const $totalDetails = $(this).find('.thunder--total-details');
			const $proceedCheckout = $(this).find('.thunder--proceed-checkout');
			const processCheckoutSpinner = Thunder.util.makeAsyncButton($proceedCheckout, { bind: false });

			const areTermsAgreed = Thunder.util.bindAgreements({
				$terms: $(this).find('[data-agreement-scope]'),
				agreements: {
					terms:   {
						text:  context.options.termsText,
						link:  context.options.termsLink,
						error: context.m('termsAgreementRequired')
					},
					privacy: {
						text:  context.options.privacyText,
						link:  context.options.privacyLink,
						error: context.m('privacyAgreementRequired')
					},
				}
			});

			const couponHandler = CouponHandler({
				form:    $(this).find('.thunder--cart-items'),
				labels:  {
					applyCoupons:          context.m('applyCoupons'),
					finishApplyingCoupons: context.m('finishApplyingCoupons'),
				},
				coupons:             context.coupons,
				cart:                () => context.cart,
				onCouponApply:       type => applyCoupons(type),
				onCouponSelectError: code => Thunder.notify('error', context.m(code))
			});

			const customerHandler = CustomerHandler({
				customerFields: context.customerFields.map(({ key, required }) => ({
					field:    key,
					required: required
				}))
				.map(detail => $.extend(detail, {
					$input: $(this).find(`.thunder--customer [name="customer.${detail.field}"]`)
				})),
				translationKeys: translationKeys,
			});

			const addressHandler = AddressHandler({
				addressFields: [
					...context.recipientFields.map(({ key, required }) => ({
						field:     key,
						recipient: true,
						required:  required
					})),
					{ field: 'country', required: true },
					{ field: 'state', required: false },
					{ field: 'city', required: true },
					{ field: 'address1', required: true },
					{ field: 'address2', required: false },
					{ field: 'postcode', required: true },
				].map(detail => $.extend(detail, {
					$input: $(this).find([
						'.thunder--recipient-info',
						'.thunder--address',
					].join(','))
					.find(`[name="address.${detail.field}"]`)
				})),
				translationKeys:     translationKeys,
				searchAddressPlugin: Thunder.plugins.searchAddress
			});

			const debouncedApplySubscriptionDetail = Thunder.util.debounce(
				applySubscriptionDetail,
				100,
				true
			);

			const subscriptionHandler = SubscriptionHandler({
				form:              $(this).find('.thunder--subscription-details'),
				labels:            {
					firstOrderStartsAt:  context.m('firstOrderStartsAt'),
					secondOrderStartsAt: context.m('secondOrderStartsAt'),
				},
				subscriptionPlans: context.subscriptionPlans,
				timezone:          () => Thunder.options.timezone,
				onPlanChange:      () => debouncedApplySubscriptionDetail(),
				onStartsAtChange:  () => debouncedApplySubscriptionDetail()
			});

			Thunder.util.bindBackButton($backToCart, context);

			customerHandler.setCustomer(context.customer);
			addressHandler.setAddress(context.address);

			$sameForRecipient.on('change', copyToRecipient);
			$applyAddress.on('click', applyChanges);
			$searchAddress.on('click', searchAddress);
			$disabledAddressInputs.on('click', searchAddress);

			$goToUpdateCustomer.on('click', () => {
				return Thunder.render($container, 'customer-update', {
					back:  {
						$container: $container,
						component:  implementation.name,
						options:    context.options
					}
				});
			});

			// It's a bit hacky way to handle reCAPTCHA,
			// but if a store uses reCATPCHA for checkout and order/subscription auth,
			// bind reCATPCHA twice for the same button to get two reCAPTCHA responses.
			const recaptchaComponents = [
				implementation.name,
				'search-purchase'
			];

			const recaptchaHandler = RecaptchaHandler(
				recaptchaComponents
					.filter(Thunder.util.useRecaptcha)
					.reduce((o, c) => set(o, c, true), {})
			);

			recaptchaComponents.forEach(componentName => Thunder.util.makeRecaptcha({
				componentName: componentName,
				button:        $proceedCheckout,
				validate:      validateCheckoutData,
				callback:      proceedCheckout
			}));

			function copyToRecipient() {
				return $(this).is(':checked') ?
						addressHandler.setAddress(customerHandler.getCustomer()) :
						addressHandler.reset('recipient');
			}

			function applyChanges() {

				const options = buildCartOptions();
				const address = options.data.address.shipping;
				const discount = options.data.discount;

				const addressError = addressHandler.validateAddress(address, false);

				// Validate shipping address
				if (addressError) {
					return Thunder.notify('error', context.m(addressError));
				}

				const oldCartItems = $cartItems.html();
				const oldTotalDetails = $totalDetails.html();
				const sectionSpinner = Thunder.ui('section-spinner')();

				$cartItems.html(`<tr><td>${sectionSpinner}</td></tr>`);
				$totalDetails.html(sectionSpinner);

				const errors = {
					'invalid-postcode':     context.m('invalidPostcode'),
					'starts-too-early':     context.m('startsTooEarly'),
					'cart-coupon-category': context.m('cartCouponCategory'),
					'cart-coupon-price':    context.m('cartCouponPrice'),
					default:                context.m('cartUpdateFailed'),
				};

				return getCart(options).then(({ cart, subscription }) => {

					const cartHasItemError = cart.errors.some(error => error.code === 'item-error');

					if (cartHasItemError) {
						Thunder.notify('error', context.m('invalidCartItemIncluded'));
						return Thunder.render($container, 'cart', {
							orderActions: Object.keys(Thunder.options.paymentMethods),
							items:        context.options.items
						});
					}

					context.cart = cart;
					context.subscription = subscription || null;

					CouponHandler.setApplicableCoupons(
						context.options.type,
						context.cart,
						context.coupons
					);

					if (discount) {

						if (discount.items) {
							discount.items.forEach(({ item, coupon }) => set(
								context.cart.items.find(({ _id }) => _id === item),
								'appliedCoupon',
								couponHandler.getCoupon(coupon)
							));
						}

						if (discount.cart) {
							context.cart.appliedCoupon = couponHandler.getCoupon(discount.cart.coupon);
						}

					}

					const $template = $(Thunder.component(implementation.name).template(context));

					$cartItems.html($template.find('.thunder--cart-items table').html());
					$totalDetails.html($template.find('.thunder--total-details').html());

					couponHandler.bindCouponValidator();

				}, err => Thunder.util.requestErrorHandler(
					err.responseJSON,
					errors,
					err => {
						$cartItems.html(oldCartItems);
						$totalDetails.html(oldTotalDetails);
					}
				));

			}

			function validateCheckoutData() {

				const agreed = areTermsAgreed();

				if (!agreed) {
					return false;
				}

				const options = buildCartOptions('checkout');

				const {
					address,
					subscription,
				} = options.data;

				// Validate customer
				const customer = customerHandler.getCustomer();
				const customerError = customerHandler.validateCustomer(customer);

				if (customerError) {
					Thunder.notify('error', context.m(customerError));
					return false;
				}

				// Validate addresses
				const addressErrors = [
					address.shipping,
					address.billing
				]
				.map(addressHandler.validateAddress)
				.filter(v => v);

				if (addressErrors[0]) {
					Thunder.notify('error', context.m(addressErrors[0]));
					return false;
				}

				const paymentError = paymentHandler.validate();

				if (paymentError) {
					Thunder.notify('error', paymentError.message);
					return false;
				}

				if (context.isSubscription) {
					// Validate only if checkout process is for a subscription
					const subscriptionError = subscriptionHandler.validateSubscriptionDetail(subscription);

					if (subscriptionError) {
						Thunder.notify('error', context.m(subscriptionError));
						return false;
					}
				}

				return true;

			}

			function proceedCheckout(token, resetRecaptcha) {

				const shouldExecute = recaptchaHandler.execute(token);

				if (!shouldExecute) return;

				const {
					checkout:          checkoutRes,
					'search-purchase': searchPurchaseRes
				} = shouldExecute;

				processCheckoutSpinner.run();

				const options = buildCartOptions('checkout');
				const customer = customerHandler.getCustomer();
				const card = paymentHandler.getCard();
				const [paymentMethodId] = options.data.paymentMethod.split('.');

				if (checkoutRes) {
					// Set reCAPTCHA response
					options.recaptcha = checkoutRes;
				}

				options.data.paymentMethod = paymentMethodId;

				if (!Thunder.authenticated()) {
					// Set customer details only for non-registered customers
					options.data.customer = customer;
				}

				const checkoutFinished = (successDetail) => {

					processCheckoutSpinner.done();

					if (resetRecaptcha) {
						resetRecaptcha();
					}

					if (!successDetail) return;

					if (!Thunder.authenticated()) {
						// Delete ordered items from the local cart
						context.cart.items.forEach(item => Thunder.Cart.deleteItem(item._id, $.noop));
					}

					return Thunder.execute(
						context.options.onCheckoutSuccess,
						$container,
						context,
						successDetail
					);
				};

				let order;
				let subscription;

				const authByOrderOrSubscription = {
					run: ({ order: o, subscription: s }) => {

						if ($saveAsPrimaryAddress.is(':checked')) {
							// Update the primary address (Fire & Forget)
							const options = buildCartOptions('checkout');

							Thunder.request({
								method: 'PUT',
								url:    `/v1/me`,
								data:   {
									address: {
										primary: options.data.address.shipping
									}
								}
							});
						}

						order = o;
						subscription = s || null;

						const type = context.options.type;
						const subject = context.isSubscription ? s : o;

						const options = {
							data: Thunder.options.orderAuthFields.reduce((o, field) => {
								return set(o, field, get(subject.customer, field, null));
							}, {})
						};

						if (searchPurchaseRes) {
							options.recaptcha = searchPurchaseRes;
						}

						// Authenticate by an order or a subscription
						return auth(type, subject._id, options);

					},
					fail: err => Thunder.util.requestErrorHandler(
						err.responseJSON,
						{
							default: context.m('checkoutProcessFailed')
						},
						err => checkoutFinished()
					)
				};

				const persistTokenAndMakePayment = {
					run: authResult => {

						if (authResult) {

							const token = authResult.token;
							const storage = Thunder.plugins.credentialStorage;

							// Set auth token in the storage,
							// preferably in sessionStorage to take care of redirections from payment services.
							storage.setItem(Thunder.options.authStorage.order, token);
						}

						return paymentHandler.makePayment({
							cart:          context.cart,
							order:         order,
							subscription:  subscription,
							customer:      customer,
						}, err => {

							if (err) {

								checkoutFinished();

								return Thunder.execute(
									context.options.onPaymentFailure,
									$container,
									context,
									{ order, subscription }
								);
							}

							if (!subscription) {
								// Regular order case
								return checkoutFinished({ order, subscription });
							}

							const options = {
								data: card ? { card } : {}
							};

							// Subscription case, post schedules and finish.
							return scheduleSubscription(subscription._id, options).then(() => {

								return checkoutFinished({ order, subscription });

							}, err => Thunder.util.requestErrorHandler(
								err.responseJSON,
								{
									default: context.m('scheduleFailed')
								},
								err => checkoutFinished()
							));

						});

					}
				};

				const checkoutErrorHandler = err => Thunder.util.requestErrorHandler(
					err.responseJSON,
					{
						default: context.m('checkoutFailed')
					},
					err => checkoutFinished()
				);

				// Checkout
				checkout(options).then(
					authByOrderOrSubscription.run,
					checkoutErrorHandler
				).then(
					persistTokenAndMakePayment.run,
					authByOrderOrSubscription.fail
				);

			}

			function buildCartOptions(type = 'calculate') {

				const address = addressHandler.getAddress();
				const discount = couponHandler.getDiscountDetails();

				const options = {
					query: {},
					data:  {},
				};

				// Filter items
				if (context.options.items) {
					options.query = { items: context.options.items.toString() };
				}

				// Set address
				if (address) {
					options.data.address = { shipping: address, billing: address };
				}

				// Set subscription details
				if (context.isSubscription) {

					const subscription = subscriptionHandler.getSubscriptionDetail();

					if (subscription && subscription.plan) {
						options.data.subscription = subscription;
					}

				}

				// Apply discount (coupons)
				if (Object.keys(discount).length) {
					options.data.discount = discount;
				}

				// Request options for checkout
				if (type === 'checkout') {
					options.data.currency = context.cart.currency.payment.code;
					options.data.paymentMethod = paymentHandler.getPaymentMethodId();
					options.data.request = $orderRequest.val() || null;
				}

				return options;

			}

			function searchAddress() {

				if (couponHandler.isApplying()) {
					return Thunder.notify('error', context.m('applyCouponsFirst'));
				}

				addressHandler.searchAddress(err => {

					return err ?
							Thunder.notify('error', err.message) :
							applyChanges();
				});

			}

			function applyCoupons(type) {

				if (context.isSubscription) {

					const detail = subscriptionHandler.getSubscriptionDetail();

					if (!detail || !detail.plan) {
						Thunder.notify('error', context.m('selectSubscriptionPlanFirst'));
						return false; // Block further executions
					}

				}

				if (type === 'end') {
					applyChanges();
				}

				return true;

			}

			function applySubscriptionDetail() {

				const detail = subscriptionHandler.getSubscriptionDetail();
				const error = subscriptionHandler.validateSubscriptionDetail(detail);

				if (error === 'subscriptionPlanRequired') {
					return Thunder.notify('error', context.m(error));
				}

				if (error === 'subscriptionStartsAtRequired') {
					return;
				}

				return applyChanges();
			}

		});

	};

	function getCart(options = {}) {

		if (!Thunder.authenticated()) {
			set(options, 'data.items', Thunder.Cart.items);
		}

		return Thunder.request($.extend({
			method: 'POST',
			url:    Thunder.authenticated() ?
					'/v1/me/cart' :
					'/v1/me/non-registered/cart'
		}, options));

	}

	function checkout(options = {}) {

		const type = options.data.subscription ? 'subscription' : 'order';

		if (!Thunder.authenticated()) {
			set(options, 'data.items', Thunder.Cart.items);
		}

		return Thunder.request($.extend({
			method: 'POST',
			url:    Thunder.authenticated() ?
					`/v1/me/cart/checkout/${type}` :
					`/v1/me/non-registered/cart/checkout/${type}`
		}, options));

	}

	function auth(type, id, options = {}) {

		if (Thunder.authenticated()) {
			return null;
		}

		return Thunder.request($.extend({
			method: 'POST',
			url:    type === 'order' ?
					`/v1/orders/${id}/auth` :
					`/v1/subscriptions/${id}/auth`
		}, options));

	}

	function scheduleSubscription(subscriptionId, options) {

		return Thunder.request($.extend({
			method: 'POST',
			url:    `/v1/me/subscriptions/${subscriptionId}/scheduled`,
		}, options));

	}

	return implementation;

};
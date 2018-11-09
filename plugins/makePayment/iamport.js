/**
 * Based on Iamport's JavaScript SDK.
 * - Iamport's JavaScript SDK should be imported before this plugin.
 * - `IMP.init('id');` should be called before `makePayment` gets called.
 * - Website: http://iamport.kr/
 * - Guide: https://docs.iamport.kr/
 */

const RedirectionError = options => {

	const {
		code,
		type,
		subject,
		message
	} = options;

	const err = new Error(message);

	err.code = code;
	err.type = type;
	err.subject = subject;

	return err;
};

const implementation = (options = {}) => {

	const {
		// Set redirection URL for mobile payments (If it's necessary).
		// Default value is the root URL of the website.
		// Reference: https://docs.iamport.kr/implementation/payment#mobile-web-1
		redirectURL = data => {

			const location = window.location;
			const type = data.subscription ? 'subscription' : 'order';

			// `?type` query is required.
			return `${location.protocol}//${location.host}?type=${type}`;
		},
		// Billing key name placeholder.
		billingKeyName = 'Billing Key',
		// Order name getter. Recommended max length -> 16
		orderName = cart => (cart.items[0].product.name || '').slice(0, 16),
		// Customer name getter.
		buyerName = customer => customer.name.full,
		// Address getter.
		buyerAddress = address => [
			address.address1,
			address.address2
		].filter(v => v).join(' ').trim(),
		// Mobile payment redirection handler.
		redirectionCallback = () => {}
	} = options;

	// Handle mobile redirections automatically
	implementation.handleRedirect(redirectionCallback);

	return (data = {}, callback) => {

		const {
			paymentMethod,
			cart,
			order,
			subscription,
			customer,
		} = data;

		if (paymentMethod.cardFields) {
			// Since Iamport doesn't support manual payment with card information,
			// do not call `IMP.request_pay` method.
			return callback(null, {});
		}

		const subject = subscription || order;
		const address = subject.address.shipping;
		const currency = subject.currency.payment.code;

		const taxFree = cart ? implementation.calculateTaxFree(cart) : null;

		// Default request options for orders and subscriptions
		const params = $.extend({
			pg:             paymentMethod.meta.pg,
			pay_method:     paymentMethod.meta.payMethod,
			currency:       currency,
			buyer_email:    customer.email || null,
			buyer_name:     buyerName(customer),
			buyer_tel:      customer.mobile || customer.phone, // Required by Iamport
			buyer_addr:     buyerAddress(address),
			buyer_postcode: address.postcode,
			m_redirect_url: redirectURL(data) // Set redirect URL if is needed...
		}, subscription ? {
			// Subscription case, Issue a billing key for subscriptions.
			// Reference: https://github.com/iamport/iamport-manual/tree/master/%EB%B9%84%EC%9D%B8%EC%A6%9D%EA%B2%B0%EC%A0%9C/example
			merchant_uid: subscription._id, // Set `merchant_uid` as a subscription's id
			// Billing key will be issued..
			// For a registered customer: customer._id
			// For a non-registered customer: subscription._id
			customer_uid: subscription.customer._id || subscription._id,
			name:         billingKeyName,   // Placeholder name
			amount:       0,
		} : $.extend({
			// Regular order case.
			merchant_uid: order._id,
			name:         orderName(cart),
			// Handle rich data cases.
			amount:       typeof order.total.amount.raw === 'number' ?
							order.total.amount.raw :
							order.total.amount,
		}, taxFree ? {
			// `tax_free` param is only supported for regular orders for now.
			tax_free: taxFree
		} : {}));

		return IMP.request_pay(params, res => {
			return callback(res.success ? null : res, res);
		});

	};

};

implementation.calculateTaxFree = cart => {

	const isZeroTaxed = item => item.taxed.convertedRaw === 0;

	// Handle `tax_free` parameter of Iamport for tax exempted & zero-rated products.
	// Reference: https://docs.iamport.kr/tech/vat
	const itemsWithZeroTax = [].concat(
		// Zero taxed items
		cart.items
			.reduce((items, item) => items.concat(item, item.bundleItems || []), [])
			.filter(isZeroTaxed)
			.map(item => item.price.withTax.convertedRaw),
		// Zero taxed shipment
		(cart.shipments || [])
			.filter(isZeroTaxed)
			.map(shipment => shipment.fee.withTax.convertedRaw)
	).filter(v => v !== 0); // Just in case where an actual item/shipment's price is 0

	if (itemsWithZeroTax.length === 0) {
		// There are no zero taxed items and shipments
		return null;
	}

	// Build a sum price of tax free items and shipments.
	// It is important that we use the payment currency's precision to calculate sum.
	// Reference: https://stackoverflow.com/questions/1458633/how-to-deal-with-floating-point-number-precision-in-javascript
	const precision = cart.currency.payment.precision;

	let sum = itemsWithZeroTax.reduce((sum, v) => sum + v, 0);

	if (precision > 0) {
		sum = parseFloat(parseFloat(sum).toPrecision(precision));
	}

	return sum;

};

implementation.handleRedirect = callback => {

	const Thunder = window.Thunder;
	const query = Thunder.util.urlQuery();

	const types = {
		order:        true,
		subscription: true,
	};

	if (types[query.type] && query.merchant_uid) {

		const {
			imp_success:  success,
			type:         type,
			merchant_uid: subject
		} = query;

		// Payment failure case...
		if (success !== 'true') {

			return callback(RedirectionError({
				code:    'iamport-payment',
				message: 'Failed to make a payment.',
				type:    type,
				subject: subject
			}));
		}

		// Payment success case...
		if (type === 'order') {
			// Regular order case
			return callback(null, { type, subject });
		}

		// Subscription case, we should post schedules to Iamport via Clayful's API
		return Thunder.request({
			method: 'POST',
			url:    `/v1/me/subscriptions/${subject}/scheduled`,
			data:   {},
		}).then(() => {
			// Scheduling succeeded...
			return callback(null, { type, subject });
		}, err => {
			// Scheduling failed...
			return callback(RedirectionError({
				code:    'clayful-schedule',
				message: 'Failed to post schedules.',
				type:    type,
				subject: subject
			}));
		});

	}

};

window.ThunderMakePaymentIamport = implementation;
const get = require('lodash.get');
const set = require('lodash.set');

const CouponHandler = ({
	form,
	labels = {
		applyCoupons: '',
		finishApplyingCoupons: '',
	},
	coupons,
	cart = () => {},
	onCouponApply = type => true,
	onCouponSelectError = code => {}

}) => {

	let applying = false;

	const couponMap = coupons.reduce((o, c) => set(o, c._id, c), {});

	const $applyCoupons = form.find('.thunder--apply-coupons');

	$applyCoupons.on('click', applyCoupons);

	bindCouponValidator();

	function isApplying() {
		return applying;
	}

	function getCoupon(couponId) {
		return couponMap[couponId];
	}

	function getCouponSelectors() {

		return form.find([
			'.thunder--cart-item-coupon',
			'.thunder--cart-coupon'
		].join(','));
	}

	function bindCouponValidator() {

		getCouponSelectors().on('change', validateCoupons);
	}

	function applyCoupons() {

		if (applying) {
			// Stop coupon selections
			if (!onCouponApply('end')) return;
			applying = false;
			$applyCoupons.text(labels.applyCoupons);
			getCouponSelectors().hide();

		} else {
			// Initialize coupon selections
			if (!onCouponApply('start')) return;
			applying = true;
			$applyCoupons.text(labels.finishApplyingCoupons);
			getCouponSelectors().show();
		}

	}

	function getDiscountDetails() {

		return getCouponSelectors().map(function() {

			const item = $(this).data('item') || null;
			const coupon = $(this).val();

			return { item, coupon };

		}).get().reduce((o, { item, coupon }) => {

			if (!coupon) return o;

			return item ?
					set(o, 'items', get(o, 'items', []).concat({ item, coupon })) :
					set(o, 'cart.coupon', coupon);
		}, {});

	}

	function validateCoupons() {

		const $selector = $(this);
		const itemId = $(this).data('item');
		const coupon = couponMap[$(this).val()];
		const item = cart().items.find(item => item._id === itemId);

		if (!coupon || !item) return null;

		let code = null;

		// Duplicated discount applications
		if (coupon.only &&
			item.discounts.length > 0) {
			code = 'alreadyDiscounted';
		}

		// Item's quantity must be 1 to apply a coupon
		if (item.quantity.raw !== 1) {
			code = 'mustBeOneQuantity';
		}

		// Duplicated coupon usage
		const selected = getCouponSelectors().map(function() {
			return $(this).is($selector) ? null : $(this).val();
		}).get().filter(v => v);

		if (selected.indexOf(coupon._id) >= 0) {
			code = 'duplicatedCoupon';
		}

		if (code) {
			$selector.val('');
			return onCouponSelectError(code);
		}

	}

	return {
		isApplying,
		getCoupon,
		bindCouponValidator,
		getDiscountDetails,
	};

};

CouponHandler.setApplicableCoupons = (orderType, cart, coupons) => {

	// Filter only applicable coupons
	const applicableCoupons = coupons.filter(c => {

		const { active, expiresAt, subscription } = c;

		// Filter coupons where:
		// - A coupon is active
		// - A coupon is for a subscription and the view is for subscriptions
		// - A coupon is for an order and the view is for orders
		// - A coupon has no expiration dates
		// - A coupon has an expiration date and it is not passed yet
		return active && (
					(orderType === 'subscription' && subscription.type) ||
					(orderType === 'order' && !subscription.type)
				) && (
					!expiresAt ||
					new Date(expiresAt.raw).valueOf() > new Date().valueOf()
				);
	});

	const productCoupons = applicableCoupons.filter(c => c.type === 'product');
	const cartCoupons = applicableCoupons.filter(c => c.type === 'cart');

	cart.items = cart.items.map(item => {

		item.applicableCoupons = productCoupons.filter(coupon => {

			return applicableByCategory(item, coupon.category) &&
					applicableByPrice(item, coupon.price);
		});

		return item;
	});

	cart.applicableCoupons = cartCoupons;

	function applicableByCategory(item, category) {

		const { brand, collections, product } = item;

		if (category.type === 'any') {
			return true;
		}

		const subjectsToTest = {
			brands:      [].concat(brand ? brand._id : []),
			collections: [].concat(...collections.map(({ path }) => path))
							.map(({ _id }) => _id),
			products:    [].concat(product ? product._id : []),
		};

		const categoryToTest = [
			'brands',
			'collections',
			'products'
		].find(c => category[c]);

		const toTest = subjectsToTest[categoryToTest];
		const pool = category[categoryToTest].map(({ _id }) => _id);

		if (category.type === 'include') {
			return pool.some(v => toTest.indexOf(v) >= 0);
		}

		if (category.type === 'exclude') {
			return pool.every(v => toTest.indexOf(v) === -1);
		}

	}

	function applicableByPrice(item, { min, max }) {

		const price = item.variant.price.sale.raw;

		return (
			(min === null || min.raw < price) &&
			(max === null || max.raw > price)
		);

	}

};

module.exports = CouponHandler;
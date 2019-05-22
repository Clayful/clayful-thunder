const set = require('lodash.set');
const camelCase = require('lodash.camelcase');

module.exports = Thunder => {

	const supportedComponents = () => [
		'customer-update',
		'customer-update-address',
		'order-list',
		Thunder.options.paymentMethods.subscription ?
			'subscription-list' :
			null,
		'customer-coupons',
		Thunder.options.productReview ?
			'customer-reviews' :
			null,
		Thunder.options.productReview &&
		Thunder.options.productReviewComment ?
			'customer-review-comments' :
			null,
		'customer-delete-account',
	].filter(v => v);

	// Implementation
	const implementation = {
		name: 'customer-dashboard'
	};

	implementation.options = () => $.extend({
		showLogout: Thunder.options.customerLogout,
		nav:   supportedComponents(),    // Navigation components
		focus: supportedComponents()[0], // Initial component to be focused

	}, supportedComponents().reduce((o, component) => {

		return set(o, camelCase(['onView', component]), function($container, context, $viewContainer) {
			return Thunder.render($viewContainer, component);
		});

	}, {}));

	implementation.pre = function(context, callback) {

		const translationKeys = {
			'customer-update':          'customerInfo',
			'customer-update-address':  'customerAddress',
			'order-list':               'orderList',
			'subscription-list':        'subscriptionList',
			'customer-coupons':         'customerCoupons',
			'customer-reviews':         'customerReviews',
			'customer-review-comments': 'customerReviewComments',
			'customer-delete-account':  'customerDeleteAccount'
		};

		context.nav = Thunder.util.parseArrayString(context.options.nav).map(component => ({
			key: component,
			translationKey: translationKeys[component]
		}));

		return callback(null, context);

	};

	implementation.init = function(context) {

		const $container = $(this);
		const $menu = $(this).find(`[data-component]`);
		const $viewContainer = $(this).find('.thunder--customer-dashboard-view');
		const $logout = $(this).find('.thunder--logout');

		viewComponent(context.options.focus);

		$menu.on('click', function() {
			return viewComponent($(this).data('component'));
		});

		function viewComponent(component) {

			$menu.removeClass('active');
			$container.find(`[data-component="${component}"]`).addClass('active');

			return Thunder.execute(
				context.options[camelCase(['onView', component])],
				$container,
				context,
				$viewContainer
			);
		}

		$logout.off();
		$logout.on('click', () => {
			Thunder.logout();
			Thunder.close();
		});

	};

	return implementation;

};
require('babel-polyfill');
require('imagesloaded');
require('jquery-form')(window, $);
require('jquery-match-height');

const Polyglot = require('node-polyglot');
const jstz = require('jstimezonedetect');
const mergeWith = require('lodash.mergeWith');

const Thunder = function(options) {

	const language = window.navigator.userLanguage ||
					window.navigator.language ||
					null;

	const timezone = jstz.determine().name();

	const overrideArray = (ov, sv) => {

		if (Array.isArray(ov) && Array.isArray(sv)) {
			return sv;
		}

	};

	options = mergeWith({
		client:        null,
		language:      language,
		currency:      null,
		timezone:      timezone,
		debugLanguage: language === 'ko' ? 'ko' : 'en',
		root:          `${location.protocol}//${location.host}`,
		baseURL:       null,
		authStorage:   {
			customer: '__tct__',
			order:    '__tot__',
		},
		dateInputFormat: 'YYYY-MM-DD',
		legal: {
			registrationTerms:   { link: null, text: null },
			registrationPrivacy: { link: null, text: null },
			orderTerms:          { link: null, text: null },
			orderPrivacy:        { link: null, text: null },
		},
		confirmation: {
			customerDelete:      true,
			couponDelete:        false,
			reviewDelete:        false,
			reviewCommentDelete: false,
		},
		productActions:  [
			'add-to-cart',
			'buy-now'
		],
		productLabels:        [
			// 'unavailable',
			// 'sold-out',
			// 'discounted'
		],
		productReview:        true,
		productReviewRating:  true,
		productReviewComment: true,
		paymentMethods:       {
			order:        [],
			subscription: []
		},
		refundReasonCategories:  [],
		subscriptionPlans:       [],
		customerAvatar:          true,
		customerDashboardLogout: false,
		customerIdentity:        [
			'name.full',
			'alias',
			'userId'
		],
		customerRegistrationFields: [
			'userId:required',
			'email:required',
			'password:required',
			// 'alias',
			// 'name.first',
			// 'name.last',
			'name.full:required',
			'mobile:required',
			'phone',
			// 'gender',
			// 'birthdate',
		],
		customerUpdateFields: [
			'userId',
			'email',
			// 'alias',
			// 'name.first',
			// 'name.last',
			'name.full:required',
			'mobile:required',
			'phone',
			// 'gender',
			// 'birthdate',
		],
		customerOrderFields: [
			// 'name.first',
			// 'name.last',
			'name.full:required',
			'email:required',
			'mobile:required',
			'phone',
		],
		recipientFields:   [
			// 'name.first',
			// 'name.last',
			'name.full:required',
			'mobile:required',
			'phone',
		],
		addressDisabled: [
			'country',
			'state',
			'city',
			'address1',
			'postcode'
		],
		orderAuthFields: [
			// 'userId',
			// 'alias',
			// 'email',
			// 'mobile',
			// 'phone',
			// 'name.first',
			// 'name.last',
			// 'name.full',
		],
		socialApps: [
			// 'facebook',
			// 'google',
			// 'instagram',
			// 'naver',
			// 'kakao',
		],
		header: false,
		recaptcha: {
			sitekey: null,
			onload:  'thunderRecaptcha',
			modules: [
				'customer-register',
				'customer-login',
				'customer-reset-password',
				'customer-verification',
				// 'customer-update',
				// 'customer-update-credential',
				// 'customer-update-address',
				'product-review-writer',
				'product-review-comments',
				'checkout',
				'order-request-refund',
				'search-purchase',
			],
			queue: []
		},
		plugins:   {},
		listeners: {},
		messages:  {},
	}, options, overrideArray);

	if (options.plugins) {
		$.extend(Thunder.plugins, options.plugins);
	}

	if (options.listeners) {
		Object.keys(options.listeners).forEach(eventName => {
			Thunder.listeners[eventName] =
				Thunder.listeners[eventName]
					.concat(options.listeners[eventName]);
		});
	}

	if (options.paymentMethods) {

		Object.keys(options.paymentMethods).forEach(type => {

			const paymentMethods = options.paymentMethods[type];

			if (paymentMethods.length > 0) return;

			delete options.paymentMethods[type];

		});

	}

	if (options.header) {

		const defaultHeaderOptions = {
			items: [
				'customer',        // Register, Login | My Profile
				'search-purchase', // Search Order
				'cart',            // Cart
			],
			actions: {
				'customer-dashboard': () => Thunder.open('customer-dashboard'),
				'customer-register':  () => Thunder.open('customer-register'),
				'customer-login':     () => Thunder.open('customer-login'),
				'order-list':         () => Thunder.open('order-list'),
				'search-purchase':    () => Thunder.open('search-purchase'),
				cart:                 () => Thunder.open('cart'),
			}
		};

		if (options.header === true) {
			options.header = defaultHeaderOptions;
		} else {
			options.header = mergeWith(defaultHeaderOptions, options.header, overrideArray);
		}

	}

	if (options.messages) {
		Thunder.setMessages(options.messages);
	}

	if (options.recaptcha.sitekey) {
		window[options.recaptcha.onload] = Thunder.util.bindRecaptcha;
	}

	Thunder.options = {
		root:                       options.root,                                // Root page URL
		baseURL:                    options.baseURL || 'https://api.clayful.io', // API base URL
		language:                   options.language,                            // Content language
		currency:                   options.currency,                            // Content currency
		timezone:                   options.timezone,                            // Content time zone
		authStorage:                options.authStorage,                         // Auth token storage
		dateInputFormat:            options.dateInputFormat,                     // Date input format
		legal:                      options.legal,                               // Legal information
		confirmation:               options.confirmation,                        // Confirmation settings
		productActions:             options.productActions,                      // Supported product options
		productLabels:              options.productLabels,                       // Product labels to display
		productReview:              options.productReview,
		productReviewRating:        options.productReviewRating,
		productReviewComment:       options.productReviewComment,
		paymentMethods:             options.paymentMethods,                      // Supported payment methods
		refundReasonCategories:     options.refundReasonCategories,              // Refund reason categories
		subscriptionPlans:          options.subscriptionPlans,                   // Supported subscription plan ids
		customerAvatar:             options.customerAvatar,                      // Use customer avatar for `customer-update`, `product-reviews`?
		customerDashboardLogout:    options.customerDashboardLogout,             // Show Logout button in `customer-dashboard`?
		customerIdentity:           options.customerIdentity,                    // Customer identity fields
		customerRegistrationFields: options.customerRegistrationFields,          // Customer registration fields
		customerUpdateFields:       options.customerUpdateFields,                // Customer update fields
		customerOrderFields:        options.customerOrderFields,                 // Customer fields for orders and subscriptions
		recipientFields:            options.recipientFields,                     // Allowed recipient fields for addresses
		addressDisabled:            options.addressDisabled,                     // Disabled address fields (when search plugin exists)
		orderAuthFields:            options.orderAuthFields,                     // Fields to authenticate for orders & subscriptions
		socialApps:                 options.socialApps,                          // Supported social apps for customer accounts
		header:                     options.header,                              // Header navigation menu items
		recaptcha:                  options.recaptcha,                           // Google reCAPTCHA options
	};

	// Expose Thunder.Cart after configurations
	Thunder.Cart = require('./lib/cart')(Thunder);

	Thunder.credential(options.client);
	Thunder.preference(options);
	Thunder.initialize();

	Thunder.trigger('init');

	return Thunder;

};

// Translation dependency
Thunder.polyglot = new Polyglot();

// TODO: Event listeners
Thunder.listeners = {
	init:            [],
	componentRender: [],
	componentInit:   [],
};

// Custom methods
Thunder.methods = {};

// Specs for components
Thunder.components = {
	cart:                         component(require('./modules/cart')(Thunder)),
	'catalog-slider':             component(require('./modules/catalog-slider')(Thunder)),
	checkout:                     component(require('./modules/checkout')(Thunder)),
	'checkout-success':           component(require('./modules/checkout-success')(Thunder)),
	'product-list':               component(require('./modules/product-list')(Thunder)),
	'product-detail':             component(require('./modules/product-detail')(Thunder)),
	'product-review':             component(require('./modules/product-review')(Thunder)),
	'product-reviews':            component(require('./modules/product-reviews')(Thunder)),
	'product-review-writer':      component(require('./modules/product-review-writer')(Thunder)),
	'product-review-comments':    component(require('./modules/product-review-comments')(Thunder)),
	'customer-register':          component(require('./modules/customer-register')(Thunder)),
	'customer-login':             component(require('./modules/customer-login')(Thunder)),
	'customer-reset-password':    component(require('./modules/customer-reset-password')(Thunder)),
	'customer-verification':      component(require('./modules/customer-verification')(Thunder)),
	'customer-dashboard':         component(require('./modules/customer-dashboard')(Thunder)),
	'customer-update':            component(require('./modules/customer-update')(Thunder)),
	'customer-update-credential': component(require('./modules/customer-update-credential')(Thunder)),
	'customer-update-address':    component(require('./modules/customer-update-address')(Thunder)),
	'customer-reviews':           component(require('./modules/customer-reviews')(Thunder)),
	'customer-review':            component(require('./modules/customer-review')(Thunder)),
	'customer-review-comments':   component(require('./modules/customer-review-comments')(Thunder)),
	'customer-review-comment':    component(require('./modules/customer-review-comment')(Thunder)),
	'customer-delete-account':    component(require('./modules/customer-delete-account')(Thunder)),
	'customer-coupons':           component(require('./modules/customer-coupons')(Thunder)),
	'search-purchase':            component(require('./modules/search-purchase')(Thunder)),
	'order-list':                 component(require('./modules/order-list')(Thunder)),
	'order-detail':               component(require('./modules/order-detail')(Thunder)),
	'order-request-refund':       component(require('./modules/order-request-refund')(Thunder)),
	'subscription-list':          component(require('./modules/subscription-list')(Thunder)),
	'subscription-detail':        component(require('./modules/subscription-detail')(Thunder)),
	'payment-form':               component(require('./modules/payment-form')(Thunder)),
};

Thunder.uis = {
	'component-spinner':  require('./ui/component-spinner').bind(Thunder),
	'section-spinner':    require('./ui/section-spinner').bind(Thunder),
	'button-spinner':     require('./ui/button-spinner').bind(Thunder),
	'overlay-navigation': require('./ui/overlay-navigation').bind(Thunder),
	'header-navigation':  require('./ui/header-navigation').bind(Thunder),
	'social-login':       require('./ui/social-login').bind(Thunder),
	'avatar-placeholder': require('./ui/avatar-placeholder').bind(Thunder),
	'filled-star':        require('./ui/filled-star').bind(Thunder),
	'half-filled-star':   require('./ui/half-filled-star').bind(Thunder),
	'empty-star':         require('./ui/empty-star').bind(Thunder),
	'hallow-star':        require('./ui/hallow-star').bind(Thunder),
	'review-stars':       require('./ui/review-stars').bind(Thunder),
	'review-star-rating': require('./ui/review-star-rating').bind(Thunder),
	'text-box-overlay':   require('./ui/text-box-overlay').bind(Thunder),
	'left-arrow':         require('./ui/left-arrow').bind(Thunder),
	'right-arrow':        require('./ui/right-arrow').bind(Thunder)
};

// Plugins (address search, payment, ...)
Thunder.plugins = {
	searchAddress:     null,
	makePayment:       null,
	redirect:          require('./plugins/redirect'),
	notification:      require('./plugins/notification'),
	confirmation:      require('./plugins/confirmation'),
	pagination:        require('./plugins/pagination'),
	cartStorage:       require('./plugins/cartStorage'),
	credentialStorage: require('./plugins/credentialStorage'),
};

// Utility methods
Thunder.util = {
	log:                 require('./util/log').bind(Thunder),
	debounce:            require('./util/debounce').bind(Thunder),
	ui:                  require('./util/ui').bind(Thunder),
	stripHTML:           require('./util/stripHTML').bind(Thunder),
	excerpt:             require('./util/excerpt').bind(Thunder),
	imageURL:            require('./util/imageURL').bind(Thunder),
	toPrecision:         require('./util/toPrecision').bind(Thunder),
	formatNumber:        require('./util/formatNumber').bind(Thunder),
	formatPrice:         require('./util/formatPrice').bind(Thunder),
	isExpired:           require('./util/isExpired').bind(Thunder),
	addTime:             require('./util/addTime').bind(Thunder),
	countryName:         require('./util/countryName').bind(Thunder),
	customerIdentity:    require('./util/customerIdentity').bind(Thunder),
	productName:         require('./util/productName').bind(Thunder),
	variantName:         require('./util/variantName').bind(Thunder),
	orderShippingStatus: require('./util/orderShippingStatus').bind(Thunder),
	formToJSON:          require('./util/formToJSON').bind(Thunder),
	parseQueryString:    require('./util/parseQueryString').bind(Thunder),
	parseArrayString:    require('./util/parseArrayString').bind(Thunder),
	urlQuery:            require('./util/urlQuery').bind(Thunder),
	requestErrorHandler: require('./util/requestErrorHandler').bind(Thunder),
	userIdOrEmail:       require('./util/userIdOrEmail').bind(Thunder),
	makeAsyncButton:     require('./util/makeAsyncButton').bind(Thunder),
	bindAgreements:      require('./util/bindAgreements').bind(Thunder),
	makeRecaptcha:       require('./util/makeRecaptcha').bind(Thunder),
	unsetRecaptcha:      require('./util/unsetRecaptcha').bind(Thunder),
	bindSocialApps:      require('./util/bindSocialApps').bind(Thunder),
	handleSocialLogin:   require('./util/handleSocialLogin').bind(Thunder),
	bindRecaptcha:       require('./util/bindRecaptcha').bind(Thunder),
	useRecaptcha:        require('./util/useRecaptcha').bind(Thunder),
	imageUploader:       require('./util/imageUploader').bind(Thunder),
	copyToClipboard:     require('./util/copyToClipboard').bind(Thunder),
	bindBackButton:      require('./util/bindBackButton').bind(Thunder),
	followingNavigation: require('./util/followingNavigation').bind(Thunder),
	quantityInput:       require('./util/quantityInput').bind(Thunder),
	checkItemRefunded:   require('./util/checkItemRefunded').bind(Thunder),
};

// Global template methods
Thunder.templateMethods = {
	get:              require('lodash.get'),
	kebabCase:        require('lodash.kebabcase'),
	camelCase:        require('lodash.camelcase'),
	stripHTML:        Thunder.util.stripHTML,
	excerpt:          Thunder.util.excerpt,
	imageURL:         Thunder.util.imageURL,
	isExpired:        Thunder.util.isExpired,
	countryName:      Thunder.util.countryName,
	customerIdentity: Thunder.util.customerIdentity,
	productName:      Thunder.util.productName,
	variantName:      Thunder.util.variantName,
};

Thunder.overlay = {
	background: '<div id="thunder--overlay-background" data-thunder-close></div>',
	container:  '<div id="thunder--overlay"><div id="thunder--overlay-header"></div><div id="thunder--overlay-body"></div></div>',
	body:       null,
};

$.extend(Thunder, {
	initialize:    require('./lib/initialize').bind(Thunder), // Initialize an app
	credential:    require('./lib/credential').bind(Thunder), // Client setter
	preference:    require('./lib/preference').bind(Thunder), // Preference setter
	setMessages:   require('./lib/setMessages').bind(Thunder), // Sets translation messages
	on:            require('./lib/on').bind(Thunder),         // Registers event listeners
	off:           require('./lib/off').bind(Thunder),        // Unregisters event listeners
	trigger:       require('./lib/trigger').bind(Thunder),    // Trigger registered event listeners
	method:        getterSetter('methods'),                   // Method getter/setter
	component:     getterSetter('components'),                // Component getter/setter
	template:      getterSetter('components', 'template'),    // Custom template getter/setter
	plugin:        getterSetter('plugins'),                   // Plugin getter/setter
	ui:            getterSetter('uis'),                       // Custom UI getter/setter
	render:        require('./lib/render').bind(Thunder),     // Renders a component
	open:          require('./lib/open').bind(Thunder),       // Opens an overlay and renders a component
	close:         require('./lib/close').bind(Thunder),      // Closes an overlay
	request:       require('./lib/request')(Thunder),         // Make an API request
	execute:       require('./lib/execute').bind(Thunder),    // Execute a custom method
	notify:        require('./lib/notify').bind(Thunder),     // Shortcut for Thunder.plugins.notification
	logout:        require('./lib/logout').bind(Thunder),
	header:        require('./lib/header').bind(Thunder),
	authenticated: require('./lib/authenticated').bind(Thunder),
});

function component(definition) {

	return $.extend({
		options:  function() { return {} },
		default:  {},
		pre:      function(context, callback) { return callback(null, context) },
		init:     function() {},
		template: function(context) { return '' }
	}, definition);

}

function getterSetter(field, child) {

	return child ?
		function(name, value) {

			if (!value) return Thunder[field][name][child];

			Thunder[field][name][child] = value;

			return Thunder;

		} :
		function(name, value) {

			if (!value) return Thunder[field][name];

			Thunder[field][name] = value;

			return Thunder;

		};

}

window.Thunder = Thunder;
const set = require('lodash.set');
const camelCase = require('lodash.camelcase');

module.exports = Thunder => {

	const implementation = {
		name: 'checkout-success'
	};

	implementation.options = () => ({
		type:    'order', // 'order' || 'subscription'
		subject: null,    // Order/Subscription ID
		onViewDetails: function($container, context) {

			const { type, subject } = context.options;

			return Thunder.render($container, `${type}-detail`, {
				[type]: subject
			});

		}
	});

	implementation.pre = function(context, callback) {

		const type = context.options.type;
		const subject = context.options.subject;

		const errors = {
			default: context.m(camelCase([type, 'readFailed'])),
		};

		// Get an order or a subscription
		if (type === 'order') {
			return Thunder.request({
				method: 'PUT',
				url:    `/v1/me/${type}s/${subject}/transactions`
			}).then(() => {
				Thunder.request({
					method: 'GET',
					url:    `/v1/me/${type}s/${subject}`
				}).then(subject => {
					return callback(null, set(context, 'subject', subject));
				});
			});
		}

		return Thunder.request({
			method: 'GET',
			url:    `/v1/me/${type}s/${subject}`
		}).then(subject => {
			return callback(null, set(context, 'subject', subject));
		}, err => Thunder.util.requestErrorHandler(
			err.responseJSON,
			errors,
			callback
		));
	};

	implementation.init = function(context) {

		const $container = $(this);
		const $viewMoreDetails = $(this).find('.thunder--view-more-details');
		const $copyToId = $(this).find('.thunder--copy-to-id');
		const $copyToIdButton = $(this).find('.thunder--copy-to-id-button');

		$viewMoreDetails.on('click', () => Thunder.execute(
			context.options.onViewDetails,
			$container,
			context
		));

		console.log('context', context);

		$copyToIdButton.on('click', () => {
			Thunder.util.copyToClipboard($copyToId);
		});

	};

	return implementation;

};
const get = require('lodash.get');
const set = require('lodash.set');
const camelCase = require('lodash.camelcase');

module.exports = Thunder => {

	const implementation = {
		name: 'payment-form'
	};

	implementation.options = () => ({
		type: 'order', // 'order' or 'subscription'
		paymentMethods: null,
	});

	implementation.pre = function(context, callback) {

		const {
			type
		} = context.options;

		const paymentMethodFilter = context.options.paymentMethods;
		const defaultPaymentMethods = Thunder.options.paymentMethods[type];

		context.paymentMethods =
			context.options.paymentMethods ?
			defaultPaymentMethods.filter(paymentMethod => {
				return paymentMethodFilter.some(p => paymentMethod.id === p);
			}) :
			defaultPaymentMethods;

		return callback(null, context);

	};

	implementation.init = function(context) {

		const owner = {
			person:  { label: context.m('cardOwnerBirthdate'), format: 'YYMMDD' },
			company: { label: context.m('cardOwnerCompanyNumber'), format: 'XXXXXXXXXX' }
		};

		const paymentMethodMap =
				context.paymentMethods
					.reduce((o, p) => set(o, [`${p.id}.${p.label}`], p), {});

		const $cardForm = $(this).find('.thunder--payment-card-detail');
		const $paymentMethod = $(this).find('[name="paymentMethod"]');
		const $cardNumber = $(this).find('[name="card.number"]');
		const $isCompanyCard = $(this).find('.thunder--is-company-card input[type="checkbox"]');
		const $cardOwnerLabel = $(this).find('.thunder--card-owner label');
		const $cardOwnerInput = $(this).find('.thunder--card-owner input[type="text"]');

		$paymentMethod.on('change', displayCardForm);
		$cardNumber.on('keyup', normalizeCardNumber);
		$isCompanyCard.on('change', decideCardOwner);

		decideCardOwner();

		function getPaymentMethodId() {
			return $paymentMethod.val() || null;
		}

		function getPaymentMethod() {
			return paymentMethodMap[getPaymentMethodId()] || null;
		}

		function getCard() {

			const paymentMethod = getPaymentMethod();

			if (!paymentMethod || !paymentMethod.cardFields) {
				return null;
			}

			const data = {};

			$cardForm.find('[name]').each(function() {
				set(data, $(this).prop('name'), $(this).val() || null);
			});

			const card = data.card;

			if (card) {
				if (card.number) {
					card.number = card.number.replace(/\s/g, '-');
				}
			}

			return card;
		}

		function validate() {

			const card = getCard();
			const paymentMethod = getPaymentMethod();

			if (!paymentMethod) {

				const code = 'paymentMethodRequired';
				const err = new Error(context.m(code));

				err.code = code;

				return err;
			}

			if (!paymentMethod.cardFields) {
				return null;
			}

			// Validate if the payment method requires manual card inputs

			const fields = $cardForm.find('[name]').map(function() {
				return $(this).prop('name');
			}).get();

			for (const field of fields) {

				const value = get(card, field.replace('card.', ''));

				if (value) continue;

				const code = camelCase([field, 'required']);
				const err = new Error(context.m(code));

				err.code = code;

				return err;

			}

			return null;
		}

		function normalizeCardNumber() {

			const value = ($(this).val() || '')
							.replace(/[^\d]/g, '');

			const normalized = [0, 1, 2, 3].reduce((numbers, i) => {

				return numbers.concat(value.slice(i * 4, (i + 1) * 4));

			}, []);

			$(this).val(normalized.filter(v => v).join(' '));

		}

		function decideCardOwner() {

			const isCompanyCard = $isCompanyCard.is(':checked');
			const {
				label,
				format
			} = isCompanyCard ? owner.company : owner.person;

			$cardOwnerLabel.text(label);
			$cardOwnerInput.prop('placeholder', format);

			// Reset card owner input's value
			$cardOwnerInput.val('');

		}

		function resetCard() {

			// Reset all input values
			$cardForm.find('input').each(function() {

				return $(this).is('[type="checkbox"]') ?
						$(this).prop('checked', false) :
						$(this).val('');
			});

			decideCardOwner();

		}

		function displayCardForm() {

			// Reset all input values
			resetCard();

			const paymentMethod = getPaymentMethod();

			return paymentMethod.cardFields ?
					$cardForm.show() :
					$cardForm.hide();
		}

		function makePayment({ cart, order, subscription, customer }, callback) {

			const paymentMethod = getPaymentMethod();

			if (!paymentMethod) {
				return callback(new Error(context.m('paymentMethodRequired')));
			}

			if (paymentMethod.payLater) {
				// If a payment is to be made after all checkout processes,
				// simply finish checkout processes.
				return callback();
			}

			return Thunder.plugins.makePayment({
				paymentMethod,
				cart,
				order,
				subscription,
				customer,
			}, err => callback(err));

		}

		// Return interfaces
		return {
			getPaymentMethodId,
			getPaymentMethod,
			getCard,
			resetCard,
			validate,
			makePayment
		};

	};

	return implementation;

};
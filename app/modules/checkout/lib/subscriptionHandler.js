const set = require('lodash.set');

module.exports = ({
	form,
	labels,
	subscriptionPlans,
	timezone = () => 'UTC',
	onPlanChange = () => {},
	onStartsAtChange = () => {}
}) => {

	const $plan = form.find('[name="subscriptionPlan"]');
	const $startsAtSection = form.find('.thunder--subscription-starts-at');
	const $startsAtLabel = $startsAtSection.find('label');
	const $startsAt = $startsAtSection.find('[name="subscriptionStartsAt"]');
	const $immediateTip = $('.first-order-is-immediate');

	const datepicker = $startsAt.data('pickaday');

	const subscriptionPlanMap = subscriptionPlans.reduce((o, plan) => {
		return set(o, plan._id, plan);
	}, {});

	subscriptionPlanChanged();

	if (datepicker) {
		// Set datepicker's min date as tomorrow (24 hours later)
		datepicker.setMinDate(
			new Date(new Date().valueOf() + (1000 * 3600 * 24))
		);
	}

	$plan.on('change', function() {
		subscriptionPlanChanged();
		return onPlanChange();
	});

	$startsAt.on('change', function() {
		return onStartsAtChange();
	});

	function getSubscriptionPlan(subscriptionPlanId) {
		return subscriptionPlanMap[subscriptionPlanId];
	}

	function validateSubscriptionDetail(subscription) {

		if (!subscription || !subscription.plan) {
			return 'subscriptionPlanRequired';
		}

		const plan = subscriptionPlanMap[subscription.plan];

		if (plan.startsAt && !subscription.startsAt) {
			return 'subscriptionStartsAtRequired';
		}

	}

	function getSubscriptionDetail() {

		const plan = subscriptionPlanMap[$plan.val()];

		if (!plan) return null;

		const detail = {
			plan:     plan._id,
			timezone: timezone(),
		};

		const startsAt = (
			// If `plan.startsAt` is a function, simply invoke and get the time value.
			(typeof plan.startsAt === 'function' && plan.startsAt(plan)) ||
			// If `plan.startsAt` is a 'datepicker', get the time value from datepicker.
			(plan.startsAt === 'datepicker' && $startsAt.data('pickaday').getDate())
		) || null;

		if (startsAt) {

			// Set order schedules' times (default = 09:00)
			startsAt.setHours(
				...(plan.time || '09:00')
					.split(':')
					.map(v => parseInt(v))
					.concat(0, 0, 0) // Default minutes, seconds, milliseconds
			);

			detail.startsAt = startsAt;
		}

		return detail;

	}

	function subscriptionPlanChanged() {

		const plan = subscriptionPlanMap[$plan.val()];

		if (!plan) return;

		if (plan.startsAt === 'datepicker') {
			$startsAtSection.show();
		} else {
			$startsAtSection.hide();
		}

		if (plan.immediate) {
			$immediateTip.show();
			$startsAtLabel.text(labels.secondOrderStartsAt);
		} else {
			$immediateTip.hide();
			$startsAtLabel.text(labels.firstOrderStartsAt);
		}

		$startsAt.val('');
		datepicker.setDate(null);

	}

	return {
		getSubscriptionPlan,
		validateSubscriptionDetail,
		getSubscriptionDetail,
		subscriptionPlanChanged,
	};

};
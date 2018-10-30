module.exports = order => {

	if (!order) return null;

	if (order.status === 'placed' ||
		order.status === 'cancelled') {
		return null;
	}

	const hasTangibleItem = order.items.reduce((items, item) => {
		return items.concat(item, item.bundleItems || []);
	}, []).some(item => item.type === 'tangible');

	if (!hasTangibleItem) return null;

	if (order.receivedAt) {
		return 'received';
	}

	const countByStatus = order.fulfillments.reduce((o, { status }) => {
		o[status] = o[status] || 0;
		o[status]++;
		return o;
	}, {});

	if (order.fulfillments.length === 0 ||
		order.fulfillments.length === countByStatus.pending) {
		return 'pending';
	}

	if (order.fulfillments.length === countByStatus.arrived) {
		return 'arrived';
	}

	return 'shipped';

};
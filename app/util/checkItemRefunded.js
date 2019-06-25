'use strict';

const refundStatusToCheck = {
	requested: true,
	accepted:  true,
};

module.exports = (order, itemId) => {

	if (!Array.isArray(order.items) ||
		!Array.isArray(order.refunds)) {
		throw new Error('Order must have items and refunds field to check item refund status.');
	}

	const itemQuantity = order.items
					.reduce((all, item) => all.concat(item, item.bundleItems), [])
					.find(item => item._id === itemId)
					.quantity
					.raw;

	const refundedQuantity = order.refunds
					.filter(r => refundStatusToCheck[r.status]) // requested, accepted 환불 내역에서
					.reduce((sum, r) => {

						const item = r.items.find(i => i.item._id === itemId);

						return sum + (item ? item.quantity.raw : 0);

					}, 0); // 이 아이템에 대해서 환불된 전체 수량을 계산

	if (itemQuantity <= refundedQuantity) {
		return true;
	}

	return false;
};
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Based on Iamport's JavaScript SDK.
 * - Iamport's JavaScript SDK should be imported before this plugin.
 * - `IMP.init('id');` should be called before `makePayment` gets called.
 * - Website: http://iamport.kr/
 * - Guide: https://docs.iamport.kr/
 */

var RedirectionError = function RedirectionError(options) {
	var code = options.code,
	    type = options.type,
	    subject = options.subject,
	    message = options.message;


	var err = new Error(message);

	err.code = code;
	err.type = type;
	err.subject = subject;

	return err;
};

var implementation = function implementation() {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var _options$redirectURL = options.redirectURL,
	    redirectURL = _options$redirectURL === undefined ? function (data) {

		var location = window.location;
		var type = data.subscription ? 'subscription' : 'order';

		// `?type` query is required.
		return location.protocol + '//' + location.host + '?type=' + type;
	} : _options$redirectURL,
	    _options$billingKeyNa = options.billingKeyName,
	    billingKeyName = _options$billingKeyNa === undefined ? 'Billing Key' : _options$billingKeyNa,
	    _options$orderName = options.orderName,
	    orderName = _options$orderName === undefined ? function (cart) {
		return (cart.items[0].product.name || '').slice(0, 16);
	} : _options$orderName,
	    _options$buyerName = options.buyerName,
	    buyerName = _options$buyerName === undefined ? function (customer) {
		return customer.name.full;
	} : _options$buyerName,
	    _options$buyerAddress = options.buyerAddress,
	    buyerAddress = _options$buyerAddress === undefined ? function (address) {
		return [address.address1, address.address2].filter(function (v) {
			return v;
		}).join(' ').trim();
	} : _options$buyerAddress,
	    _options$redirectionC = options.redirectionCallback,
	    redirectionCallback = _options$redirectionC === undefined ? function (err, data) {

		if (err) {

			var message = Thunder.polyglot.t('checkout.paymentFailed');

			Thunder.notify('error', message + ' [' + err.code + ']');

			return Thunder.open(err.type + '-detail', _defineProperty({}, err.type, err.subject));
		}

		return Thunder.open('checkout-success', data);
	} : _options$redirectionC;


	Thunder.listeners.init.push(function () {
		// Handle mobile redirections automatically
		implementation.handleRedirect(redirectionCallback);
	});

	return function () {
		var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		var callback = arguments[1];
		var paymentMethod = data.paymentMethod,
		    cart = data.cart,
		    order = data.order,
		    subscription = data.subscription,
		    customer = data.customer;


		if (paymentMethod.cardFields) {
			// Since Iamport doesn't support manual payment with card information,
			// do not call `IMP.request_pay` method.
			return callback(null, {});
		}

		var subject = subscription || order;
		var address = subject.address.shipping;
		var currency = subject.currency.payment.code;

		var taxFree = cart ? implementation.calculateTaxFree(cart) : null;

		var pgId = paymentMethod.meta.pg.split('.')[0];

		// Default request options for orders and subscriptions
		var params = $.extend({
			pg: paymentMethod.meta.pg,
			pay_method: paymentMethod.meta.payMethod,
			currency: currency,
			buyer_email: customer.email || null,
			buyer_name: buyerName(customer),
			buyer_tel: customer.mobile || customer.phone, // Required by Iamport
			buyer_addr: buyerAddress(address),
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
			name: billingKeyName, // Placeholder name
			amount:
			// 정기 구독이면서 PG사가 이니시스인 경우,
			// 결제 금액 디스플레이를 위해 정기 구독의 1번째 스케쥴 결제 금액을 디스플레이
			// (단순 디스플레이용이며, 해당 금액과 관련해 실제 결제가 PG에 의해서 일어나지 않음)
			// Ref: https://github.com/iamport/iamport-manual/blob/master/%EB%B9%84%EC%9D%B8%EC%A6%9D%EA%B2%B0%EC%A0%9C/example/inicis-request-billing-key.md#2-%EB%B9%8C%EB%A7%81%ED%82%A4-%EB%B0%9C%EA%B8%89%EC%9D%84-%EC%9C%84%ED%95%9C-%EA%B2%B0%EC%A0%9C%EC%B0%BD-%ED%98%B8%EC%B6%9C
			pgId.indexOf('inicis') >= 0 ? typeof subscription.schedules[0].amount.raw === 'number' ? subscription.schedules[0].amount.raw : subscription.schedules[0].amount : 0
		} : $.extend({
			// Regular order case.
			merchant_uid: order._id,
			name: orderName(cart),
			// Handle rich data cases.
			amount: typeof order.total.amount.raw === 'number' ? order.total.amount.raw : order.total.amount
		}, taxFree ? {
			// `tax_free` param is only supported for regular orders for now.
			tax_free: taxFree
		} : {}));

		return IMP.request_pay(params, function (res) {
			return callback(res.success ? null : res, res);
		});
	};
};

implementation.calculateTaxFree = function (cart) {

	var isZeroTaxed = function isZeroTaxed(item) {
		return item.taxed.convertedRaw === 0;
	};

	// Handle `tax_free` parameter of Iamport for tax exempted & zero-rated products.
	// Reference: https://docs.iamport.kr/tech/vat
	var itemsWithZeroTax = [].concat(
	// Zero taxed items
	cart.items.reduce(function (items, item) {
		return items.concat(item, item.bundleItems || []);
	}, []).filter(isZeroTaxed).map(function (item) {
		return item.price.withTax.convertedRaw;
	}),
	// Zero taxed shipment
	(cart.shipments || []).filter(isZeroTaxed).map(function (shipment) {
		return shipment.fee.withTax.convertedRaw;
	})).filter(function (v) {
		return v !== 0;
	}); // Just in case where an actual item/shipment's price is 0

	if (itemsWithZeroTax.length === 0) {
		// There are no zero taxed items and shipments
		return null;
	}

	// Build a sum price of tax free items and shipments.
	// It is important that we use the payment currency's precision to calculate sum.
	// Reference: https://stackoverflow.com/questions/1458633/how-to-deal-with-floating-point-number-precision-in-javascript
	var precision = cart.currency.payment.precision;

	var sum = itemsWithZeroTax.reduce(function (sum, v) {
		return sum + v;
	}, 0);

	if (precision > 0) {
		sum = parseFloat(parseFloat(sum).toPrecision(precision));
	}

	return sum;
};

implementation.handleRedirect = function (callback) {

	var Thunder = window.Thunder;
	var query = Thunder.util.urlQuery();

	var types = {
		order: true,
		subscription: true
	};

	if (types[query.type] && query.merchant_uid) {
		var success = query.imp_success,
		    type = query.type,
		    subject = query.merchant_uid;

		// Payment failure case...

		if (success !== 'true') {

			return callback(RedirectionError({
				code: 'iamport-payment',
				message: 'Failed to make a payment.',
				type: type,
				subject: subject
			}));
		}

		// Payment success case...
		if (type === 'order') {
			// Regular order case
			return callback(null, { type: type, subject: subject });
		}

		// Subscription case, we should post schedules to Iamport via Clayful's API
		return Thunder.request({
			method: 'POST',
			url: '/v1/me/subscriptions/' + subject + '/scheduled',
			data: {}
		}).then(function () {
			// Scheduling succeeded...
			return callback(null, { type: type, subject: subject });
		}, function (err) {
			// Scheduling failed...
			return callback(RedirectionError({
				code: 'clayful-schedule',
				message: 'Failed to post schedules.',
				type: type,
				subject: subject
			}));
		});
	}
};

window.ThunderMakePaymentIamport = implementation;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwbHVnaW5zL21ha2VQYXltZW50L2lhbXBvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUE7Ozs7Ozs7O0FBUUEsSUFBTSxtQkFBbUIsU0FBbkIsZ0JBQW1CLFVBQVc7QUFBQSxLQUdsQyxJQUhrQyxHQU8vQixPQVArQixDQUdsQyxJQUhrQztBQUFBLEtBSWxDLElBSmtDLEdBTy9CLE9BUCtCLENBSWxDLElBSmtDO0FBQUEsS0FLbEMsT0FMa0MsR0FPL0IsT0FQK0IsQ0FLbEMsT0FMa0M7QUFBQSxLQU1sQyxPQU5rQyxHQU8vQixPQVArQixDQU1sQyxPQU5rQzs7O0FBU25DLEtBQU0sTUFBTSxJQUFJLEtBQUosQ0FBVSxPQUFWLENBQVo7O0FBRUEsS0FBSSxJQUFKLEdBQVcsSUFBWDtBQUNBLEtBQUksSUFBSixHQUFXLElBQVg7QUFDQSxLQUFJLE9BQUosR0FBYyxPQUFkOztBQUVBLFFBQU8sR0FBUDtBQUNBLENBaEJEOztBQWtCQSxJQUFNLGlCQUFpQixTQUFqQixjQUFpQixHQUFrQjtBQUFBLEtBQWpCLE9BQWlCLHVFQUFQLEVBQU87QUFBQSw0QkF1Q3BDLE9BdkNvQyxDQU12QyxXQU51QztBQUFBLEtBTXZDLFdBTnVDLHdDQU16QixnQkFBUTs7QUFFckIsTUFBTSxXQUFXLE9BQU8sUUFBeEI7QUFDQSxNQUFNLE9BQU8sS0FBSyxZQUFMLEdBQW9CLGNBQXBCLEdBQXFDLE9BQWxEOztBQUVBO0FBQ0EsU0FBVSxTQUFTLFFBQW5CLFVBQWdDLFNBQVMsSUFBekMsY0FBc0QsSUFBdEQ7QUFDQSxFQWJzQztBQUFBLDZCQXVDcEMsT0F2Q29DLENBZXZDLGNBZnVDO0FBQUEsS0FldkMsY0FmdUMseUNBZXRCLGFBZnNCO0FBQUEsMEJBdUNwQyxPQXZDb0MsQ0FpQnZDLFNBakJ1QztBQUFBLEtBaUJ2QyxTQWpCdUMsc0NBaUIzQjtBQUFBLFNBQVEsQ0FBQyxLQUFL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IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcbiAqIEJhc2VkIG9uIElhbXBvcnQncyBKYXZhU2NyaXB0IFNESy5cbiAqIC0gSWFtcG9ydCdzIEphdmFTY3JpcHQgU0RLIHNob3VsZCBiZSBpbXBvcnRlZCBiZWZvcmUgdGhpcyBwbHVnaW4uXG4gKiAtIGBJTVAuaW5pdCgnaWQnKTtgIHNob3VsZCBiZSBjYWxsZWQgYmVmb3JlIGBtYWtlUGF5bWVudGAgZ2V0cyBjYWxsZWQuXG4gKiAtIFdlYnNpdGU6IGh0dHA6Ly9pYW1wb3J0LmtyL1xuICogLSBHdWlkZTogaHR0cHM6Ly9kb2NzLmlhbXBvcnQua3IvXG4gKi9cblxuY29uc3QgUmVkaXJlY3Rpb25FcnJvciA9IG9wdGlvbnMgPT4ge1xuXG5cdGNvbnN0IHtcblx0XHRjb2RlLFxuXHRcdHR5cGUsXG5cdFx0c3ViamVjdCxcblx0XHRtZXNzYWdlXG5cdH0gPSBvcHRpb25zO1xuXG5cdGNvbnN0IGVyciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcblxuXHRlcnIuY29kZSA9IGNvZGU7XG5cdGVyci50eXBlID0gdHlwZTtcblx0ZXJyLnN1YmplY3QgPSBzdWJqZWN0O1xuXG5cdHJldHVybiBlcnI7XG59O1xuXG5jb25zdCBpbXBsZW1lbnRhdGlvbiA9IChvcHRpb25zID0ge30pID0+IHtcblxuXHRjb25zdCB7XG5cdFx0Ly8gU2V0IHJlZGlyZWN0aW9uIFVSTCBmb3IgbW9iaWxlIHBheW1lbnRzIChJZiBpdCdzIG5lY2Vzc2FyeSkuXG5cdFx0Ly8gRGVmYXVsdCB2YWx1ZSBpcyB0aGUgcm9vdCBVUkwgb2YgdGhlIHdlYnNpdGUuXG5cdFx0Ly8gUmVmZXJlbmNlOiBodHRwczovL2RvY3MuaWFtcG9ydC5rci9pbXBsZW1lbnRhdGlvbi9wYXltZW50I21vYmlsZS13ZWItMVxuXHRcdHJlZGlyZWN0VVJMID0gZGF0YSA9PiB7XG5cblx0XHRcdGNvbnN0IGxvY2F0aW9uID0gd2luZG93LmxvY2F0aW9uO1xuXHRcdFx0Y29uc3QgdHlwZSA9IGRhdGEuc3Vic2NyaXB0aW9uID8gJ3N1YnNjcmlwdGlvbicgOiAnb3JkZXInO1xuXG5cdFx0XHQvLyBgP3R5cGVgIHF1ZXJ5IGlzIHJlcXVpcmVkLlxuXHRcdFx0cmV0dXJuIGAke2xvY2F0aW9uLnByb3RvY29sfS8vJHtsb2NhdGlvbi5ob3N0fT90eXBlPSR7dHlwZX1gO1xuXHRcdH0sXG5cdFx0Ly8gQmlsbGluZyBrZXkgbmFtZSBwbGFjZWhvbGRlci5cblx0XHRiaWxsaW5nS2V5TmFtZSA9ICdCaWxsaW5nIEtleScsXG5cdFx0Ly8gT3JkZXIgbmFtZSBnZXR0ZXIuIFJlY29tbWVuZGVkIG1heCBsZW5ndGggLT4gMTZcblx0XHRvcmRlck5hbWUgPSBjYXJ0ID0+IChjYXJ0Lml0ZW1zWzBdLnByb2R1Y3QubmFtZSB8fCAnJykuc2xpY2UoMCwgMTYpLFxuXHRcdC8vIEN1c3RvbWVyIG5hbWUgZ2V0dGVyLlxuXHRcdGJ1eWVyTmFtZSA9IGN1c3RvbWVyID0+IGN1c3RvbWVyLm5hbWUuZnVsbCxcblx0XHQvLyBBZGRyZXNzIGdldHRlci5cblx0XHRidXllckFkZHJlc3MgPSBhZGRyZXNzID0+IFtcblx0XHRcdGFkZHJlc3MuYWRkcmVzczEsXG5cdFx0XHRhZGRyZXNzLmFkZHJlc3MyXG5cdFx0XS5maWx0ZXIodiA9PiB2KS5qb2luKCcgJykudHJpbSgpLFxuXHRcdC8vIE1vYmlsZSBwYXltZW50IHJlZGlyZWN0aW9uIGhhbmRsZXIuXG5cdFx0cmVkaXJlY3Rpb25DYWxsYmFjayA9IChlcnIsIGRhdGEpID0+IHtcblxuXHRcdFx0aWYgKGVycikge1xuXG5cdFx0XHRcdGNvbnN0IG1lc3NhZ2UgPSBUaHVuZGVyLnBvbHlnbG90LnQoJ2NoZWNrb3V0LnBheW1lbnRGYWlsZWQnKTtcblxuXHRcdFx0XHRUaHVuZGVyLm5vdGlmeSgnZXJyb3InLCBgJHsgbWVzc2FnZSB9IFskeyBlcnIuY29kZSB9XWApO1xuXG5cdFx0XHRcdHJldHVybiBUaHVuZGVyLm9wZW4oYCR7IGVyci50eXBlIH0tZGV0YWlsYCwgeyBbZXJyLnR5cGVdOiBlcnIuc3ViamVjdCB9KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIFRodW5kZXIub3BlbignY2hlY2tvdXQtc3VjY2VzcycsIGRhdGEpO1xuXHRcdH1cblx0fSA9IG9wdGlvbnM7XG5cblx0VGh1bmRlci5saXN0ZW5lcnMuaW5pdC5wdXNoKCgpID0+IHtcblx0XHQvLyBIYW5kbGUgbW9iaWxlIHJlZGlyZWN0aW9ucyBhdXRvbWF0aWNhbGx5XG5cdFx0aW1wbGVtZW50YXRpb24uaGFuZGxlUmVkaXJlY3QocmVkaXJlY3Rpb25DYWxsYmFjayk7XG5cdH0pO1xuXG5cdHJldHVybiAoZGF0YSA9IHt9LCBjYWxsYmFjaykgPT4ge1xuXG5cdFx0Y29uc3Qge1xuXHRcdFx0cGF5bWVudE1ldGhvZCxcblx0XHRcdGNhcnQsXG5cdFx0XHRvcmRlcixcblx0XHRcdHN1YnNjcmlwdGlvbixcblx0XHRcdGN1c3RvbWVyLFxuXHRcdH0gPSBkYXRhO1xuXG5cdFx0aWYgKHBheW1lbnRNZXRob2QuY2FyZEZpZWxkcykge1xuXHRcdFx0Ly8gU2luY2UgSWFtcG9ydCBkb2Vzbid0IHN1cHBvcnQgbWFudWFsIHBheW1lbnQgd2l0aCBjYXJkIGluZm9ybWF0aW9uLFxuXHRcdFx0Ly8gZG8gbm90IGNhbGwgYElNUC5yZXF1ZXN0X3BheWAgbWV0aG9kLlxuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKG51bGwsIHt9KTtcblx0XHR9XG5cblx0XHRjb25zdCBzdWJqZWN0ID0gc3Vic2NyaXB0aW9uIHx8IG9yZGVyO1xuXHRcdGNvbnN0IGFkZHJlc3MgPSBzdWJqZWN0LmFkZHJlc3Muc2hpcHBpbmc7XG5cdFx0Y29uc3QgY3VycmVuY3kgPSBzdWJqZWN0LmN1cnJlbmN5LnBheW1lbnQuY29kZTtcblxuXHRcdGNvbnN0IHRheEZyZWUgPSBjYXJ0ID8gaW1wbGVtZW50YXRpb24uY2FsY3VsYXRlVGF4RnJlZShjYXJ0KSA6IG51bGw7XG5cblx0XHRjb25zdCBwZ0lkID0gcGF5bWVudE1ldGhvZC5tZXRhLnBnLnNwbGl0KCcuJylbMF07XG5cblx0XHQvLyBEZWZhdWx0IHJlcXVlc3Qgb3B0aW9ucyBmb3Igb3JkZXJzIGFuZCBzdWJzY3JpcHRpb25zXG5cdFx0Y29uc3QgcGFyYW1zID0gJC5leHRlbmQoe1xuXHRcdFx0cGc6ICAgICAgICAgICAgIHBheW1lbnRNZXRob2QubWV0YS5wZyxcblx0XHRcdHBheV9tZXRob2Q6ICAgICBwYXltZW50TWV0aG9kLm1ldGEucGF5TWV0aG9kLFxuXHRcdFx0Y3VycmVuY3k6ICAgICAgIGN1cnJlbmN5LFxuXHRcdFx0YnV5ZXJfZW1haWw6ICAgIGN1c3RvbWVyLmVtYWlsIHx8IG51bGwsXG5cdFx0XHRidXllcl9uYW1lOiAgICAgYnV5ZXJOYW1lKGN1c3RvbWVyKSxcblx0XHRcdGJ1eWVyX3RlbDogICAgICBjdXN0b21lci5tb2JpbGUgfHwgY3VzdG9tZXIucGhvbmUsIC8vIFJlcXVpcmVkIGJ5IElhbXBvcnRcblx0XHRcdGJ1eWVyX2FkZHI6ICAgICBidXllckFkZHJlc3MoYWRkcmVzcyksXG5cdFx0XHRidXllcl9wb3N0Y29kZTogYWRkcmVzcy5wb3N0Y29kZSxcblx0XHRcdG1fcmVkaXJlY3RfdXJsOiByZWRpcmVjdFVSTChkYXRhKSAvLyBTZXQgcmVkaXJlY3QgVVJMIGlmIGlzIG5lZWRlZC4uLlxuXHRcdH0sIHN1YnNjcmlwdGlvbiA/IHtcblx0XHRcdC8vIFN1YnNjcmlwdGlvbiBjYXNlLCBJc3N1ZSBhIGJpbGxpbmcga2V5IGZvciBzdWJzY3JpcHRpb25zLlxuXHRcdFx0Ly8gUmVmZXJlbmNlOiBodHRwczovL2dpdGh1Yi5jb20vaWFtcG9ydC9pYW1wb3J0LW1hbnVhbC90cmVlL21hc3Rlci8lRUIlQjklODQlRUMlOUQlQjglRUMlQTYlOUQlRUElQjIlQjAlRUMlQTAlOUMvZXhhbXBsZVxuXHRcdFx0bWVyY2hhbnRfdWlkOiBzdWJzY3JpcHRpb24uX2lkLCAvLyBTZXQgYG1lcmNoYW50X3VpZGAgYXMgYSBzdWJzY3JpcHRpb24ncyBpZFxuXHRcdFx0Ly8gQmlsbGluZyBrZXkgd2lsbCBiZSBpc3N1ZWQuLlxuXHRcdFx0Ly8gRm9yIGEgcmVnaXN0ZXJlZCBjdXN0b21lcjogY3VzdG9tZXIuX2lkXG5cdFx0XHQvLyBGb3IgYSBub24tcmVnaXN0ZXJlZCBjdXN0b21lcjogc3Vic2NyaXB0aW9uLl9pZFxuXHRcdFx0Y3VzdG9tZXJfdWlkOiBzdWJzY3JpcHRpb24uY3VzdG9tZXIuX2lkIHx8IHN1YnNjcmlwdGlvbi5faWQsXG5cdFx0XHRuYW1lOiAgICAgICAgIGJpbGxpbmdLZXlOYW1lLCAgIC8vIFBsYWNlaG9sZGVyIG5hbWVcblx0XHRcdGFtb3VudDogICAgICAgKFxuXHRcdFx0XHQvLyDsoJXquLAg6rWs64+F7J2066m07IScIFBH7IKs6rCAIOydtOuLiOyLnOyKpOyduCDqsr3smrAsXG5cdFx0XHRcdC8vIOqysOygnCDquIjslaEg65SU7Iqk7ZSM66CI7J2066W8IOychO2VtCDsoJXquLAg6rWs64+F7J2YIDHrsojsp7gg7Iqk7LyA7KW0IOqysOygnCDquIjslaHsnYQg65SU7Iqk7ZSM66CI7J20XG5cdFx0XHRcdC8vICjri6jsiJwg65SU7Iqk7ZSM66CI7J207Jqp7J2066mwLCDtlbTri7kg6riI7JWh6rO8IOq0gOugqO2VtCDsi6TsoJwg6rKw7KCc6rCAIFBH7JeQIOydmO2VtOyEnCDsnbzslrTrgpjsp4Ag7JWK7J2MKVxuXHRcdFx0XHQvLyBSZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS9pYW1wb3J0L2lhbXBvcnQtbWFudWFsL2Jsb2IvbWFzdGVyLyVFQiVCOSU4NCVFQyU5RCVCOCVFQyVBNiU5RCVFQSVCMiVCMCVFQyVBMCU5Qy9leGFtcGxlL2luaWNpcy1yZXF1ZXN0LWJpbGxpbmcta2V5Lm1kIzItJUVCJUI5JThDJUVCJUE3JTgxJUVEJTgyJUE0LSVFQiVCMCU5QyVFQSVCOCU4OSVFQyU5RCU4NC0lRUMlOUMlODQlRUQlOTUlOUMtJUVBJUIyJUIwJUVDJUEwJTlDJUVDJUIwJUJELSVFRCU5OCVCOCVFQyVCNiU5Q1xuXHRcdFx0XHRwZ0lkLmluZGV4T2YoJ2luaWNpcycpID49IDAgP1xuXHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdHR5cGVvZiBzdWJzY3JpcHRpb24uc2NoZWR1bGVzWzBdLmFtb3VudC5yYXcgPT09ICdudW1iZXInID9cblx0XHRcdFx0XHRcdFx0c3Vic2NyaXB0aW9uLnNjaGVkdWxlc1swXS5hbW91bnQucmF3IDpcblx0XHRcdFx0XHRcdFx0c3Vic2NyaXB0aW9uLnNjaGVkdWxlc1swXS5hbW91bnRcblx0XHRcdFx0XHQpIDogMFxuXHRcdFx0KSxcblx0XHR9IDogJC5leHRlbmQoe1xuXHRcdFx0Ly8gUmVndWxhciBvcmRlciBjYXNlLlxuXHRcdFx0bWVyY2hhbnRfdWlkOiBvcmRlci5faWQsXG5cdFx0XHRuYW1lOiAgICAgICAgIG9yZGVyTmFtZShjYXJ0KSxcblx0XHRcdC8vIEhhbmRsZSByaWNoIGRhdGEgY2FzZXMuXG5cdFx0XHRhbW91bnQ6ICAgICAgIHR5cGVvZiBvcmRlci50b3RhbC5hbW91bnQucmF3ID09PSAnbnVtYmVyJyA/XG5cdFx0XHRcdFx0XHRcdG9yZGVyLnRvdGFsLmFtb3VudC5yYXcgOlxuXHRcdFx0XHRcdFx0XHRvcmRlci50b3RhbC5hbW91bnQsXG5cdFx0fSwgdGF4RnJlZSA/IHtcblx0XHRcdC8vIGB0YXhfZnJlZWAgcGFyYW0gaXMgb25seSBzdXBwb3J0ZWQgZm9yIHJlZ3VsYXIgb3JkZXJzIGZvciBub3cuXG5cdFx0XHR0YXhfZnJlZTogdGF4RnJlZVxuXHRcdH0gOiB7fSkpO1xuXG5cdFx0cmV0dXJuIElNUC5yZXF1ZXN0X3BheShwYXJhbXMsIHJlcyA9PiB7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2socmVzLnN1Y2Nlc3MgPyBudWxsIDogcmVzLCByZXMpO1xuXHRcdH0pO1xuXG5cdH07XG5cbn07XG5cbmltcGxlbWVudGF0aW9uLmNhbGN1bGF0ZVRheEZyZWUgPSBjYXJ0ID0+IHtcblxuXHRjb25zdCBpc1plcm9UYXhlZCA9IGl0ZW0gPT4gaXRlbS50YXhlZC5jb252ZXJ0ZWRSYXcgPT09IDA7XG5cblx0Ly8gSGFuZGxlIGB0YXhfZnJlZWAgcGFyYW1ldGVyIG9mIElhbXBvcnQgZm9yIHRheCBleGVtcHRlZCAmIHplcm8tcmF0ZWQgcHJvZHVjdHMuXG5cdC8vIFJlZmVyZW5jZTogaHR0cHM6Ly9kb2NzLmlhbXBvcnQua3IvdGVjaC92YXRcblx0Y29uc3QgaXRlbXNXaXRoWmVyb1RheCA9IFtdLmNvbmNhdChcblx0XHQvLyBaZXJvIHRheGVkIGl0ZW1zXG5cdFx0Y2FydC5pdGVtc1xuXHRcdFx0LnJlZHVjZSgoaXRlbXMsIGl0ZW0pID0+IGl0ZW1zLmNvbmNhdChpdGVtLCBpdGVtLmJ1bmRsZUl0ZW1zIHx8IFtdKSwgW10pXG5cdFx0XHQuZmlsdGVyKGlzWmVyb1RheGVkKVxuXHRcdFx0Lm1hcChpdGVtID0+IGl0ZW0ucHJpY2Uud2l0aFRheC5jb252ZXJ0ZWRSYXcpLFxuXHRcdC8vIFplcm8gdGF4ZWQgc2hpcG1lbnRcblx0XHQoY2FydC5zaGlwbWVudHMgfHwgW10pXG5cdFx0XHQuZmlsdGVyKGlzWmVyb1RheGVkKVxuXHRcdFx0Lm1hcChzaGlwbWVudCA9PiBzaGlwbWVudC5mZWUud2l0aFRheC5jb252ZXJ0ZWRSYXcpXG5cdCkuZmlsdGVyKHYgPT4gdiAhPT0gMCk7IC8vIEp1c3QgaW4gY2FzZSB3aGVyZSBhbiBhY3R1YWwgaXRlbS9zaGlwbWVudCdzIHByaWNlIGlzIDBcblxuXHRpZiAoaXRlbXNXaXRoWmVyb1RheC5sZW5ndGggPT09IDApIHtcblx0XHQvLyBUaGVyZSBhcmUgbm8gemVybyB0YXhlZCBpdGVtcyBhbmQgc2hpcG1lbnRzXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvLyBCdWlsZCBhIHN1bSBwcmljZSBvZiB0YXggZnJlZSBpdGVtcyBhbmQgc2hpcG1lbnRzLlxuXHQvLyBJdCBpcyBpbXBvcnRhbnQgdGhhdCB3ZSB1c2UgdGhlIHBheW1lbnQgY3VycmVuY3kncyBwcmVjaXNpb24gdG8gY2FsY3VsYXRlIHN1bS5cblx0Ly8gUmVmZXJlbmNlOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNDU4NjMzL2hvdy10by1kZWFsLXdpdGgtZmxvYXRpbmctcG9pbnQtbnVtYmVyLXByZWNpc2lvbi1pbi1qYXZhc2NyaXB0XG5cdGNvbnN0IHByZWNpc2lvbiA9IGNhcnQuY3VycmVuY3kucGF5bWVudC5wcmVjaXNpb247XG5cblx0bGV0IHN1bSA9IGl0ZW1zV2l0aFplcm9UYXgucmVkdWNlKChzdW0sIHYpID0+IHN1bSArIHYsIDApO1xuXG5cdGlmIChwcmVjaXNpb24gPiAwKSB7XG5cdFx0c3VtID0gcGFyc2VGbG9hdChwYXJzZUZsb2F0KHN1bSkudG9QcmVjaXNpb24ocHJlY2lzaW9uKSk7XG5cdH1cblxuXHRyZXR1cm4gc3VtO1xuXG59O1xuXG5pbXBsZW1lbnRhdGlvbi5oYW5kbGVSZWRpcmVjdCA9IGNhbGxiYWNrID0+IHtcblxuXHRjb25zdCBUaHVuZGVyID0gd2luZG93LlRodW5kZXI7XG5cdGNvbnN0IHF1ZXJ5ID0gVGh1bmRlci51dGlsLnVybFF1ZXJ5KCk7XG5cblx0Y29uc3QgdHlwZXMgPSB7XG5cdFx0b3JkZXI6ICAgICAgICB0cnVlLFxuXHRcdHN1YnNjcmlwdGlvbjogdHJ1ZSxcblx0fTtcblxuXHRpZiAodHlwZXNbcXVlcnkudHlwZV0gJiYgcXVlcnkubWVyY2hhbnRfdWlkKSB7XG5cblx0XHRjb25zdCB7XG5cdFx0XHRpbXBfc3VjY2VzczogIHN1Y2Nlc3MsXG5cdFx0XHR0eXBlOiAgICAgICAgIHR5cGUsXG5cdFx0XHRtZXJjaGFudF91aWQ6IHN1YmplY3Rcblx0XHR9ID0gcXVlcnk7XG5cblx0XHQvLyBQYXltZW50IGZhaWx1cmUgY2FzZS4uLlxuXHRcdGlmIChzdWNjZXNzICE9PSAndHJ1ZScpIHtcblxuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKFJlZGlyZWN0aW9uRXJyb3Ioe1xuXHRcdFx0XHRjb2RlOiAgICAnaWFtcG9ydC1wYXltZW50Jyxcblx0XHRcdFx0bWVzc2FnZTogJ0ZhaWxlZCB0byBtYWtlIGEgcGF5bWVudC4nLFxuXHRcdFx0XHR0eXBlOiAgICB0eXBlLFxuXHRcdFx0XHRzdWJqZWN0OiBzdWJqZWN0XG5cdFx0XHR9KSk7XG5cdFx0fVxuXG5cdFx0Ly8gUGF5bWVudCBzdWNjZXNzIGNhc2UuLi5cblx0XHRpZiAodHlwZSA9PT0gJ29yZGVyJykge1xuXHRcdFx0Ly8gUmVndWxhciBvcmRlciBjYXNlXG5cdFx0XHRyZXR1cm4gY2FsbGJhY2sobnVsbCwgeyB0eXBlLCBzdWJqZWN0IH0pO1xuXHRcdH1cblxuXHRcdC8vIFN1YnNjcmlwdGlvbiBjYXNlLCB3ZSBzaG91bGQgcG9zdCBzY2hlZHVsZXMgdG8gSWFtcG9ydCB2aWEgQ2xheWZ1bCdzIEFQSVxuXHRcdHJldHVybiBUaHVuZGVyLnJlcXVlc3Qoe1xuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHR1cmw6ICAgIGAvdjEvbWUvc3Vic2NyaXB0aW9ucy8ke3N1YmplY3R9L3NjaGVkdWxlZGAsXG5cdFx0XHRkYXRhOiAgIHt9LFxuXHRcdH0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0Ly8gU2NoZWR1bGluZyBzdWNjZWVkZWQuLi5cblx0XHRcdHJldHVybiBjYWxsYmFjayhudWxsLCB7IHR5cGUsIHN1YmplY3QgfSk7XG5cdFx0fSwgZXJyID0+IHtcblx0XHRcdC8vIFNjaGVkdWxpbmcgZmFpbGVkLi4uXG5cdFx0XHRyZXR1cm4gY2FsbGJhY2soUmVkaXJlY3Rpb25FcnJvcih7XG5cdFx0XHRcdGNvZGU6ICAgICdjbGF5ZnVsLXNjaGVkdWxlJyxcblx0XHRcdFx0bWVzc2FnZTogJ0ZhaWxlZCB0byBwb3N0IHNjaGVkdWxlcy4nLFxuXHRcdFx0XHR0eXBlOiAgICB0eXBlLFxuXHRcdFx0XHRzdWJqZWN0OiBzdWJqZWN0XG5cdFx0XHR9KSk7XG5cdFx0fSk7XG5cblx0fVxuXG59O1xuXG53aW5kb3cuVGh1bmRlck1ha2VQYXltZW50SWFtcG9ydCA9IGltcGxlbWVudGF0aW9uOyJdfQ==

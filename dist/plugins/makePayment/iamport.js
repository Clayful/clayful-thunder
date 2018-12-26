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
			amount: 0
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwbHVnaW5zL21ha2VQYXltZW50L2lhbXBvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUE7Ozs7Ozs7O0FBUUEsSUFBTSxtQkFBbUIsU0FBbkIsZ0JBQW1CLFVBQVc7QUFBQSxLQUdsQyxJQUhrQyxHQU8vQixPQVArQixDQUdsQyxJQUhrQztBQUFBLEtBSWxDLElBSmtDLEdBTy9CLE9BUCtCLENBSWxDLElBSmtDO0FBQUEsS0FLbEMsT0FMa0MsR0FPL0IsT0FQK0IsQ0FLbEMsT0FMa0M7QUFBQSxLQU1sQyxPQU5rQyxHQU8vQixPQVArQixDQU1sQyxPQU5rQzs7O0FBU25DLEtBQU0sTUFBTSxJQUFJLEtBQUosQ0FBVSxPQUFWLENBQVo7O0FBRUEsS0FBSSxJQUFKLEdBQVcsSUFBWDtBQUNBLEtBQUksSUFBSixHQUFXLElBQVg7QUFDQSxLQUFJLE9BQUosR0FBYyxPQUFkOztBQUVBLFFBQU8sR0FBUDtBQUNBLENBaEJEOztBQWtCQSxJQUFNLGlCQUFpQixTQUFqQixjQUFpQixHQUFrQjtBQUFBLEtBQWpCLE9BQWlCLHVFQUFQLEVBQU87QUFBQSw0QkF1Q3BDLE9BdkNvQyxDQU12QyxXQU51QztBQUFBLEtBTXZDLFdBTnVDLHdDQU16QixnQkFBUTs7QUFFckIsTUFBTSxXQUFXLE9BQU8sUUFBeEI7QUFDQSxNQUFNLE9BQU8sS0FBSyxZQUFMLEdBQW9CLGNBQXBCLEdBQXFDLE9BQWxEOztBQUVBO0FBQ0EsU0FBVSxTQUFTLFFBQW5CLFVBQWdDLFNBQVMsSUFBekMsY0FBc0QsSUFBdEQ7QUFDQSxFQWJzQztBQUFBLDZCQXVDcEMsT0F2Q29DLENBZXZDLGNBZnVDO0FBQUEsS0FldkMsY0FmdUMseUNBZXRCLGFBZnNCO0FBQUEsMEJBdUNwQyxPQXZDb0MsQ0FpQnZDLFNBakJ1QztBQUFBLEtBaUJ2QyxTQWpCdUMsc0NBaUIzQjtBQUFBLFNBQVEsQ0FBQyxLQUFL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aUJBRHVCO0FBRWhDLGFBQVMsMkJBRnVCO0FBR2hDLFVBQVMsSUFIdUI7QUFJaEMsYUFBUztBQUp1QixJQUFqQixDQUFULENBQVA7QUFNQTs7QUFFRDtBQUNBLE1BQUksU0FBUyxPQUFiLEVBQXNCO0FBQ3JCO0FBQ0EsVUFBTyxTQUFTLElBQVQsRUFBZSxFQUFFLFVBQUYsRUFBUSxnQkFBUixFQUFmLENBQVA7QUFDQTs7QUFFRDtBQUNBLFNBQU8sUUFBUSxPQUFSLENBQWdCO0FBQ3RCLFdBQVEsTUFEYztBQUV0QixrQ0FBZ0MsT0FBaEMsZUFGc0I7QUFHdEIsU0FBUTtBQUhjLEdBQWhCLEVBSUosSUFKSSxDQUlDLFlBQU07QUFDYjtBQUNBLFVBQU8sU0FBUyxJQUFULEVBQWUsRUFBRSxVQUFGLEVBQVEsZ0JBQVIsRUFBZixDQUFQO0FBQ0EsR0FQTSxFQU9KLGVBQU87QUFDVDtBQUNBLFVBQU8sU0FBUyxpQkFBaUI7QUFDaEMsVUFBUyxrQkFEdUI7QUFFaEMsYUFBUywyQkFGdUI7QUFHaEMsVUFBUyxJQUh1QjtBQUloQyxhQUFTO0FBSnVCLElBQWpCLENBQVQsQ0FBUDtBQU1BLEdBZk0sQ0FBUDtBQWlCQTtBQUVELENBdkREOztBQXlEQSxPQUFPLHlCQUFQLEdBQW1DLGNBQW5DIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXHJcbiAqIEJhc2VkIG9uIElhbXBvcnQncyBKYXZhU2NyaXB0IFNESy5cclxuICogLSBJYW1wb3J0J3MgSmF2YVNjcmlwdCBTREsgc2hvdWxkIGJlIGltcG9ydGVkIGJlZm9yZSB0aGlzIHBsdWdpbi5cclxuICogLSBgSU1QLmluaXQoJ2lkJyk7YCBzaG91bGQgYmUgY2FsbGVkIGJlZm9yZSBgbWFrZVBheW1lbnRgIGdldHMgY2FsbGVkLlxyXG4gKiAtIFdlYnNpdGU6IGh0dHA6Ly9pYW1wb3J0LmtyL1xyXG4gKiAtIEd1aWRlOiBodHRwczovL2RvY3MuaWFtcG9ydC5rci9cclxuICovXHJcblxyXG5jb25zdCBSZWRpcmVjdGlvbkVycm9yID0gb3B0aW9ucyA9PiB7XHJcblxyXG5cdGNvbnN0IHtcclxuXHRcdGNvZGUsXHJcblx0XHR0eXBlLFxyXG5cdFx0c3ViamVjdCxcclxuXHRcdG1lc3NhZ2VcclxuXHR9ID0gb3B0aW9ucztcclxuXHJcblx0Y29uc3QgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG5cclxuXHRlcnIuY29kZSA9IGNvZGU7XHJcblx0ZXJyLnR5cGUgPSB0eXBlO1xyXG5cdGVyci5zdWJqZWN0ID0gc3ViamVjdDtcclxuXHJcblx0cmV0dXJuIGVycjtcclxufTtcclxuXHJcbmNvbnN0IGltcGxlbWVudGF0aW9uID0gKG9wdGlvbnMgPSB7fSkgPT4ge1xyXG5cclxuXHRjb25zdCB7XHJcblx0XHQvLyBTZXQgcmVkaXJlY3Rpb24gVVJMIGZvciBtb2JpbGUgcGF5bWVudHMgKElmIGl0J3MgbmVjZXNzYXJ5KS5cclxuXHRcdC8vIERlZmF1bHQgdmFsdWUgaXMgdGhlIHJvb3QgVVJMIG9mIHRoZSB3ZWJzaXRlLlxyXG5cdFx0Ly8gUmVmZXJlbmNlOiBodHRwczovL2RvY3MuaWFtcG9ydC5rci9pbXBsZW1lbnRhdGlvbi9wYXltZW50I21vYmlsZS13ZWItMVxyXG5cdFx0cmVkaXJlY3RVUkwgPSBkYXRhID0+IHtcclxuXHJcblx0XHRcdGNvbnN0IGxvY2F0aW9uID0gd2luZG93LmxvY2F0aW9uO1xyXG5cdFx0XHRjb25zdCB0eXBlID0gZGF0YS5zdWJzY3JpcHRpb24gPyAnc3Vic2NyaXB0aW9uJyA6ICdvcmRlcic7XHJcblxyXG5cdFx0XHQvLyBgP3R5cGVgIHF1ZXJ5IGlzIHJlcXVpcmVkLlxyXG5cdFx0XHRyZXR1cm4gYCR7bG9jYXRpb24ucHJvdG9jb2x9Ly8ke2xvY2F0aW9uLmhvc3R9P3R5cGU9JHt0eXBlfWA7XHJcblx0XHR9LFxyXG5cdFx0Ly8gQmlsbGluZyBrZXkgbmFtZSBwbGFjZWhvbGRlci5cclxuXHRcdGJpbGxpbmdLZXlOYW1lID0gJ0JpbGxpbmcgS2V5JyxcclxuXHRcdC8vIE9yZGVyIG5hbWUgZ2V0dGVyLiBSZWNvbW1lbmRlZCBtYXggbGVuZ3RoIC0+IDE2XHJcblx0XHRvcmRlck5hbWUgPSBjYXJ0ID0+IChjYXJ0Lml0ZW1zWzBdLnByb2R1Y3QubmFtZSB8fCAnJykuc2xpY2UoMCwgMTYpLFxyXG5cdFx0Ly8gQ3VzdG9tZXIgbmFtZSBnZXR0ZXIuXHJcblx0XHRidXllck5hbWUgPSBjdXN0b21lciA9PiBjdXN0b21lci5uYW1lLmZ1bGwsXHJcblx0XHQvLyBBZGRyZXNzIGdldHRlci5cclxuXHRcdGJ1eWVyQWRkcmVzcyA9IGFkZHJlc3MgPT4gW1xyXG5cdFx0XHRhZGRyZXNzLmFkZHJlc3MxLFxyXG5cdFx0XHRhZGRyZXNzLmFkZHJlc3MyXHJcblx0XHRdLmZpbHRlcih2ID0+IHYpLmpvaW4oJyAnKS50cmltKCksXHJcblx0XHQvLyBNb2JpbGUgcGF5bWVudCByZWRpcmVjdGlvbiBoYW5kbGVyLlxyXG5cdFx0cmVkaXJlY3Rpb25DYWxsYmFjayA9IChlcnIsIGRhdGEpID0+IHtcclxuXHJcblx0XHRcdGlmIChlcnIpIHtcclxuXHJcblx0XHRcdFx0Y29uc3QgbWVzc2FnZSA9IFRodW5kZXIucG9seWdsb3QudCgnY2hlY2tvdXQucGF5bWVudEZhaWxlZCcpO1xyXG5cclxuXHRcdFx0XHRUaHVuZGVyLm5vdGlmeSgnZXJyb3InLCBgJHsgbWVzc2FnZSB9IFskeyBlcnIuY29kZSB9XWApO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gVGh1bmRlci5vcGVuKGAkeyBlcnIudHlwZSB9LWRldGFpbGAsIHsgW2Vyci50eXBlXTogZXJyLnN1YmplY3QgfSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBUaHVuZGVyLm9wZW4oJ2NoZWNrb3V0LXN1Y2Nlc3MnLCBkYXRhKTtcclxuXHRcdH1cclxuXHR9ID0gb3B0aW9ucztcclxuXHJcblx0VGh1bmRlci5saXN0ZW5lcnMuaW5pdC5wdXNoKCgpID0+IHtcclxuXHRcdC8vIEhhbmRsZSBtb2JpbGUgcmVkaXJlY3Rpb25zIGF1dG9tYXRpY2FsbHlcclxuXHRcdGltcGxlbWVudGF0aW9uLmhhbmRsZVJlZGlyZWN0KHJlZGlyZWN0aW9uQ2FsbGJhY2spO1xyXG5cdH0pO1xyXG5cclxuXHRyZXR1cm4gKGRhdGEgPSB7fSwgY2FsbGJhY2spID0+IHtcclxuXHJcblx0XHRjb25zdCB7XHJcblx0XHRcdHBheW1lbnRNZXRob2QsXHJcblx0XHRcdGNhcnQsXHJcblx0XHRcdG9yZGVyLFxyXG5cdFx0XHRzdWJzY3JpcHRpb24sXHJcblx0XHRcdGN1c3RvbWVyLFxyXG5cdFx0fSA9IGRhdGE7XHJcblxyXG5cdFx0aWYgKHBheW1lbnRNZXRob2QuY2FyZEZpZWxkcykge1xyXG5cdFx0XHQvLyBTaW5jZSBJYW1wb3J0IGRvZXNuJ3Qgc3VwcG9ydCBtYW51YWwgcGF5bWVudCB3aXRoIGNhcmQgaW5mb3JtYXRpb24sXHJcblx0XHRcdC8vIGRvIG5vdCBjYWxsIGBJTVAucmVxdWVzdF9wYXlgIG1ldGhvZC5cclxuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKG51bGwsIHt9KTtcclxuXHRcdH1cclxuXHJcblx0XHRjb25zdCBzdWJqZWN0ID0gc3Vic2NyaXB0aW9uIHx8IG9yZGVyO1xyXG5cdFx0Y29uc3QgYWRkcmVzcyA9IHN1YmplY3QuYWRkcmVzcy5zaGlwcGluZztcclxuXHRcdGNvbnN0IGN1cnJlbmN5ID0gc3ViamVjdC5jdXJyZW5jeS5wYXltZW50LmNvZGU7XHJcblxyXG5cdFx0Y29uc3QgdGF4RnJlZSA9IGNhcnQgPyBpbXBsZW1lbnRhdGlvbi5jYWxjdWxhdGVUYXhGcmVlKGNhcnQpIDogbnVsbDtcclxuXHJcblx0XHQvLyBEZWZhdWx0IHJlcXVlc3Qgb3B0aW9ucyBmb3Igb3JkZXJzIGFuZCBzdWJzY3JpcHRpb25zXHJcblx0XHRjb25zdCBwYXJhbXMgPSAkLmV4dGVuZCh7XHJcblx0XHRcdHBnOiAgICAgICAgICAgICBwYXltZW50TWV0aG9kLm1ldGEucGcsXHJcblx0XHRcdHBheV9tZXRob2Q6ICAgICBwYXltZW50TWV0aG9kLm1ldGEucGF5TWV0aG9kLFxyXG5cdFx0XHRjdXJyZW5jeTogICAgICAgY3VycmVuY3ksXHJcblx0XHRcdGJ1eWVyX2VtYWlsOiAgICBjdXN0b21lci5lbWFpbCB8fCBudWxsLFxyXG5cdFx0XHRidXllcl9uYW1lOiAgICAgYnV5ZXJOYW1lKGN1c3RvbWVyKSxcclxuXHRcdFx0YnV5ZXJfdGVsOiAgICAgIGN1c3RvbWVyLm1vYmlsZSB8fCBjdXN0b21lci5waG9uZSwgLy8gUmVxdWlyZWQgYnkgSWFtcG9ydFxyXG5cdFx0XHRidXllcl9hZGRyOiAgICAgYnV5ZXJBZGRyZXNzKGFkZHJlc3MpLFxyXG5cdFx0XHRidXllcl9wb3N0Y29kZTogYWRkcmVzcy5wb3N0Y29kZSxcclxuXHRcdFx0bV9yZWRpcmVjdF91cmw6IHJlZGlyZWN0VVJMKGRhdGEpIC8vIFNldCByZWRpcmVjdCBVUkwgaWYgaXMgbmVlZGVkLi4uXHJcblx0XHR9LCBzdWJzY3JpcHRpb24gPyB7XHJcblx0XHRcdC8vIFN1YnNjcmlwdGlvbiBjYXNlLCBJc3N1ZSBhIGJpbGxpbmcga2V5IGZvciBzdWJzY3JpcHRpb25zLlxyXG5cdFx0XHQvLyBSZWZlcmVuY2U6IGh0dHBzOi8vZ2l0aHViLmNvbS9pYW1wb3J0L2lhbXBvcnQtbWFudWFsL3RyZWUvbWFzdGVyLyVFQiVCOSU4NCVFQyU5RCVCOCVFQyVBNiU5RCVFQSVCMiVCMCVFQyVBMCU5Qy9leGFtcGxlXHJcblx0XHRcdG1lcmNoYW50X3VpZDogc3Vic2NyaXB0aW9uLl9pZCwgLy8gU2V0IGBtZXJjaGFudF91aWRgIGFzIGEgc3Vic2NyaXB0aW9uJ3MgaWRcclxuXHRcdFx0Ly8gQmlsbGluZyBrZXkgd2lsbCBiZSBpc3N1ZWQuLlxyXG5cdFx0XHQvLyBGb3IgYSByZWdpc3RlcmVkIGN1c3RvbWVyOiBjdXN0b21lci5faWRcclxuXHRcdFx0Ly8gRm9yIGEgbm9uLXJlZ2lzdGVyZWQgY3VzdG9tZXI6IHN1YnNjcmlwdGlvbi5faWRcclxuXHRcdFx0Y3VzdG9tZXJfdWlkOiBzdWJzY3JpcHRpb24uY3VzdG9tZXIuX2lkIHx8IHN1YnNjcmlwdGlvbi5faWQsXHJcblx0XHRcdG5hbWU6ICAgICAgICAgYmlsbGluZ0tleU5hbWUsICAgLy8gUGxhY2Vob2xkZXIgbmFtZVxyXG5cdFx0XHRhbW91bnQ6ICAgICAgIDAsXHJcblx0XHR9IDogJC5leHRlbmQoe1xyXG5cdFx0XHQvLyBSZWd1bGFyIG9yZGVyIGNhc2UuXHJcblx0XHRcdG1lcmNoYW50X3VpZDogb3JkZXIuX2lkLFxyXG5cdFx0XHRuYW1lOiAgICAgICAgIG9yZGVyTmFtZShjYXJ0KSxcclxuXHRcdFx0Ly8gSGFuZGxlIHJpY2ggZGF0YSBjYXNlcy5cclxuXHRcdFx0YW1vdW50OiAgICAgICB0eXBlb2Ygb3JkZXIudG90YWwuYW1vdW50LnJhdyA9PT0gJ251bWJlcicgP1xyXG5cdFx0XHRcdFx0XHRcdG9yZGVyLnRvdGFsLmFtb3VudC5yYXcgOlxyXG5cdFx0XHRcdFx0XHRcdG9yZGVyLnRvdGFsLmFtb3VudCxcclxuXHRcdH0sIHRheEZyZWUgPyB7XHJcblx0XHRcdC8vIGB0YXhfZnJlZWAgcGFyYW0gaXMgb25seSBzdXBwb3J0ZWQgZm9yIHJlZ3VsYXIgb3JkZXJzIGZvciBub3cuXHJcblx0XHRcdHRheF9mcmVlOiB0YXhGcmVlXHJcblx0XHR9IDoge30pKTtcclxuXHJcblx0XHRyZXR1cm4gSU1QLnJlcXVlc3RfcGF5KHBhcmFtcywgcmVzID0+IHtcclxuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKHJlcy5zdWNjZXNzID8gbnVsbCA6IHJlcywgcmVzKTtcclxuXHRcdH0pO1xyXG5cclxuXHR9O1xyXG5cclxufTtcclxuXHJcbmltcGxlbWVudGF0aW9uLmNhbGN1bGF0ZVRheEZyZWUgPSBjYXJ0ID0+IHtcclxuXHJcblx0Y29uc3QgaXNaZXJvVGF4ZWQgPSBpdGVtID0+IGl0ZW0udGF4ZWQuY29udmVydGVkUmF3ID09PSAwO1xyXG5cclxuXHQvLyBIYW5kbGUgYHRheF9mcmVlYCBwYXJhbWV0ZXIgb2YgSWFtcG9ydCBmb3IgdGF4IGV4ZW1wdGVkICYgemVyby1yYXRlZCBwcm9kdWN0cy5cclxuXHQvLyBSZWZlcmVuY2U6IGh0dHBzOi8vZG9jcy5pYW1wb3J0LmtyL3RlY2gvdmF0XHJcblx0Y29uc3QgaXRlbXNXaXRoWmVyb1RheCA9IFtdLmNvbmNhdChcclxuXHRcdC8vIFplcm8gdGF4ZWQgaXRlbXNcclxuXHRcdGNhcnQuaXRlbXNcclxuXHRcdFx0LnJlZHVjZSgoaXRlbXMsIGl0ZW0pID0+IGl0ZW1zLmNvbmNhdChpdGVtLCBpdGVtLmJ1bmRsZUl0ZW1zIHx8IFtdKSwgW10pXHJcblx0XHRcdC5maWx0ZXIoaXNaZXJvVGF4ZWQpXHJcblx0XHRcdC5tYXAoaXRlbSA9PiBpdGVtLnByaWNlLndpdGhUYXguY29udmVydGVkUmF3KSxcclxuXHRcdC8vIFplcm8gdGF4ZWQgc2hpcG1lbnRcclxuXHRcdChjYXJ0LnNoaXBtZW50cyB8fCBbXSlcclxuXHRcdFx0LmZpbHRlcihpc1plcm9UYXhlZClcclxuXHRcdFx0Lm1hcChzaGlwbWVudCA9PiBzaGlwbWVudC5mZWUud2l0aFRheC5jb252ZXJ0ZWRSYXcpXHJcblx0KS5maWx0ZXIodiA9PiB2ICE9PSAwKTsgLy8gSnVzdCBpbiBjYXNlIHdoZXJlIGFuIGFjdHVhbCBpdGVtL3NoaXBtZW50J3MgcHJpY2UgaXMgMFxyXG5cclxuXHRpZiAoaXRlbXNXaXRoWmVyb1RheC5sZW5ndGggPT09IDApIHtcclxuXHRcdC8vIFRoZXJlIGFyZSBubyB6ZXJvIHRheGVkIGl0ZW1zIGFuZCBzaGlwbWVudHNcclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH1cclxuXHJcblx0Ly8gQnVpbGQgYSBzdW0gcHJpY2Ugb2YgdGF4IGZyZWUgaXRlbXMgYW5kIHNoaXBtZW50cy5cclxuXHQvLyBJdCBpcyBpbXBvcnRhbnQgdGhhdCB3ZSB1c2UgdGhlIHBheW1lbnQgY3VycmVuY3kncyBwcmVjaXNpb24gdG8gY2FsY3VsYXRlIHN1bS5cclxuXHQvLyBSZWZlcmVuY2U6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE0NTg2MzMvaG93LXRvLWRlYWwtd2l0aC1mbG9hdGluZy1wb2ludC1udW1iZXItcHJlY2lzaW9uLWluLWphdmFzY3JpcHRcclxuXHRjb25zdCBwcmVjaXNpb24gPSBjYXJ0LmN1cnJlbmN5LnBheW1lbnQucHJlY2lzaW9uO1xyXG5cclxuXHRsZXQgc3VtID0gaXRlbXNXaXRoWmVyb1RheC5yZWR1Y2UoKHN1bSwgdikgPT4gc3VtICsgdiwgMCk7XHJcblxyXG5cdGlmIChwcmVjaXNpb24gPiAwKSB7XHJcblx0XHRzdW0gPSBwYXJzZUZsb2F0KHBhcnNlRmxvYXQoc3VtKS50b1ByZWNpc2lvbihwcmVjaXNpb24pKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBzdW07XHJcblxyXG59O1xyXG5cclxuaW1wbGVtZW50YXRpb24uaGFuZGxlUmVkaXJlY3QgPSBjYWxsYmFjayA9PiB7XHJcblxyXG5cdGNvbnN0IFRodW5kZXIgPSB3aW5kb3cuVGh1bmRlcjtcclxuXHRjb25zdCBxdWVyeSA9IFRodW5kZXIudXRpbC51cmxRdWVyeSgpO1xyXG5cclxuXHRjb25zdCB0eXBlcyA9IHtcclxuXHRcdG9yZGVyOiAgICAgICAgdHJ1ZSxcclxuXHRcdHN1YnNjcmlwdGlvbjogdHJ1ZSxcclxuXHR9O1xyXG5cclxuXHRpZiAodHlwZXNbcXVlcnkudHlwZV0gJiYgcXVlcnkubWVyY2hhbnRfdWlkKSB7XHJcblxyXG5cdFx0Y29uc3Qge1xyXG5cdFx0XHRpbXBfc3VjY2VzczogIHN1Y2Nlc3MsXHJcblx0XHRcdHR5cGU6ICAgICAgICAgdHlwZSxcclxuXHRcdFx0bWVyY2hhbnRfdWlkOiBzdWJqZWN0XHJcblx0XHR9ID0gcXVlcnk7XHJcblxyXG5cdFx0Ly8gUGF5bWVudCBmYWlsdXJlIGNhc2UuLi5cclxuXHRcdGlmIChzdWNjZXNzICE9PSAndHJ1ZScpIHtcclxuXHJcblx0XHRcdHJldHVybiBjYWxsYmFjayhSZWRpcmVjdGlvbkVycm9yKHtcclxuXHRcdFx0XHRjb2RlOiAgICAnaWFtcG9ydC1wYXltZW50JyxcclxuXHRcdFx0XHRtZXNzYWdlOiAnRmFpbGVkIHRvIG1ha2UgYSBwYXltZW50LicsXHJcblx0XHRcdFx0dHlwZTogICAgdHlwZSxcclxuXHRcdFx0XHRzdWJqZWN0OiBzdWJqZWN0XHJcblx0XHRcdH0pKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBQYXltZW50IHN1Y2Nlc3MgY2FzZS4uLlxyXG5cdFx0aWYgKHR5cGUgPT09ICdvcmRlcicpIHtcclxuXHRcdFx0Ly8gUmVndWxhciBvcmRlciBjYXNlXHJcblx0XHRcdHJldHVybiBjYWxsYmFjayhudWxsLCB7IHR5cGUsIHN1YmplY3QgfSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU3Vic2NyaXB0aW9uIGNhc2UsIHdlIHNob3VsZCBwb3N0IHNjaGVkdWxlcyB0byBJYW1wb3J0IHZpYSBDbGF5ZnVsJ3MgQVBJXHJcblx0XHRyZXR1cm4gVGh1bmRlci5yZXF1ZXN0KHtcclxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXHJcblx0XHRcdHVybDogICAgYC92MS9tZS9zdWJzY3JpcHRpb25zLyR7c3ViamVjdH0vc2NoZWR1bGVkYCxcclxuXHRcdFx0ZGF0YTogICB7fSxcclxuXHRcdH0pLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHQvLyBTY2hlZHVsaW5nIHN1Y2NlZWRlZC4uLlxyXG5cdFx0XHRyZXR1cm4gY2FsbGJhY2sobnVsbCwgeyB0eXBlLCBzdWJqZWN0IH0pO1xyXG5cdFx0fSwgZXJyID0+IHtcclxuXHRcdFx0Ly8gU2NoZWR1bGluZyBmYWlsZWQuLi5cclxuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKFJlZGlyZWN0aW9uRXJyb3Ioe1xyXG5cdFx0XHRcdGNvZGU6ICAgICdjbGF5ZnVsLXNjaGVkdWxlJyxcclxuXHRcdFx0XHRtZXNzYWdlOiAnRmFpbGVkIHRvIHBvc3Qgc2NoZWR1bGVzLicsXHJcblx0XHRcdFx0dHlwZTogICAgdHlwZSxcclxuXHRcdFx0XHRzdWJqZWN0OiBzdWJqZWN0XHJcblx0XHRcdH0pKTtcclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcblxyXG59O1xyXG5cclxud2luZG93LlRodW5kZXJNYWtlUGF5bWVudElhbXBvcnQgPSBpbXBsZW1lbnRhdGlvbjsiXX0=

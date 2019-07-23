const set = require('lodash.set');
const productCatalog = require('./lib/productCatalog.js');

module.exports = Thunder => {

	const implementation = {
		name: 'product-detail'
	};

	implementation.options = () => ({
		product:          '',                                    // Product ID to render
		productActions:   Thunder.options.productActions,        // ['add-to-cart', 'buy-now'],
		optionSelector:   Thunder.options.productOptionSelector, // 'combined' || 'separated'
		descriptionStyle: 'detailed',                            // 'simple' || 'detailed'
		useFollowingNav:  true,                                  // Use following navigation?
		useReviews:       Thunder.options.productReview,         // Use reviews?
		useRating:        (                                      // Use review rating?
			Thunder.options.productReview &&
			Thunder.options.productReviewRating
		),

		onBuyNow: function($container, context, item) {
			return Thunder.render($container, 'cart', { items: [item._id] });
		},
		onItemAdd: function($container, context) {
			return Thunder.notify('success', context.m('itemAddSuccess'));
		},
		onGoToCart: function($container, context) {
			return Thunder.render($container, 'cart');
		}
	});

	implementation.pre = function(context, callback) {

		context.options.productActions = Thunder.util.parseArrayString(context.options.productActions);

		const { product } = context.options;

		context.isUnavailableProduct = product => {

			return (
				// A product is unavailable
				!product.available ||
				(
					product.variants && // While a product has variants array
					(
						// A product doesn't have any variants
						!product.variants.length ||
						// All variants are unavailable
						product.variants.every(v => !v.available)
					)
				) ||
				// A tangible product doesn't support any shipping methods
				(
					product.type === 'tangible' &&
					product.shipping.methods.length === 0
				)
			);

		};

		context.isSoldOutProduct = product => {
			return product.variants.every(v => v.quantity && v.quantity.raw === 0);
		};

		context.isUnavailableVariant = (product, variant) => {

			if (context.isUnavailableProduct(product) ||
				!variant.available) {
				return 'notAvailableVariant';
			}

			if (variant.quantity &&
				variant.quantity.raw === 0) {
				return 'soldOutVariant';
			}

		};

		context.showOptionSelector = () => {
			return (
				context.options.optionSelector === 'separated' &&
				context.product.options.length >= 2 &&
				context.product.variants.length >= 2
			);
		};

		const errors = {
			'not-existing-product': context.m('notExistingProduct'),
			default:                context.m('productReadFailed')
		};

		return Thunder.request({
			method: 'GET',
			url:    `/v1/products/${product}`,
			query:  {
				embed: '+bundles.items.product.shipping'
			}
		}).then((product, textStatus, jqXHR) => {

			return Thunder.util.getCurrency(jqXHR.getResponseHeader('content-currency')).then(currency => {

				context.currency = currency;
				context.product = moveUnavailablesToEnd(product);

				return callback(null, context);

			});

			function moveUnavailablesToEnd(product) {

				const okVariants = [];
				const notOkVariants = [];

				product.variants.forEach(variant => {
					return context.isUnavailableVariant(product, variant) ?
							notOkVariants.push(variant) :
							okVariants.push(variant);
				});

				product.variants = [].concat(okVariants, notOkVariants);

				product.bundles.forEach(bundle => {

					const okItems = [];
					const notOkItems = [];

					bundle.items.forEach(item => {
						return context.isUnavailableVariant(item.product, item.variant) ?
								notOkItems.push(item) :
								okItems.push(item);
					});

					bundle.items = [].concat(okItems, notOkItems);

				});

				return product;

			}

		}, err => Thunder.util.requestErrorHandler(
			err.responseJSON,
			errors,
			callback
		));

	};

	implementation.bind = function(context) {

		const $container = $(this);
		const $followingNav = $(this).find('.thunder--following-nav-container');

		Thunder.util.followingNavigation($followingNav, context.options.useFollowingNav, [
			{
				name: context.m('productInfo'),
				$el:  $container.find('.thunder--product-detail')
			},
			context.options.useReviews ? {
				name: [
					context.m('productReviews'),
					`<span class="thunder--product-total-comments">(${context.product.totalReview.converted})</span>`,
				].join(' '),
				$el:  $container.find('.thunder--product-reviews-wrapper')
			} : null,
		].filter(v => v));

	};

	implementation.init = function(context) {

		const product = context.product;

		const variantMap = [].concat(
			context.product.variants,
			context.product.bundles.reduce((variants, bundle) => {
				return bundle.items.reduce((variants, item) => {
					return variants.concat(item.variant);
				}, variants);
			}, [])
		).reduce((o, variant) => {
			return set(o, variant._id, variant);
		}, {});

		const bundleProductMap = context.product.bundles.reduce((o, bundle) => {
			return bundle.items.reduce((o, item) => set(o, item.product._id, item.product), o);
		}, {});

		const variantToBundleMap = context.product.bundles.reduce((o, bundle) => {
			return bundle.items.reduce((o, item) => {
				return set(o, item.variant._id, bundle);
			}, o);
		}, {});

		const $container = $(this);
		const $optionSelect = $(this).find('.thunder--product-option-wrap select');
		const $variantSelector = $(this).find('.thunder--product-info .thunder--product-option .thunder--product-variant select');
		const $shippingMethodSelector = $(this).find('.thunder--shipping-method select');
		const $itemQuantityInput = $(this).find('.thunder--item-quantity input');
		const $bundleItems = $(this).find('.thunder--product-bundle-item');
		const $bundleItemSelectors = $bundleItems.find('select');
		const $totalWrap = $(this).find('.thunder--price-total-wrap');
		const $totalValue = $(this).find('.thunder--price-total-value');
		const $addToCart = $(this).find('.thunder--add-to-cart');
		const $buyNow = $(this).find('.thunder--buy-now');
		const $goToCart = $(this).find('.thunder--go-to-cart');

		const variationToVariants = context.product.variants.reduce((o, v) => {

			const key = v.types.map(type => type.variation._id).sort().join('.');

			return set(o, [key], v._id);

		}, {});

		const addToCartSpinner = Thunder.util.makeAsyncButton($addToCart);

		productCatalog($container);

		$bundleItemSelectors.on('change', function() {

			const value = $(this).val();
			const $quantity = $(this).closest('.thunder--product-bundle-item').find('input[type="number"]');

			$quantity.val(value ? 1 : 0);

		});

		const calculatePrice = () => {

			const item = buildItemData();

			if (!item || !item.variant || !item.quantity) {
				return $totalWrap.hide();
			}

			const price = [].concat(item, item.bundleItems || []).map(item => {

				const variant = variantMap[item.variant];
				const quantity = item.quantity;

				return variant && quantity ? variant.price.sale.raw * quantity : 0;

			}).reduce((sum, price) => sum + price, 0);

			$totalValue.text(Thunder.util.formatPrice(price, context.currency));

			return price ? $totalWrap.fadeIn(400) : $totalWrap.hide();
		};

		$variantSelector.on('change', function() {

			const variant = variantMap[$(this).val()];

			if (!variant) return;

			variant.types.forEach(({ option, variation }) => {
				$optionSelect.filter(`[name="${option._id}"]`).val(variation._id);
			});

		});

		// 옵션 선택 이벤트 ('separated')
		$optionSelect.on('change', () => {

			const variations = $optionSelect.map(function() {
				return $(this).val();
			}).get().sort();

			const key = variations.join('.');

			const value = variationToVariants[key] || null;

			if (!value && variations.length === $optionSelect.length) {
				$totalWrap.hide();
				$totalValue.text('');
				Thunder.notify('error', context.m('notExistingVariant'));
			}

			return $variantSelector.val() === value ? null : $variantSelector.val(value);
		});

		$container.find('input,select').on('change', calculatePrice);

		$addToCart.on('click', () => addToCart());

		$buyNow.on('click', () => addToCart(item => Thunder.execute(
			context.options.onBuyNow,
			$container,
			context,
			item
		)));

		$goToCart.on('click', () => Thunder.execute(
			context.options.onGoToCart,
			$container,
			context
		));

		if (context.options.useReviews) {

			const $reviewsContainer = $(this).find('.thunder--product-reviews-wrapper');

			Thunder.render($reviewsContainer, 'product-reviews', {
				product:       context.product._id,
				productRating: context.options.useRating ?
								product.rating :
								null,
				useRating:     context.options.useRating,
			});

		}

		function clearAllOptions() {
			$totalWrap.hide();
			$totalValue.text('');
			$container.find('.thunder--product-option select').val('');
			$container.find('.thunder--product-option input[type="number"]').val(1);
			$container.find('.thunder--product-bundles select').val('');
			$container.find('.thunder--product-bundles input[type="number"]').val(0);
		}

		function addToCart(success) {
			const item = buildItemData();

			success = success || (() => {

				$goToCart.show();

				Thunder.execute(
					context.options.onItemAdd,
					$container,
					context
				);

			});

			if (!validateItemData(item)) {
				return addToCartSpinner.done();
			}

			const errors = {
				'items-exceeded': context.m('itemsExceeded'),
				default:          context.m('itemAddFailed'),
			};

			if (Thunder.authenticated()) {

				return Thunder.request({
					method: 'POST',
					url:    '/v1/me/cart/items',
					data:   item
				}).then(item => {
					addToCartSpinner.done();
					clearAllOptions();
					return success(item);
				}, err => Thunder.util.requestErrorHandler(
					err.responseJSON,
					errors,
					err => addToCartSpinner.done()
				));

			} else {

				Thunder.Cart.addItem(item, err => {

					if (err) {
						addToCartSpinner.done();
						return Thunder.notify('error', errors[err.code || 'default'] || errors.default);
					}

					addToCartSpinner.done();
					clearAllOptions();
					return success(item);
				});
			}

		}

		function validateItemData(itemData) {
			if (!itemData.variant) {
				Thunder.notify('error', context.m('variantRequired'));
				return false;
			}

			if (!validateQuantity(product.name, itemData)) {
				return false;
			}

			const selectedBundles = [];

			for (const item of itemData.bundleItems || []) {

				const bundle = variantToBundleMap[item.variant];

				selectedBundles.push(bundle);

				if (!validateQuantity(bundle.name, item)) {
					return false;
				}

				if (bundle.required &&
					item.quantity !== itemData.quantity) {
					Thunder.notify('error', context.m('invalidRequiredBundleItemQuantity', { bundle: bundle.name }));
					return false;
				}

			}

			const requiredBundles = product.bundles.filter(b => b.required);

			for (const bundle of requiredBundles) {

				if (selectedBundles.indexOf(bundle) === -1) {
					Thunder.notify('error', context.m('requiredBundleItemRequired', { bundle: bundle.name }));
					return false;
				}

			}

			return true;

			function validateQuantity(scope, item) {

				if (!item.quantity) {
					Thunder.notify('error', context.m('itemQuantityRequired', { scope }));
					return false;
				}

				const variant = variantMap[item.variant];

				if (variant.quantity &&
					variant.quantity.raw < item.quantity) {
					Thunder.notify('error', context.m('exceededItemQuantity', { scope }));
					return false;
				}

				return true;

			}

		}

		function buildItemData() {

			const shippingMethod = $shippingMethodSelector.val();
			const bundleItems = [];

			$bundleItems.each(function() {

				const [product, variant] = ($(this).find('select').val() || '').split('.');
				const bundleItemQuantity = $(this).find('input[type="number"]').val() || 0;

				if (!product || !variant) return;

				bundleItems.push({
					product:        product,
					variant:        variant,
					shippingMethod: bundleProductMap[product].type === 'tangible' ?
										shippingMethod :
										null,
					quantity:       bundleItemQuantity ? parseInt(bundleItemQuantity) : null,
				});

			});

			const itemQuantity = $itemQuantityInput.val() || 0;
			const variant = $variantSelector.val() || (
				product.variants.length === 1 ?
					product.variants[0]._id :
					null
			) || null;

			return {
				product:        product._id,
				variant:        variant,
				shippingMethod: shippingMethod,
				quantity:       itemQuantity ? parseInt(itemQuantity) : null,
				bundleItems:    bundleItems
			};

		}

	};
	return implementation;

};
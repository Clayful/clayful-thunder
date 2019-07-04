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
		}).then((data, textStatus, jqXHR) => {
			Thunder.util.getCurrency(jqXHR.getResponseHeader('content-currency'))
			.then(res => context.currency = res, err => new Error(err));
			return callback(null, set(context, 'product', data));

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
		const $variantSelector = $(this).find('.thunder--product-info .thunder--product-variant select');
		const $shippingMethodSelector = $(this).find('.thunder--shipping-method select');
		const $itemQuantityInput = $(this).find('.thunder--item-quantity input');
		const $bundleItems = $(this).find('.thunder--product-bundle-item');
		const $bundleItemSelectors = $bundleItems.find('select');
		const $addToCart = $(this).find('.thunder--add-to-cart');
		const $buyNow = $(this).find('.thunder--buy-now');
		const $goToCart = $(this).find('.thunder--go-to-cart');

		const $optionSelect = $(this).find('.thunder--product-option-wrap select');
		const $bundleItemSelect = $(this).find('.thunder--product-bundles.separated').find('select');
		const $summaryBox = $(this).find('.thunder--summary-box');

		const addToCartSpinner = Thunder.util.makeAsyncButton($addToCart);
		const currentOption = context.options.optionSelector;

		productCatalog($container);

		$bundleItemSelectors.on('change', function() {

			const value = $(this).val();
			const $quantity = $(this).closest('.thunder--product-bundle-item').find('input[type="number"]');

			$quantity.val(value ? 1 : 0);

		});

		const calculatePriceSeparated = (e) => {
			let total = 0;

			$summaryBox.find('h3[data-value]').each((i, value) => {
				const price = $(value).data('value');
				const quantity = Number($(value).parent().parent().find('input').val());
				const itemTotal = price * quantity;

				total += itemTotal;
				$(value).text(Thunder.util.formatPrice(itemTotal, context.currency));
			});

			$summaryBox.find('span[data-value]').text(Thunder.util.formatPrice(total, context.currency));
		};

		const calculatePriceCombined = (e) => {
			if (e.currentTarget.name === 'shippingMethod') return;
			if (currentOption !== 'combined') return;
			const variant = $container.find([
				'.thunder--product-option',
				'.thunder--product-variant',
				'select[name="variant"]',
			].join(' '));

			const quantity = $container.find([
				'.thunder--product-option',
				'.thunder--item-quantity',
				'input[name="quantity"]'
			].join(' ')).val();

			const defaultVariant = context.product.variants.length === 1 ?
				context.product.variants[0] :
				null;

			const variantMap = context.product.variants.reduce(function(o, variant) {
				o[variant._id] = variant;
				return o;
			}, {});

			const selectedVariant = variantMap[variant.val()] || defaultVariant;
			const bundleVariantMap = context.product.bundles.reduce(function(items, bundle) {
				return items.concat(bundle.items);
			}, []).reduce(function(o, item) {
				o[item.product._id + '.' + item.variant._id] = item.variant;
				return o;
			}, {});

			if (!selectedVariant) return;

			const itemPrice = selectedVariant.price.sale.raw * quantity;
			const bundlePrice = $container.find('.thunder--product-bundle-item').map(function() {
				const variant = bundleVariantMap[$(this).find('.thunder--product-variant select').val()];
				const quantity = $(this).find('.thunder--item-quantity input[type="number"]').val();

				return variant && quantity ? variant.price.sale.raw * quantity : 0;
			}).get().reduce(function(sum, price) {
					return sum + price;
			}, 0);

			// 최종 금액 (raw)
			const price = itemPrice + bundlePrice;

			// 최종 금액이 있고 템플릿이 없을 때
			if (price && !$('.thunder--price-total-value').length) {
				const template = `
					<div class="thunder--price-total-wrap">
						<span class="thunder--price-total-label">${context.m('priceTotal')} : </span>
						<span data-value="${price}" class="thunder--price-total-value">${Thunder.util.formatPrice(price, context.currency)}</span>
					</div>`;

				$('.thunder--product-detail-buttons').before(template);

			// 최종 금액이 있고 템플릿이 있을 때
			} else if (price && $('.thunder--price-total-value').length) {
				$('.thunder--price-total-value').text(Thunder.util.formatPrice(price, context.currency));
				$('.thunder--price-total-value').data('value', price);
			}

		};

		$container.find('input, select').on('change', calculatePriceCombined);


		// 옵션 선택 이벤트 ('separated')
		$optionSelect.on('change', (e) => {
			if (e.currentTarget.value) {
				const target = {};

				$optionSelect.each((i, v) => {
					if (v.value) {
						target[v.name] = v.value;
					}
					if ($optionSelect.length === Object.keys(target).length) {
						context.product.variants.forEach((item) => {
							const types = item.types.map(v => v.variation._id); // ids
							let count = 0;

							Object.keys(target).forEach(targetItem => {
								if (types.includes(target[targetItem].split('/')[0])) ++count;
							});

							if (types.length === count && !$(`.thunder--selected-variant[data-id="${item._id}"]`).length) {
								const template = `
									<div class="thunder--selected-group" data-id="${item._id}">
										<div class="thunder--selected-variant" data-id="${item._id}">
											<div class="thunder--selected-item">
												${context.m('variant')} : ${Object.keys(target).map(val => `${val}/${target[val].split('/')[1]}`).join(', ')}
												<h3 data-value="${item.price.sale.raw}" class="thunder--selected-item-price">${item.price.sale.formatted}</h3>
											</div>
											<div class="thunder--item-quantity">
												<div>
													<input type="number" name="quantity" value="1" min="1" class="thunder--quantity" />
												</div>
											</div>
											<span data-id="${item._id}" class="thunder--selected-item-delete">×</span>
										</div>
									</div>`;

								deleteOption(); // 추가전 선택된 옵션 모두 제거

								$summaryBox.prepend(template);
								calculatePriceSeparated();

								const bundle = $summaryBox.find('.thunder--selected-bundle');

								if (bundle.length) {
									$('.thunder--selected-group').append(bundle);
								}

								// separated 선택된 옵션 제거 이벤트
								$(`.thunder--selected-item-delete[data-id="${item._id}"]`).on('click', () => {
									$summaryBox.find('.thunder--price-total-wrap').remove();
									deleteOption(item._id);
								});
								Thunder.util.quantityInput($(`.thunder--selected-variant[data-id="${item._id}"]`));
								$(`.thunder--selected-variant[data-id="${item._id}"]`).on('change', calculatePriceSeparated);
							}
						});
					}
				});
				if ($('.thunder--selected-group').length && !$summaryBox.find('.thunder--price-total-wrap').length) {
					const template = `
						<div class="thunder--price-total-wrap">
							<span class="thunder--price-total-label">${context.m('priceTotal')} : </span>
							<span data-value="${0}" class="thunder--price-total-value">${Thunder.util.formatPrice(0, context.currency)}</span>
						</div>`;

					$summaryBox.append(template);
					calculatePriceSeparated();
				}
			}

		});

		// 번들아이템 선택 이벤트 ('separated')
		$bundleItemSelect.on('change', e => {
			if (e.currentTarget.value) {
				const bundleVariantMap = context.product.bundles.reduce(function(items, bundle) {
					return items.concat(bundle.items.map(v => {
						v.required = bundle.required;
						v.bundleName = bundle.name;
						return v;
					}));
				}, []).reduce(function(o, item) {
					o[item.product._id + '.' + item.variant._id] = item.variant;
					o[item.product._id + '.' + item.variant._id].bundleName = item.bundleName;
					o[item.product._id + '.' + item.variant._id].productName = item.product.name;
					o[item.product._id + '.' + item.variant._id].required = item.required;
					return o;
				}, {});

				const targetId = e.currentTarget.value;
				const target = bundleVariantMap[targetId];

				if (!$(`.thunder--selected-bundle[data-id="${targetId}"]`).length) {
					const template = `
					<div class="thunder--selected-bundle" data-id="${targetId}">
						<div class="thunder--selected-item">
							└ ${target.bundleName}${target.required ? `(${context.m('requiredBundle')})` : ''} | ${target.productName}
							<h3 data-value="${target.price.sale.raw}" class="thunder--selected-item-price">${target.price.sale.formatted}</h3>
						</div>
						<div class="thunder--item-quantity">

							<div>
								<input type="number" name="quantity" value="1" min="1" class="thunder--quantity" />
							</div>

						</div>
						<span data-id="${targetId}" class="thunder--selected-item-delete">×</span>
					</div>`;

					// deleteBundleOption(); // 추가전 선택된 옵션 모두 제거
					const variant = $summaryBox.find('.thunder--selected-group');

					if (variant.length) {
						variant.append(template);
					} else {
						$summaryBox.append(template);
					}
					calculatePriceSeparated();

					// separated 선택된 옵션 제거 이벤트
					$(`.thunder--selected-item-delete[data-id="${targetId}"]`).on('click', () => {
						deleteBundleOption(targetId);
						calculatePriceSeparated();
					});
					Thunder.util.quantityInput($(`.thunder--selected-bundle[data-id="${targetId}"]`));
					$(`.thunder--selected-bundle[data-id="${targetId}"]`).on('change', calculatePriceSeparated);
				}
			}

		});


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

		function deleteOption(id, includeSelect) {
			if (!id) {
				if (includeSelect) {
					// 선택 옵션 초기화
					$optionSelect.each(n => {
						$optionSelect[n].value = '';
					});
					// 총 상품 금액 제거
					$summaryBox.find('.thunder--price-total-wrap').remove();
				}
				if ($('.thunder--selected-group').length) {
					$bundleItemSelect.each(n => {
						$bundleItemSelect[n].value = '';
					});
				}
				$('.thunder--selected-group[data-id]').remove();
			}
			if (id) {
				$optionSelect.each(n => {
					if ($optionSelect[n].value === id) $optionSelect[n].value = '';
				});
				$bundleItemSelect.each(n => {
					$bundleItemSelect[n].value = '';
				});
				$(`.thunder--selected-group[data-id="${id}"]`).remove();
			}
		}

		function deleteBundleOption(id) {
			if (!id) $('.thunder--selected-bundle[data-id]').remove();
			if (id) {
				$bundleItemSelect.each(n => {
					if ($bundleItemSelect[n].value === id) $bundleItemSelect[n].value = '';
				});
				$(`.thunder--selected-bundle[data-id="${id}"]`).remove();
			}
		}

		function clearAllOptions(currentOption) {
			if (currentOption === 'combined') {
				$('.thunder--price-total-wrap').remove();
				$('.thunder--product-option select').val('');
				$('.thunder--product-option input[type="number"]').val(1);
				$('.thunder--product-bundles select').val('');
				$('.thunder--product-bundles input[type="number"]').val(0);
			}
			if (currentOption === 'separated') {
				deleteOption('', true);
				deleteBundleOption();
			}
		}

		function addToCart(success) {
			const item = buildItemData(currentOption);

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
					success(item);
					clearAllOptions(currentOption);
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
					clearAllOptions(currentOption);
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

		function buildItemData(currentOption) {
			const shippingMethod = $shippingMethodSelector.val();
			const bundleItems = [];

			$bundleItems.each(function() {

				const [product, variant] = ($(this).find('select').val() || '').split('.');
				let bundleItemQuantity = 0;

				if (currentOption === 'combined') {
					bundleItemQuantity = $(this).find('input[type="number"]').val();
				} else {
					bundleItemQuantity = $(`.thunder--selected-bundle[data-id="${product}.${variant}"]`)
					.find('input[type="number"]').val();
				}

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

			let itemQuantity = currentOption === 'combined' ? $itemQuantityInput.val() :
				$('.thunder--selected-variant').find('input[type="number"]').val();

			const variant = $('.thunder--selected-variant').data('id'); // separated;

			return {
				product:        product._id,
				variant:        currentOption === 'combined' ? $variantSelector.val() : variant ||
								(
									product.variants.length === 1 ?
										product.variants[0]._id :
										null
								) ||
								null,
				shippingMethod: shippingMethod,
				quantity:       itemQuantity ? parseInt(itemQuantity) : null,
				bundleItems:    bundleItems
			};

		}

	};
	return implementation;

};
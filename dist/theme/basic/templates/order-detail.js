window.Thunder.components["order-detail"].template=function(t){var a='<div class="thunder--order-detail" data-order="'+t.order._id+'"><h2 class="'+(t.options.back?"thunder--with-back-button":"")+'">'+t.m("orderDetail")+"</h2>";if(t.options.back&&(a+='<a class="thunder--back-to-orders">',"order-list"===t.options.back.component&&(a+=""+t.m("backToOrders")),"subscription-detail"===t.options.back.component&&(a+=""+t.m("backToSubscription")),a+="</a>"),a+='<div class="thunder--order-primary-info"><div class="thunder--order-basic-info"><h3>'+t.m("orderBasicInfo")+'</h3><div class="thunder--order-status-container"><span class="thunder--tag thunder--order-status" data-status="'+t.order.status+'">'+("cancelled"===t.order.status?t.m(t.camelCase(["status",t.order.status,"by",t.order.cancellation.by])):t.m(t.camelCase(["status",t.order.status])))+"</span>",t.order.shippingStatus&&(a+='<span class="thunder--tag thunder--order-shipping-status" data-status="'+t.order.shippingStatus+'">'+t.m(t.camelCase(["shippingStatus",t.order.shippingStatus]))+"</span>"),a+="</div>",t.order.synced||(a+='<p class="thunder--order-sync-failed">'+t.m("orderSyncFailed")+"</p>"),a+='<table><tr class="thunder--order-id"><th class="thunder--data-label">'+t.m("orderId")+'</span><td class="thunder--data-value">'+t.order._id+"</span></tr>",t.order.subscription&&(a+='<tr class="thunder--subscription-id"><th class="thunder--data-label">'+t.m("subscriptionId")+'</span><td class="thunder--data-value"><a>'+t.order.subscription._id+"</a></span></tr>"),a+='</table><p class="thunder--order-created-at">'+t.m("orderCreatedAt",{time:t.order.createdAt.formatted})+"</p>",t.order.cancellation&&t.order.cancellation.reason&&(a+='<div class="thunder--order-cancellation"><h4>'+t.m("orderCancellation")+'</h4><div class="thunder--order-cancellation-reason">'+t.order.cancellation.reason+"</div></div>"),t.order.request&&(a+='<div class="thunder--order-request"><h4>'+t.m("orderRequest")+'</h4><div class="thunder--order-request-body">'+t.order.request+"</div></div>"),t.order.transactions.length){a+='<div class="thunder--order-transaction-summary"><h4>'+t.m("orderTransactionSummary")+'</h4><table class="thunder--order-transaction-details">';var e=["paid","cancelled","refunded"];if(e)for(var d,r=-1,s=e.length-1;r<s;)d=e[r+=1],a+='<tr class="thunder--total-'+d+'"><th class="thunder--data-label">'+t.m(t.camelCase(["orderTotal",d]))+'</span><td class="thunder--data-value">'+t.order.total[d].converted+"</span></tr>";a+="</table></div>"}if(t.vbanks&&t.vbanks.length){a+='<div class="thunder--order-vbanks"><h4>'+t.m("vbankInfo")+"</h4>";var n=t.vbanks;if(n)for(var l,o=-1,i=n.length-1;o<i;)l=n[o+=1],a+='<table class="thunder--vbank-info"><tbody><tr class="thunder--vbank-name"><th class="thunder--data-label">'+t.m("vbankName")+'</th><td class="thunder--data-value">'+l.name+'</td></tr><tr class="thunder--vbank-number"><th class="thunder--data-label">'+t.m("vbankNumber")+'</th><td class="thunder--data-value">'+l.number,l.holder&&(a+="&nbsp;("+l.holder+")"),a+='</td></tr><tr class="thunder--vbank-amount"><th class="thunder--data-label">'+t.m("vbankAmount")+'</th><td class="thunder--data-value">'+l.amount.converted+"</td></tr>",l.expiresAt&&(a+='<tr class="thunder--vbank-expires-at"><th class="thunder--data-label">'+t.m("vbankExpiresAt")+'</th><td class="thunder--data-value">'+l.expiresAt.formatted+"</td></tr>"),a+="</tbody></table>";a+="</div>"}t.shouldPay&&(a+='<div class="thunder--payment-container"><h4>'+t.m("processPayment")+'</h4><div class="thunder--payment-form-container"></div><button class="thunder--make-payment thunder--button-small">'+t.m("makePayment")+"</button></div>"),"cancelled"!==t.order.status&&(a+='<form class="thunder--order-cancellation-form hidden"><h4>'+t.m("cancellationDetail")+'</h4><textarea name="reason" class="thunder--order-cancellation-reason" placeholder="'+t.m("cancellationReason")+'"></textarea><button class="thunder--button-small">'+t.m("cancelOrder")+"</button></form>"),a+='<ul class="thunder--order-actions">',"placed"===t.order.status&&(a+='<li><span class="thunder--cancel-order">'+t.m("startCancellation")+"</span></li>"),a+='</ul></div><div class="thunder--order-item-details"><h3>'+t.m("orderItemDetails")+'</h3><table class="thunder--table thunder--cart-items"><thead><tr><th colspan="2">'+t.m("itemInfo")+"</th><th>"+t.m("itemQuantity")+"</th><th>"+t.m("itemPrice")+"</th></tr></thead><tbody>";var u=t.order.items;if(u)for(var c,h=-1,p=u.length-1;h<p;)if(c=u[h+=1],a+='<tr class="thunder--cart-item" data-item="'+c._id+'"><td class="thunder--cart-item-thumbnail-container"><img src="'+(c.product?t.imageURL(c.product.thumbnail,120,120):"")+'" class="thunder--cart-item-thumbnail"></td><td class="thunder--cart-item-name"><div class="thunder--cart-item-summary"><h4 class="thunder--cart-item-name">'+c.product.name+"</h4><ul>",c.variant&&c.variant.types.length>0&&(a+='<li class="thunder--cart-item-option"><span class="thunder--cart-entity-label">'+t.m("itemOption")+"</span>"+t.variantName(c.variant)+"</li>"),c.shippingMethod&&(a+='<li class="thunder--cart-item-shipping-method"><span class="thunder--cart-entity-label">'+t.m("shippingMethod")+"</span>"+c.shippingMethod.name+"</li>"),c.appliedCoupon&&(a+='<li class="thunder--cart-item-applied-coupon"><span class="thunder--cart-entity-label">'+t.m("appliedCoupon")+"</span>"+c.appliedCoupon.name+'<span data-balloon-break data-balloon-pos="up" data-balloon="'+t.couponDetail(c.appliedCoupon)+'"><span class="thunder--question-mark"></span></span></li>'),a+="</ul>",t.undownloadableStatuses[t.order.status]||"downloadable"!==c.type||(a+='<div class="thunder--download-button-wrap"><button class="thunder--button-tiny thunder--download-button" '+(c.downloadable?"":"disabled")+">"+t.m("downloadFile")+"</button>",c.download.policy.count&&(a+='<p class="thunder--download-count-view"data-total="'+c.download.policy.count.raw+'"data-current="'+c.download.downloaded.raw+'">'+t.m("nTimesDownloaded",{total:c.download.policy.count.raw,current:c.download.downloaded.raw})+"</p>"),c.download.policy.expires.type&&(a+='<p class="thunder--download-expires-view">'+t.m("downloadExpiresAt",t.toDateValues(t.calculateExpiresAt(t.order,c)))+"</p>"),a+="</div>"),a+='</div></td><td class="thunder--cart-item-quantity"><span class="thunder--cart-item-quantity-label hidden">'+t.m("itemQuantity")+'</span><span class="thunder--cart-item-quantity-value">'+c.quantity.converted+'</span></td><td class="thunder--cart-item-price"><span class="thunder--cart-item-sale-price">'+c.price.sale.converted+"</span>",c.price.sale.converted!==c.price.original.converted&&(a+='<span class="thunder--cart-item-compare-price">'+c.price.original.converted+'</span><span class="thunder--cart-item-discounted">(-'+c.discounted.converted+")</span>"),a+="</td></tr>",c.bundleItems&&c.bundleItems.length>0){var m=c.bundleItems;if(m)for(var b,v=-1,f=m.length-1;v<f;)b=m[v+=1],a+='<tr class="thunder--cart-item thunder--cart-bundle-item" data-item="'+c._id+'" data-bundle-item="'+b._id+'"><td class="thunder--cart-item-thumbnail-container"></td><td class="thunder--cart-item-name"><div class="thunder--cart-item-summary"><h4 class="thunder--cart-item-name">'+b.product.name+"</h4><ul>",b.variant&&b.variant.types.length>0&&(a+='<li class="thunder--cart-item-option"><span class="thunder--cart-entity-label">'+t.m("itemOption")+"</span>"+t.variantName(b.variant)+"</li>"),b.shippingMethod&&(a+='<li class="thunder--cart-item-shipping-method"><span class="thunder--cart-entity-label">'+t.m("shippingMethod")+"</span>"+b.shippingMethod.name+"</li>"),b.appliedCoupon&&(a+='<li class="thunder--cart-item-applied-coupon"><span class="thunder--cart-entity-label">'+t.m("appliedCoupon")+"</span>"+b.appliedCoupon.name+'<span data-balloon-break data-balloon-pos="up" data-balloon="'+t.couponDetail(b.appliedCoupon)+'"><span class="thunder--question-mark"></span></span></li>'),a+="</ul>",t.undownloadableStatuses[t.order.status]||"downloadable"!==b.type||(a+='<div class="thunder--download-button-wrap"><button class="thunder--button-tiny thunder--download-button" '+(b.downloadable?"":"disabled")+">"+t.m("downloadFile")+"</button>",b.download.policy.count&&(a+='<p class="thunder--download-count-view"data-total="'+b.download.policy.count.raw+'"data-current="'+b.download.downloaded.raw+'">'+t.m("nTimesDownloaded",{total:b.download.policy.count.raw,current:b.download.downloaded.raw})+"</p>"),b.download.policy.expires.type&&(a+='<p class="thunder--download-expires-view">'+t.m("downloadExpiresAt",t.toDateValues(t.calculateExpiresAt(t.order,b)))+"</p>"),a+="</div>"),a+='</div></td><td class="thunder--cart-item-quantity"><span class="thunder--cart-item-quantity-label hidden">'+t.m("itemQuantity")+'</span><span class="thunder--cart-item-quantity-value">'+b.quantity.converted+'</span></td><td class="thunder--cart-item-price"><span class="thunder--cart-item-sale-price">'+b.price.sale.converted+"</span>",b.price.sale.converted!==b.price.original.converted&&(a+='<span class="thunder--cart-item-compare-price">'+b.price.original.converted+'</span><span class="thunder--cart-item-discounted">(-'+b.discounted.converted+")</span>"),a+="</td></tr>"}a+="</tbody>",t.order.appliedCoupon&&(a+='<tbody><tr class="thunder--order-applied-coupon"><td colspan="4"><span class="thunder--cart-entity-label">'+t.m("appliedCoupon")+"</span>"+t.order.appliedCoupon.name+'<span data-balloon-break data-balloon-pos="up" data-balloon="'+t.couponDetail(t.order.appliedCoupon)+'"><span class="thunder--question-mark"></span></span></td></tr>'),a+='</tbody><tfoot><tr class="thunder--item-total"><th class="thunder--total-label" colspan="3">'+t.m("itemTotal")+'</th><td class="thunder--total-value"><span class="thunder--order-items-sale-price">'+t.order.total.items.price.sale.converted+"</span>",t.order.total.items.price.sale.converted!==t.order.total.items.price.original.converted&&(a+='<span class="thunder--order-items-compare-price">'+t.order.total.items.price.original.converted+'</span><span class="thunder--order-items-discounted">(-'+t.order.total.items.discounted.converted+")</span>"),a+='</td></tr><tr class="thunder--shipping-total"><th class="thunder--total-label" colspan="3">'+t.m("shippingTotal")+'</th><td class="thunder--total-value">'+t.order.total.shipping.fee.sale.converted+'</td></tr><tr class="thunder--tax-total"><th class="thunder--total-label" colspan="3">'+t.m("taxTotal")+' <span class="thunder--tax-inlcuded">('+(t.order.tax.included?t.m("taxIncluded"):t.m("taxExcluded"))+')</span></th><td class="thunder--total-value">'+t.order.total.taxed.converted+'</td></tr><tr class="thunder--order-total"><th class="thunder--total-label" colspan="3">'+t.m("orderTotal")+'</th><td class="thunder--total-value">'+t.order.total.price.withTax.converted+'</td></tr></tfoot></table></div></div><div class="thunder--order-secondary-info"><div class="thunder--order-customer-and-address"><h3>'+t.m("orderCustomerInfo")+'</h3><div class="thunder--order-customer"><h4>'+t.m("orderCustomer")+"</h4><table><tbody>";var y=t.customerFields;if(y)for(var g,w=-1,k=y.length-1;w<k;)g=y[w+=1],a+='<tr class="thunder--order-'+t.kebabCase(g.translationKey)+'"><th class="thunder--data-label">'+t.m(g.translationKey)+'</th><td class="thunder--data-value">'+(t.get(t.order.customer,g.key)||"")+"</td></tr>";a+='</tbody></table></div><div class="thunder--order-shipping-address"><h4>'+t.m("orderShippingAddress")+"</h4><table><tbody>";var C=t.recipientFields;if(C)for(var g,q=-1,x=C.length-1;q<x;)g=C[q+=1],a+='<tr class="thunder--order-'+t.kebabCase(g.translationKey)+'"><th class="thunder--data-label">'+t.m(g.translationKey)+'</th><td class="thunder--data-value">'+(t.get(t.order.address.shipping,g.key)||"")+"</td></tr>";if(a+='<tr class="thunder--address-country"><th class="thunder--data-label">'+t.m("addressCountry")+'</th><td class="thunder--data-value">'+t.countryName(t.order.address.shipping.country.code,t.order.address.shipping.country.name)+'</td></tr><tr class="thunder--address-state"><th class="thunder--data-label">'+t.m("addressState")+'</th><td class="thunder--data-value">'+(t.get(t.order.address.shipping,"state")||"")+'</td></tr><tr class="thunder--address-city"><th class="thunder--data-label">'+t.m("addressCity")+'</th><td class="thunder--data-value">'+(t.get(t.order.address.shipping,"city")||"")+'</td></tr><tr class="thunder--address-address1"><th class="thunder--data-label">'+t.m("addressAddress1")+'</th><td class="thunder--data-value">'+(t.get(t.order.address.shipping,"address1")||"")+'</td></tr><tr class="thunder--address-address2"><th class="thunder--data-label">'+t.m("addressAddress2")+'</th><td class="thunder--data-value">'+(t.get(t.order.address.shipping,"address2")||"")+'</td></tr><tr class="thunder--address-postcode"><th class="thunder--data-label">'+t.m("addressPostcode")+'</th><td class="thunder--data-value">'+(t.get(t.order.address.shipping,"postcode")||"")+"</td></tr></tbody></table></div></div>","placed"!==t.order.status&&"cancelled"!==t.order.status){if(a+='<div class="thunder--order-refunds"><h3>'+t.m("orderRefunds")+'</h3><ul class="thunder--refund-actions"><li><button class="thunder--button-tiny thunder--request-refund">'+t.m("requestRefund")+"</button></li></ul>",t.order.refunds.length||(a+='<p class="thunder--no-refunds">'+t.m("noRefunds")+"</p>"),t.order.refunds.length){a+='<table class="thunder--table thunder--order-refund-list"><thead><tr><th>'+t.m("refundStatus")+"</th><th>"+t.m("refundItems")+"</th><th>"+t.m("refundTotal")+"</th></tr></thead><tbody>";var T=t.order.refunds;if(T)for(var A,S=-1,I=T.length-1;S<I;){A=T[S+=1],a+='<tr class="thunder--order-refund" data-refund="'+A._id+'"><td><span class="thunder--tag thunder--refund-status" data-status="'+A.status+'">'+("cancelled"===A.status?t.m(t.camelCase(["refundStatus",A.status,"by",A.cancellation.by])):t.m(t.camelCase(["refundStatus",A.status])))+'</span></td><td><ul class="thunder--refund-items">';var R=A.items;if(R)for(var c,D=-1,_=R.length-1;D<_;)c=R[D+=1],a+='<li><span class="thunder--refund-item-name">'+c.item.product.name+'</span><span class="thunder--refund-item-quantity">'+c.quantity.converted+"</span></li>";a+="</ul>","requested"!==A.status&&"cancelled"!==A.status||(a+='<div class="thunder--refund-cancellation">',"requested"===A.status&&(a+='<a class="thunder--cancel-refund">'+t.m("cancelRefund")+'</a><form class="thunder--refund-cancellation-form hidden"><textarea name="reason" class="thunder--refund-cancellation-reason" placeholder="'+t.m("cancellationReason")+'"></textarea><button class="thunder--button-tiny">'+t.m("cancelRefund")+"</button></form>"),"cancelled"===A.status&&A.cancellation.reason&&(a+='<span class="thunder--refund-cancellation-reason" data-balloon-length="large" data-balloon-pos="up-left" data-balloon="“'+t.stripHTML(A.cancellation.reason)+'”">'+t.m("refundCancellationReason")+'<span class="thunder--question-mark"></span></span>'),a+="</div>"),a+='</td><td><span class="thunder--refund-total-label hidden">'+t.m("refundTotal")+'</span><span class="thunder--refund-total" data-balloon-length="large" data-balloon-pos="up-left" data-balloon="'+t.refundTotalDetail(A.total)+'">'+A.total.price.withTax.converted+'<span class="thunder--question-mark"></span></span></td></tr>'}a+="</tbody></table>"}a+="</div>"}if("placed"!==t.order.status&&"cancelled"!==t.order.status&&t.order.hasTangibleItem){if(a+='<div class="thunder--order-fulfillments"><h3>'+t.m("orderFulfillments")+'</h3><ul class="thunder--fulfillment-actions"><li>',t.order.receivedAt&&(a+='<button class="thunder--button-tiny thunder--mark-order-as-not-received">'+t.m("markAsNotReceived")+"</button>"),t.order.receivedAt||(a+='<button class="thunder--button-tiny thunder--mark-order-as-received">'+t.m("markAsReceived")+"</button>"),a+="</li></ul>",t.order.fulfillments.length||(a+='<p class="thunder--no-fulfillments">'+t.m("noFulfillments")+"</p>"),t.order.fulfillments.length){a+='<table class="thunder--table thunder--order-fulfillment-list"><thead><tr><th>'+t.m("fulfillmentStatus")+"</th><th>"+t.m("fulfillmentItems")+"</th></tr></thead><tbody>";var F=t.order.fulfillments;if(F)for(var M,E=-1,N=F.length-1;E<N;){M=F[E+=1],a+='<tr class="thunder--order-fulfillment" data-fulfillment="'+M._id+'"><td><span class="thunder--tag thunder--fulfillment-status" data-status="'+M.status+'">'+t.m(t.camelCase(["fulfillmentStatus",M.status]))+'</span></td><td><ul class="thunder--fulfillment-items">';var P=M.items;if(P)for(var c,K=-1,O=P.length-1;K<O;)c=P[K+=1],a+='<li><span class="thunder--fulfillment-item-name">'+c.item.product.name+'</span><span class="thunder--fulfillment-item-quantity">'+c.quantity.converted+"</span></li>";a+='</ul><div class="thunder--fulfillment-tracker">'+t.fulfillmentTracker(M)+"</div></td></tr>"}a+="</tbody></table>"}a+="</div>"}return a+="</div></div>"};
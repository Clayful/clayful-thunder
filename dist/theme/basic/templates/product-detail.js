window.Thunder.components["product-detail"].template=function(t){var e='<div class="thunder--product-detail"><div class="thunder--product-detail-torso"><div class="thunder--product-catalogs"><div class="thunder--product-catalog-current">',a=t.product.catalogs;if(a)for(var i,d=-1,r=a.length-1;d<r;)i=a[d+=1],e+='<div class="thunder--product-catalog-detail" data-mh data-catalog-image="'+t.get(i,"image._id","")+'"><img src="'+t.imageURL(i.image,480,480)+'">',i.title&&(e+="<p>"+i.title+"</p>"),e+="</div>";e+='</div><div class="thunder--product-catalog-thumbnails">';var n=t.product.catalogs;if(n)for(var i,d=-1,o=n.length-1;d<o;)i=n[d+=1],e+='<img class="'+(4===d?"last-catalog":"")+'"src="'+t.imageURL(i.image,120,120)+'"data-catalog-image="'+t.get(i,"image._id","")+'">';if(e+='</div></div><div class="thunder--product-info"><h2 class="thunder--product-name">'+t.product.name+'</h2><p class="thunder--product-summary">'+t.product.summary+'</p><div class="thunder--product-price"><span class="thunder--product-sale-price">'+t.product.price.sale.converted+"</span>",t.product.price.sale.converted!==t.product.price.original.converted&&(e+='<span class="thunder--product-compare-price">&nbsp;'+t.product.price.original.converted+"&nbsp;</span>","percentage"===t.product.discount.type&&(e+='<span class="thunder--product-discount-percentage">(-'+t.product.discount.value.converted+")</span>")),e+='</div><div class="thunder--product-option">',"separated"===t.options.optionSelector){e+='<div class="thunder--product-variant-filter '+(t.showOptionSelector()?"":"hidden")+'">';var l=t.product.options;if(l)for(var s,c=-1,u=l.length-1;c<u;){s=l[c+=1],e+='<div class="thunder--product-option-wrap"><label>'+t.m("selectOption",{option:s.name})+'</label><select name="'+s._id+'" required><option value="" disabled selected>'+t.m("selectOption",{option:s.name})+"</option>";var p=s.variations;if(p)for(var v,h=-1,m=p.length-1;h<m;)v=p[h+=1],e+='<option value="'+v._id+'">'+v.value+"</option>";e+="</select></div>"}e+="</div>"}if(t.product.variants.length>0){e+='<div class="thunder--product-variant '+(1===t.product.variants.length?"hidden":"")+'"><label>'+(t.showOptionSelector()?t.m("selectedVariant"):t.m("selectVariant"))+'</label><select name="variant" required><option value="" disabled selected>'+t.m("selectVariant")+"</option>";var b=t.product.variants;if(b)for(var g,f=-1,y=b.length-1;f<y;)g=b[f+=1],e+='<option value="'+g._id+'" '+(t.isUnavailableVariant(t.product,g)?"disabled":"")+">"+t.variantName(g)+"&nbsp;/&nbsp;"+g.price.sale.converted+(t.isUnavailableVariant(t.product,g)?" ("+t.m(t.isUnavailableVariant(t.product,g))+")":"")+"</option>";e+="</select></div>"}if(e+='<div class="thunder--item-quantity"><label class="thunder--label">'+t.m("quantity")+'</label><div><input type="number" name="quantity" value="1" min="1" class="thunder--quantity" /></div></div></div>',t.product.bundles.length>0){e+='<div class="thunder--product-bundles"><div><label class="thunder--label-select-bundle-item">'+t.m("selectBundleItems")+'</label><label class="thunder--label-bundle-item-quantity">'+t.m("quantity")+"</label></div>";var q=t.product.bundles;if(q)for(var U,w=-1,V=q.length-1;w<V;){U=q[w+=1],e+='<div class="thunder--product-bundle-item"><div class="thunder--product-variant"><select><option value="" selected>'+U.name,U.required&&(e+=" ("+t.m("requiredBundle")+")"),e+="</option>";var S=U.items;if(S)for(var _,O=-1,P=S.length-1;O<P;)_=S[O+=1],e+='<option value="'+_.product._id+"."+_.variant._id+'" '+(t.isUnavailableVariant(_.product,_.variant)?"disabled":"")+">"+t.productName(_.product,_.variant)+"&nbsp;/&nbsp;"+_.variant.price.sale.converted+(t.isUnavailableVariant(_.product,_.variant)?" ("+t.m(t.isUnavailableVariant(_.product,_.variant))+")":"")+"</option>";e+='</select></div><div class="thunder--item-quantity"><input type="number" value="0" min="0" class="thunder--bundle-item-quantity thunder--quantity" /></div></div>'}e+="</div>"}if("tangible"===t.product.type){e+='<div class="thunder--shipping-method"><label>'+t.m("selectShippingMethod")+'</label><select name="shippingMethod" required>';var x=t.product.shipping.methods;if(x)for(var A,d=-1,R=x.length-1;d<R;)A=x[d+=1],e+='<option value="'+A._id+'">'+A.name+"</option>";e+="</select></div>"}if(e+='<div class="thunder--price-total-wrap"><span class="thunder--price-total-label">'+t.m("priceTotal")+': </span><span class="thunder--price-total-value"></span></div><div class="thunder--product-detail-buttons '+(1===t.options.productActions.length?"single-action":"")+'">',!t.isUnavailableProduct(t.product)&&!t.isSoldOutProduct(t.product)){var T=t.options.productActions;if(T)for(var k,d=-1,B=T.length-1;d<B;)k=T[d+=1],e+='<button class="thunder--button thunder--'+k+" "+(0===d&&2===t.options.productActions.length?"skeleton":"")+'">'+t.m(t.camelCase(k))+"</button>"}return e+="\x3c!-- unavailable product --\x3e",t.isUnavailableProduct(t.product)&&(e+='<button class="thunder--button" disabled>'+t.m("unavailableProduct")+"</button>"),e+="\x3c!-- sold-out product --\x3e",t.isSoldOutProduct(t.product)&&!t.isUnavailableProduct(t.product)&&(e+='<button class="thunder--button" disabled>'+t.m("soldOutProduct")+"</button>"),e+='<div class="thunder--product-detail-button-helpers"><a href="#" class="thunder--go-to-cart">'+t.m("goToCart")+"</a></div></div>","simple"===t.options.descriptionStyle&&(e+='<div class="thunder--product-simple-description">'+t.product.description+"</div>"),e+='</div></div><div class="thunder--following-nav-container"></div>',"detailed"===t.options.descriptionStyle&&(e+='<div class="thunder--product-detail-trunk"><div class="thunder--product-detailed-description">'+t.product.description+"</div></div>"),t.options.useReviews&&(e+='<div class="thunder--product-reviews-wrapper"></div>'),e+="</div>"};
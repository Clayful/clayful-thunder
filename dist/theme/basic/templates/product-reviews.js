window.Thunder.components["product-reviews"].template=function(t){var e='<div class="thunder--product-reviews"><div class="thunder--product-reviews-header"><h2>'+t.m("productReviews")+"</h2>";return t.count.raw>0&&(e+='<p class="thunder--product-has-n-reviews">'+t.m("totalNReviews",{count:t.count.converted,smart_count:t.count.raw})+"</p>"),t.options.useRating&&null!==t.options.productRating&&t.options.productRating.average.raw>0&&(e+='<p class="thunder--product-rating">'+t.ui["review-stars"](t.options.productRating.average.raw)+'<span class="thunder--product-rating-value">('+t.m("productRating",{rating:t.options.productRating.average.converted,smart_count:t.options.productRating.average.raw})+")</span></p>"),e+="</div>",0===t.count.raw&&(e+='<p class="thunder--product-has-no-review">'+t.m("noProductReviews")+"</p>"),e+='<div class="thunder--review-writer-actions"><button class="thunder--write-review thunder--button-small skeleton">'+t.m("writeReview")+'</button></div><div class="thunder--review-writer-container"></div><div class="thunder--product-review-list"></div>',t.options.usePagination&&(e+='<div class="thunder--product-review-list-pagination"></div>'),e+="</div>"};
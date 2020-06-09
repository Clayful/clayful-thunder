window.Thunder.components["product-review-comments"].template=function(e){var t='<div class="thunder--product-review-comments" data-review="'+e.options.review+'">';0===e.count.raw&&(t+='<p class="thunder--review-has-no-comments">'+e.m("noReviewComments")+"</p>"),t+='<div class="thunder--comment-writer-actions"><button class="thunder--write-comment thunder--button-tiny skeleton">'+e.m("writeComment")+'</button></div><form class="thunder--comment-writer-container thunder--form"><div class="thunder--comment-body"><textarea placeholder="'+e.m("commentBody")+'"></textarea></div><div class="thunder--form-actions"><button class="thunder--post-comment thunder--button-small">'+e.m("postComment")+'</button><button class="thunder--cancel-comment thunder--button-small skeleton">'+e.m("cancelComment")+'</button></div></form><div class="thunder--review-comment-list">';var n=e.comments;if(n)for(var o,r=-1,m=n.length-1;r<m;)o=n[r+=1],t+='<div class="thunder--review-comment" data-review-comment="'+o._id+'"><div class="thunder--review-comment-header"><div class="thunder--review-comment-author"><span class="thunder--author-identity">',void 0!==o.customer&&(t+=""+(e.customerIdentity(o.customer)||e.m("deletedCustomer"))),void 0!==o.collaborator&&(t+=""+(o.collaborator?o.collaborator.alias:e.m("deletedCollaborator"))),t+='</span><span class="thunder--review-comment-created-at">'+e.m("commentWrittenAt",{time:o.createdAt.formatted})+'</span></div></div><div class="thunder--review-comment-body">\x3c!-- Body --\x3e',o.body===o.excerpt&&(t+=""+o.body),t+="\x3c!-- Excerpt --\x3e",o.body!==o.excerpt&&(t+=o.excerpt+'<div class="thunder--read-more-wrapper"><span class="thunder--read-more">'+e.m("readMore")+"</span></div>"),t+='</div><div class="thunder--review-comment-actions">',o.editable&&(t+='<span class="thunder--edit-review-comment">'+e.m("editComment")+'</span><span class="thunder--delete-review-comment">'+e.m("deleteComment")+"</span>"),e.options.useFlag&&(t+='<span class="thunder--flag">'+e.m("flagComment")+"</span>"),t+="</div></div>";return t+="</div>",e.options.usePagination&&(t+='<div class="thunder--review-comment-list-pagination"></div>'),t+="</div>"};
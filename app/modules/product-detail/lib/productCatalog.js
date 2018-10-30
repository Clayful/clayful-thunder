module.exports = ($container) => {

	const catalogMap = {};

	const $details = $container.find('.thunder--product-catalog-detail');
	const $thumbnails = $container.find('.thunder--product-catalog-thumbnails img');

	$details.each(function() {
		catalogMap[getImageId($(this))] = $(this);
	});

	setCurrentImage(getImageId($details.eq(0)));

	// Click events for mobile devices..
	$thumbnails.on('click', function() {
		setCurrentImage(getImageId($(this)));
	});

	// Hover events for laptops
	$thumbnails.hover(
		function() { catalogMap[getImageId($(this))].addClass('active') },
		function() { catalogMap[getImageId($(this))].removeClass('active') }
	);

	function setCurrentImage(imageId) {
		setAnchor($details, imageId);
		setAnchor($thumbnails, imageId);
	}

	function setAnchor(images, imageId) {

		images
			.removeClass('anchored')
			.filter(function() {
				return $(this).data().catalogImage === imageId;
			})
			.addClass('anchored');
	}

	function getImageId(selector) {

		return selector.data('catalogImage') || null;
	}

};
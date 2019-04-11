module.exports = function(body) {

	return `
		<div class="thunder--text-box-overlay">
			<div class="thunder--text-box-overlay-header">
				<span class="thunder--text-box-overlay-close">×</span>
			</div>
			<div class="thunder--text-box-overlay-body">
				${body}
			</div>
		</div>
	`.trim();

};
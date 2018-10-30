/**
 * Based on Daum's postcode search API.
 * - Daum's Postcode JS SDK should be imported before this plugin.
 * - Guide: http://postcode.map.daum.net/guide
 */

const implementation = () => {

	return callback => new daum.Postcode({
		oncomplete: data => callback(null, {
			postcode: data.zonecode || data.postcode,
			country:  'KR', // Since Daum API only supports for Korean addresses, default value is always 'KR'
			state:    data.sido,
			city:     data.sigungu.split(' ')[0],
			address1: data.address,
			address2: '',
		})
	}).open();

};

module.exports = window.ThunderSearchAddressDaum = implementation;
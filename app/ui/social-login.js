module.exports = function(options = {}) {

	let {
		type = 'login', // 'login' or 'register'
		vendors = [
			'facebook',
			'google',
			'instagram',
			'naver',
			'kakao',
		],
		logos = {
			facebook:  `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21"><path d="M19.4.5H1.6C1 .5.5 1 .5 1.6v17.8c0 .6.5 1.1 1.1 1.1h9.6v-7.7H8.6v-3h2.6V7.5c0-2.6 1.6-4 3.9-4 .8 0 1.6 0 2.3.1v2.7h-1.6c-1.3 0-1.5.6-1.5 1.5v1.9h3l-.4 3h-2.6v7.7h5.1c.6 0 1.1-.5 1.1-1.1V1.6c0-.6-.5-1.1-1.1-1.1z" fill="#fff"/></svg>`,
			google:    `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21"><path d="M20.1 10.7c0-.7-.1-1.4-.2-2h-9.4v3.9h5.4c-.2 1.3-.9 2.3-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.4z" fill="#4285f4"/><path d="M10.5 20.5c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H1.6V15c1.6 3.3 5 5.5 8.9 5.5z" fill="#34a853"/><path d="M4.9 12.4c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V6H1.6C.9 7.4.5 8.9.5 10.5s.4 3.1 1.1 4.5l3.3-2.6z" fill="#fbbc05"/><path d="M10.5 4.5c1.5 0 2.8.5 3.8 1.5l2.9-2.9c-1.7-1.6-4-2.6-6.7-2.6C6.6.5 3.2 2.7 1.6 6l3.3 2.6c.8-2.4 3-4.1 5.6-4.1z" fill="#ea4335"/><path d="M.5.5h20v20H.5V.5z" fill="none"/></svg>`,
			instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21"><style>.st0{fill:#fff}</style><path class="st0" d="M10.5 1.9c2.8 0 3.1 0 4.2.1 1 0 1.6.2 1.9.4.5.2.8.4 1.2.8.4.4.6.7.8 1.2.2.3.4.8.4 1.9.1 1.1.1 1.4.1 4.2s0 3.1-.1 4.2c0 1-.2 1.6-.4 1.9-.2.5-.4.8-.8 1.2-.4.4-.7.6-1.2.8-.4.1-.9.3-1.9.4-1.1.1-1.4.1-4.2.1s-3.1 0-4.2-.1c-1 0-1.6-.2-1.9-.4-.5-.2-.8-.4-1.2-.8-.4-.4-.6-.7-.8-1.2-.2-.3-.4-.8-.4-1.9-.1-1.1-.1-1.4-.1-4.2s0-3.1.1-4.2c0-1 .2-1.6.4-1.9.2-.5.4-.8.8-1.2.4-.4.7-.6 1.2-.8.3-.2.8-.4 1.9-.4 1.1-.1 1.4-.1 4.2-.1m0-1.9C7.6 0 7.3 0 6.2.1 5.1.1 4.3.3 3.6.6c-.7.2-1.3.6-1.8 1.2-.6.5-1 1.1-1.2 1.8-.3.7-.5 1.5-.5 2.6C0 7.3 0 7.6 0 10.5s0 3.2.1 4.3c.1 1.1.2 1.9.5 2.5.3.7.6 1.3 1.2 1.9.6.6 1.2.9 1.9 1.2.7.3 1.4.4 2.5.5 1.1.1 1.4.1 4.3.1s3.2 0 4.3-.1c1.1-.1 1.9-.2 2.5-.5.7-.3 1.3-.6 1.9-1.2.6-.6.9-1.2 1.2-1.9.3-.7.4-1.4.5-2.5.1-1.1.1-1.5.1-4.3s0-3.2-.1-4.3c-.1-1.1-.2-1.9-.5-2.5-.3-.7-.6-1.3-1.2-1.9-.6-.6-1.2-.9-1.9-1.2-.7-.3-1.4-.4-2.5-.5-1.1-.1-1.4-.1-4.3-.1z"/><path class="st0" d="M10.5 5.1c-3 0-5.4 2.4-5.4 5.4s2.4 5.4 5.4 5.4 5.4-2.4 5.4-5.4-2.4-5.4-5.4-5.4zm0 8.9C8.6 14 7 12.4 7 10.5S8.6 7 10.5 7 14 8.6 14 10.5 12.4 14 10.5 14z"/><circle class="st0" cx="16.1" cy="4.9" r="1.3"/></svg>`,
			naver:     `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21"><path fill="#fff" d="M13.5 1.8v8.8l-6-8.8H.9v17.5h6.6v-8.9l6 8.9h6.6V1.8z"/></svg>`,
			kakao:     `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21"><path d="M10.5 1.7C5 1.7.5 5.2.5 9.6c0 2.8 1.9 5.3 4.7 6.7-.2.8-.8 2.8-.9 3.3-.1.5.2.5.4.4.2-.1 2.7-1.9 3.8-2.6.6.1 1.2.1 1.9.1 5.5 0 10-3.5 10-7.9S16 1.7 10.5 1.7z" fill="#3c1e1e"/></svg>`,
		},
	} = options;

	vendors = typeof vendors === 'string' ?
				vendors.split(',').filter(v => v) :
				vendors;

	if (vendors.length === 0) {
		return '';
	}

	return `
		<ul class="thunder--social-app-actions thunder--social-app-${type}">
			${ vendors.map(vendor => `
			<li class="thunder-social-app-${vendor}">
				<button data-social-app="${vendor}">
					<span class="thunder--social-app-logo">${logos[vendor]}</span>
					<span class="thunder--social-app-button-message">${this.polyglot.t(`social-login.${type}By${vendor[0].toUpperCase() + vendor.slice(1)}`)}</span>
				</button>
			</li>
			`).join('') }
		</ul>
	`.trim();

};
module.exports = (from, type, value) => {

	const timeMap = {
		days:  86400000,  // 하루를 밀리초로 환산
		weeks: 604800000, // 한 주를 밀리초로 환산
	};

	const toDate = date => date ? new Date(date) : new Date();

	const original = toDate(from);
	const originalTime = original.valueOf();
	const originalYear = original.getFullYear();
	const originalMonth = original.getMonth();
	const originalDate = original.getDate();

	// `days`, `weeks` 케이스 (단순히 오프셋을 계산해 더함)
	if (timeMap[type]) {

		const offset = timeMap[type] * Number(value);

		return toDate(originalTime + offset);
	}

	// 월 케이스
	if (type === 'months') {

		const yearOffset = Math.floor((originalMonth + Number(value)) / 12);
		const newMonth = (originalMonth + Number(value)) % 12;

		original.setFullYear(originalYear + yearOffset);
		original.setMonth(newMonth);

		if (newMonth !== original.getMonth()) {
			original.setDate(0);
		}

		return original;

	}

	// 년 케이스
	if (type === 'years') {

		const expiresYear = original.getFullYear() + Number(value);

		original.setFullYear(expiresYear);

		// 기존 날짜가 2월 29일이면서,
		// 더해진 날짜로 갔을 때 3월이 된 경우 (2월 29일이 없는 경우)
		if (originalMonth === 1 &&
			originalDate === 29 &&
			original.getMonth() === 2) {
			original.setDate(0);
		}

		return original;

	}

	throw new Error('Unsupported time type');

};
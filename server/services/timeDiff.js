
/**
 * @desc This module gives time difference in two 24 hour format times
 * @author punit
 * @since August 6, 2019
 */
export default ({ timeOne, timeTwo }) => {
	const timeOneMinutes = (timeOne.hour * 60) + timeOne.minute;
	let hourTwo = timeTwo.hour;
	if (timeOne.hour > timeTwo.hour) {
		hourTwo += 24;
	}
	const timeTwoMinutes = (hourTwo * 60) + timeTwo.minute;
	const diffMinutes = Math.abs(timeTwoMinutes - timeOneMinutes);
	let h = Math.floor(diffMinutes / 60);
	let m = diffMinutes % 60;
	h = h < 10 ? `0${h}` : h;
	m = m < 10 ? `0${m}` : m;
	const timeDifference = `${h}:${m}`;
	return timeDifference;
};

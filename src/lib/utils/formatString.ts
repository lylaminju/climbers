export function capitalizeWords(str: string) {
	return str
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function capitalizeFirstLetter(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelCaseToSpaceSeparatedWords(str: string) {
	return str.replace(/([A-Z])/g, ' $1').toLowerCase();
}

/**
 * converts camel case to space seperated words, and capitalizes the first letter
 */
export function formatCamelCase(str: string) {
	return capitalizeFirstLetter(camelCaseToSpaceSeparatedWords(str));
}

/**
 * Converts a time string 'HH:MM:SS' to 'h AM/PM' (e.g., '03:00:00' -> '3 AM', '15:00:00' -> '3 PM')
 */
export function formatTimeToAMPM(time: string) {
	if (!time) return '';

	const [hourStr] = time.split(':');
	let hour = parseInt(hourStr, 10);
	const ampm = hour >= 12 ? 'PM' : 'AM';
	hour = hour % 12;

	if (hour === 0) hour = 12;

	return `${hour}${ampm}`;
}

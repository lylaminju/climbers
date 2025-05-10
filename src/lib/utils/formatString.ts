export function capitalizeWords(str: string) {
	if (!str) {
		console.error(`capitalizeWords: str is undefined or null, str: ${str}`);
		return '';
	}

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
 * Converts a time string 'HH:MM:SS' or 'HH:MM' to 'h:MM AM/PM' (e.g., '16:30:00' → '4:30 PM', '03:00:00' → '3:00 AM')
 * @param time - Time string in 'HH:MM:SS' or 'HH:MM' format, or null/undefined
 * @returns Formatted time string in 'h:MM AM/PM' format, or empty string if invalid
 */
export function formatTimeToAMPM(time: string | null | undefined) {
	if (!time) return '';

	const [hourStr, minuteStr] = time.split(':');
	const hour = parseInt(hourStr, 10);
	if (isNaN(hour) || !minuteStr) return '';

	const minute = minuteStr.padStart(2, '0').slice(0, 2); // Ensure MM format
	const ampm = hour >= 12 ? 'PM' : 'AM';
	const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM/PM

	return `${displayHour}:${minute} ${ampm}`;
}

/**
 * Converts a timestamp to a date string in 'YYYY-MM-DD' format
 * @param timestamp - Timestamp in 'YYYY-MM-DD HH:MM:SS' format (e.g., '2025-05-16T04:00:00')
 * @returns Date string in 'YYYY-MM-DD' format
 */
export function timestampToDate(timestamp: string) {
	return timestamp.split('T')[0];
}

/**
 * Converts a timestamp to a time string in 'HH:MM' format, applying the current timezone offset
 * @param timestamp - Timestamp in 'YYYY-MM-DDTHH:MM:SS' format (e.g., '2025-05-16T04:00:00')
 * @returns Time string in 'HH:MM' format
 */
export function timestampToTime(timestamp: string) {
	const [hours, minutes] = timestamp.split('T')[1].split(':');

	return `${hours}:${minutes}`;
}

/**
 * Formats a time range from start and end timestamps
 * @param startDatetime - Start timestamp in 'YYYY-MM-DD HH:MM:SS' format (e.g., '2025-05-16T04:00:00')
 * @param endDatetime - End timestamp in 'YYYY-MM-DD HH:MM:SS' format (e.g., '2025-05-16T05:00:00')
 * @returns Formatted time range string in 'YYYY-MM-DD h:MM AM/PM - h:MM AM/PM' format
 */
export function timeRange(startDatetime: string, endDatetime: string) {
	const date = timestampToDate(startDatetime);
	const startTime = formatTimeToAMPM(timestampToTime(startDatetime));
	const endTime = formatTimeToAMPM(timestampToTime(endDatetime));

	return `${date}  ${startTime} - ${endTime}`;
}

/**
 * Formats a date to 'MMM DD' format (e.g., 'Apr 15')
 * @param dateString - Date in 'YYYY-MM-DD' format
 * @returns Formatted date string in 'MMM DD' format, or undefined if invalid
 */
export function formatShortDate(dateString: string) {
	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) throw new Error('Invalid date');

		const month = date.toLocaleString('en-US', { month: 'short' });
		const day = date.getDate().toString().padStart(2, '0');

		return `${month} ${day}`;
	} catch (error) {
		console.error('Error formatting date:', error);
		return undefined;
	}
}

export function getTimezoneOffsetString() {
	const offsetMinutes = new Date().getTimezoneOffset();
	const sign = offsetMinutes > 0 ? '-' : '+';
	const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(
		2,
		'0',
	);
	const minutes = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');

	return `${sign}${hours}:${minutes}`;
}

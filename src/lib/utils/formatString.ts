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

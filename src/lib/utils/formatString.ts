export function capitalizeWords(str: string) {
	return str
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function capitalizeFirstLetter(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function camelCaseToSpaceSeparatedWords(str: string) {
	return str.replace(/([A-Z])/g, ' $1').toLowerCase();
}

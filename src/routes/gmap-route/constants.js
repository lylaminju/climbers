/**
 * Max number of destination allowed to be added to commutes panel.
 */
export const MAX_NUM_DESTINATIONS = 10;

/**
 * Bounds to bias search within ~50km distance.
 */
export const BIAS_BOUND_DISTANCE = 0.5;

/**
 * Hour in seconds.
 */
export const HOUR_IN_SECONDS = 3600;

/**
 * Minutes in seconds.
 */
export const MIN_IN_SECONDS = 60;

/**
 * Stroke colors for destination direction polylines for different states.
 */
export const STROKE_COLORS = {
	active: {
		innerStroke: '#4285F4',
		outerStroke: '#185ABC',
	},
	inactive: {
		innerStroke: '#BDC1C6',
		outerStroke: '#80868B',
	},
};

/**
 * Marker icon colors for different states.
 */
export const MARKER_ICON_COLORS = {
	active: {
		fill: '#EA4335',
		stroke: '#C5221F',
		label: '#FFF',
	},
	inactive: {
		fill: '#F1F3F4',
		stroke: '#9AA0A6',
		label: '#3C4043',
	},
};

/**
 * List of operations to perform on destinations.
 */
export const DestinationOperation = {
	ADD: 'ADD',
	EDIT: 'EDIT',
	DELETE: 'DELETE',
};

/**
 * List of available commutes travel mode.
 */
export const TravelMode = {
	DRIVING: 'DRIVING',
	TRANSIT: 'TRANSIT',
	BICYCLING: 'BICYCLING',
	WALKING: 'WALKING',
};

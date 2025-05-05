export function getStatusColor(status: string) {
	switch (status) {
		case 'accepted':
			return 'green';
		case 'pending':
			return 'yellow';
		case 'declined':
			return 'red';
	}
}

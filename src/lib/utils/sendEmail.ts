/**
 * Sends an email to the recipient with the given subject and HTML content.
 * @param recipientEmail - The email address of the recipient.
 * @param subject - The subject of the email.
 * @param html - The HTML content of the email.
 * @returns A Promise that resolves to the response from the server.
 */
export async function sendEmail(
	recipientEmail: string,
	subject: string,
	html: string,
) {
	try {
		const requestBody = JSON.stringify({
			email: recipientEmail,
			subject,
			html,
		});

		const response = await fetch('/email', {
			method: 'POST',
			body: requestBody,
		});

		return await response.json();
	} catch (error) {
		throw new Error('Failed to prepare email');
	}
}

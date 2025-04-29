export async function POST({ request }: { request: Request }) {
	try {
		const emailSendUrl = `${import.meta.env.VITE_BASE_URL}/functions/v1/resend`;
		const body = await request.json();
		const response = await fetch(emailSendUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
			},
			body: JSON.stringify(body),
		});
		const data = await response.json();

		return new Response(JSON.stringify(data), {
			status: 200,
		});
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: 'Failed to send an email' }), {
			status: 500,
		});
	}
}

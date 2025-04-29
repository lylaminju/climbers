// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

// Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const RESEND_API_KEY = Deno.env.get('VITE_RESEND_API_KEY');
const DOMAIN = Deno.env.get('VITE_DOMAIN');

const handler = async (request: Request): Promise<Response> => {
	try {
		const { email, subject, html } = await request.json();

		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${RESEND_API_KEY}`,
			},
			body: JSON.stringify({
				from: `no-reply-climberz-day@${DOMAIN}`,
				to: email,
				subject,
				html,
			}),
		});

		const data = await response.json();

		return new Response(JSON.stringify(data), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: 'Failed to send email' }), {
			status: 500,
		});
	}
};

Deno.serve(handler);

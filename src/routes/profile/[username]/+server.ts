import { supabaseAdmin } from '$lib/supabaseClient';

export async function DELETE({ request }) {
	try {
		const body = await request.json();
		const { userId } = body;

		const { error } = await supabaseAdmin.auth.admin.deleteUser(userId, true);
		if (error) {
			throw error;
		}

		return new Response(null, { status: 204 });
	} catch (error) {
		console.error(`Failed to delete profile\n${error}`);
		return new Response(null, { status: 500 });
	}
}

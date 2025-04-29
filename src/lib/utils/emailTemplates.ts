import { LOGO_URL } from '../constants';

export function requestToJoinTemplate(senderName: string, message: string, postId: string) {
	const baseUrl = import.meta.env.VITE_BASE_URL;

	return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center">
                    <img src="${LOGO_URL}" alt="ClimberzDay Logo" width="270" draggable="false" style="display:block;" />
                    <h1 style="font-size:24px;">You have a new join request!</h1>
                    <p style="font-size:18px;">A climber <b>${senderName}</b> sent a request to join your climbing</p>
                    <p style="font-size:18px;">Message: ${message}</p>
                    <a href="${baseUrl}/find-partners/${postId}" style="font-size:18px;">View Post</a>
                </td>
            </tr>
        </table>
    `;
}

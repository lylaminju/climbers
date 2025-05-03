import { LOGO_URL } from '../constants';

const LogoImageElement = `<img src="${LOGO_URL}" alt="ClimberzDay Logo" width="250" draggable="false" style="display:block;" />`;
const baseUrl = import.meta.env.VITE_BASE_URL;

export function requestToJoinTemplate(
	senderName: string,
	message: string,
	postId: string,
) {
	return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center">
                    ${LogoImageElement}
                    <h1 style="font-size:24px;">You have a new join request!</h1>
                    <p style="font-size:18px;">A climber <b>${senderName}</b> sent a request to join your climbing</p>
                    <p style="font-size:18px;">Message: "${message}"</p>
                    <a href="${baseUrl}/notifications" style="font-size:18px;">Notifications page</a><br/>
                </td>
            </tr>
        </table>
    `;
}

export function requestHandledTemplate(
	type: 'accepted' | 'declined',
	senderName: string,
	gymNameWithCity: string,
	postId: string,
) {
	const defaultMessage =
		type === 'accepted'
			? 'Hope you enjoy climbing!'
			: 'Hope you can join us next time';

	return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center">
                    ${LogoImageElement}
                    <h1 style="font-size:24px;">Your join request is ${type}</h1>
                    <p style="font-size:18px;">📍 ${gymNameWithCity}</p>
                    <p style="font-size:18px;"><b>${senderName}</b> ${type} your request</p>
                    <p style="font-size:18px;">${defaultMessage}</p>
                    <a href="${baseUrl}/find-partners/${postId}" style="font-size:18px;">View Post</a>
                </td>
            </tr>
        </table>
    `;
}

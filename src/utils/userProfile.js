import { getConfig } from "../config";


const config = getConfig();
const getUserApiPath = (user) => `https://${config.domain}/api/v2/users/${user.sub}`;

export const getUserMetadata = (user, token) => {
	return fetch(getUserApiPath(user), {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			}
		});
};

export const updateUserMetadata = (user, userMetadata, token) => {
	return fetch(getUserApiPath(user), {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			method: 'PATCH',
			body: JSON.stringify({user_metadata: userMetadata})
		});
};

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	// Temporarily return null session until auth is configured
	const session = null;
	
	return {
		session
	};
};
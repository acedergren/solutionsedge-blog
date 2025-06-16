import { dev } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
    // Redirect to home in production
    if (!dev) {
        throw redirect(302, '/');
    }
    
    return {};
};

// Exclude from prerendering in production
export const prerender = false;
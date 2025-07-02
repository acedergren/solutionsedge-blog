import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

const errorHandler: Handle = async ({ event, resolve }) => {
	try {
		const response = await resolve(event);
		return response;
	} catch (error) {
		console.error('Server error:', error);
		
		return new Response(JSON.stringify({
			message: 'Internal server error',
			code: 'INTERNAL_ERROR'
		}), {
			status: 500,
			headers: {
				'content-type': 'application/json'
			}
		});
	}
};

const logger: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	
	console.log(`[${new Date().toISOString()}] ${event.request.method} ${event.url.pathname}`);
	
	const response = await resolve(event);
	
	const duration = Date.now() - start;
	console.log(`[${new Date().toISOString()}] ${event.request.method} ${event.url.pathname} - ${response.status} - ${duration}ms`);
	
	return response;
};

// Temporarily disable authHandle until properly configured
export const handle = sequence(logger, errorHandler);
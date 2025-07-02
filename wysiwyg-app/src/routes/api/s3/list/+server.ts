import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getS3Config, createS3Client } from '$lib/services/s3/config';
import { S3Service, parseS3Error } from '$lib/services/s3';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const config = getS3Config();
		if (!config || !config.accessKeyId || !config.secretAccessKey) {
			return json({ 
				success: false, 
				error: 'S3 configuration missing' 
			}, { status: 500 });
		}
		
		const prefix = url.searchParams.get('prefix') || 'posts/';
		const maxKeys = parseInt(url.searchParams.get('maxKeys') || '100');
		
		const s3Client = createS3Client(config);
		const s3Service = new S3Service(s3Client, config);
		
		const files = await s3Service.listFiles(prefix, maxKeys);
		
		return json({
			success: true,
			files
		});
	} catch (error) {
		const s3Error = parseS3Error(error);
		return json({ 
			success: false, 
			error: s3Error.message,
			errorType: s3Error.type
		}, { status: 500 });
	}
};
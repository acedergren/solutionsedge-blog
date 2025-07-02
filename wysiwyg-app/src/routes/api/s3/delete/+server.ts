import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getS3Config, createS3Client } from '$lib/services/s3/config';
import { S3Service, parseS3Error } from '$lib/services/s3';

export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const config = getS3Config();
		if (!config || !config.accessKeyId || !config.secretAccessKey) {
			return json({ 
				success: false, 
				error: 'S3 configuration missing' 
			}, { status: 500 });
		}
		
		const { key } = await request.json();
		
		if (!key) {
			return json({ 
				success: false, 
				error: 'File key is required' 
			}, { status: 400 });
		}
		
		const s3Client = createS3Client(config);
		const s3Service = new S3Service(s3Client, config);
		
		const success = await s3Service.deleteFile(key);
		
		return json({
			success,
			message: success ? 'File deleted successfully' : 'Failed to delete file'
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
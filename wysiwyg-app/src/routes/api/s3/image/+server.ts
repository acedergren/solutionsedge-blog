import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getS3Config, createS3Client } from '$lib/services/s3/config';
import { S3Service, parseS3Error } from '$lib/services/s3';
import sharp from 'sharp';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const config = getS3Config();
		if (!config || !config.accessKeyId || !config.secretAccessKey) {
			return json({ 
				success: false, 
				error: 'S3 configuration missing' 
			}, { status: 500 });
		}
		
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const maxWidth = parseInt(formData.get('maxWidth') as string || '1920');
		const maxHeight = parseInt(formData.get('maxHeight') as string || '1080');
		const quality = parseInt(formData.get('quality') as string || '85');
		
		if (!file || !(file instanceof File)) {
			return json({ 
				success: false, 
				error: 'No file provided' 
			}, { status: 400 });
		}
		
		// Process image with Sharp
		const buffer = Buffer.from(await file.arrayBuffer());
		
		let processedBuffer: Buffer;
		const metadata = await sharp(buffer).metadata();
		
		if (metadata.width && metadata.height && 
			(metadata.width > maxWidth || metadata.height > maxHeight)) {
			// Resize image
			processedBuffer = await sharp(buffer)
				.resize(maxWidth, maxHeight, {
					fit: 'inside',
					withoutEnlargement: true
				})
				.jpeg({ quality })
				.toBuffer();
		} else {
			// Just optimize
			processedBuffer = await sharp(buffer)
				.jpeg({ quality })
				.toBuffer();
		}
		
		// Create a new File object from the processed buffer
		const processedFile = new File([processedBuffer], file.name, {
			type: 'image/jpeg'
		});
		
		const s3Client = createS3Client(config);
		const s3Service = new S3Service(s3Client, config);
		
		// Set up progress tracking
		const progressCallback = (progress: any) => {
			// In a real app, you'd send this via WebSocket or SSE
			console.log('Upload progress:', progress);
		};
		
		s3Service.setProgressCallback(progressCallback);
		
		const result = await s3Service.uploadImage(processedFile, {
			maxWidth,
			maxHeight,
			quality
		});
		
		return json(result);
	} catch (error) {
		const s3Error = parseS3Error(error);
		return json({ 
			success: false, 
			error: s3Error.message,
			errorType: s3Error.type
		}, { status: 500 });
	}
};
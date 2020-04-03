import { S3Services } from 'appknit-backend-bundle';
import sharp from 'sharp';
import { S3_IMAGES } from '../../constants';
/**
 * the consumer function to handle the image upload process.
 * The process is handled as a consumer because there are multiple
 * resolution images to be handled so that avoiding the API
 * waiting time while the 304 resolution images are being uploaded
 * @author punit
 * @since 7 august, 2019
 *
 * @param {Object} channel is the channel created using AMQP connection
 * application
 * The content payliad that contains the following values:
 * - name: String representing the name of the picture
 * - image: bytes[] representing the original image.
 */
const small = 500;
const medium = 1000;
const format = 'jpeg';
export default async (name, image) => {
	console.log('starting upload');
	const buffer = Buffer.from(image.data);

	const dataSmall = await sharp(buffer)
		.resize(small, undefined, { fit: 'contain' })
		.toFormat(format)
		.toBuffer();

	await S3Services.uploadPublicObject({
		Bucket: S3_IMAGES.SMALL,
		Key: name,
		data: dataSmall,
	});
	const dataMedium = await sharp(buffer)
		.resize(medium, undefined, { fit: 'contain' })
		.toFormat(format)
		.toBuffer();
	await S3Services.uploadPublicObject({
		Bucket: S3_IMAGES.AVERAGE,
		Key: name,
		data: dataMedium,
	});
	await S3Services.uploadPublicObject({
		Bucket: S3_IMAGES.BEST,
		Key: name,
		data: buffer,
	});
	console.log('upload done');
};

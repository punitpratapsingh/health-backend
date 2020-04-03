/**
* This is the welnessapp-backend constant file
* @author punit
* @since 19 Aug, 2019
*/

export const {
	NODE_ENV = 'development',
	S3_BUCKET = '',
	HOST,
	// atlas configurations
	ATLAS_USER,
	ATLAS_PASSWORD,
	ADMIN_USER,
	ADMIN_PASSWORD,
	CLUSTER1,
	CLUSTER2,
	CLUSTER3,
	SHARD,
	SECRET_STRING,
	PAGINATION_LIMIT = 30,
	ATLAS_CLUSTER,
	// RabbitMQ configuration
	RABBITMQ_HOST,
	RABBITMQ_USER,
	CONTACT_US_EMAIL,
	RABBITMQ_PASSWORD,
	RABBITMQ_HEARTBEAT,
	// admin configurations
	ADMIN,
} = process.env;

const db = process.env.MONGO_DB || 'wellnessapp-development';

/**
 * @description
 * This is the sample constact specifier for queues
 * The queue names follow follow the "camelcase" naming
 * convention wehere the first letter of the queue will
 * be capital case. The queue channels are defined under server/queues/
 * directory and will be autoloded by directory indexer unless explicitly
 * ignored in skip array in index.js. The sampleQueue.js is a sample
 * channel that is meant to be updated/renamed as per the queue requirements.
 * To know more about the channel convention and design principles
 * @contact sharma02gaurav@gmail.com
 */
export const AMQP_QUEUES = {
	IMAGE_UPLOAD: 'ImageUpload',
	PICTURE_DELETE: 'DeletePicture',
	NOTIFICATION: 'Notification',
};
// export const mongoConnectionString = `mongodb://${host}:${port}/${db}`;
export const mongoConnectionString = `mongodb+srv://${ATLAS_USER}:${ATLAS_PASSWORD}@${ATLAS_CLUSTER}/${db}?retryWrites=true`;

// this string is unique for each project construction
export const secretString = SECRET_STRING;

export const SUCCESS_CODE = 100;

export const MB = 1024 * 1024;

export const GENDER = {
	MALE: 1,
	FEMALE: 2,
};

export const USER_TYPE = {
	USER: 1,
	STAFF: 2,
};

export const STAFF_ACCESS_LEVEL = {
	BLOGS: 1,
	STAFF: 2,
	GUT_WELLNESS: 3,
	CHATTING: 4,
};

export const CONSULTATION_REQ_STATUS = {
	PENDING: 1,
	ACCEPTED: 2,
	REJECTED: 3,
};

export const VERIFICATION_TYPE = {
	EMAIL_VERIFICATION: 1,
	CHANGE_PASSWORD: 2,
};

export const DEVICE_TYPES = {
	ANDROID: 'android',
	IOS: 'ios',
};

export const S3_IMAGES = {
	SMALL: `${S3_BUCKET}/${NODE_ENV}/images/small`,
	AVERAGE: `${S3_BUCKET}/${NODE_ENV}/images/average`,
	BEST: `${S3_BUCKET}/${NODE_ENV}/images/best`,
};

export const LECTIN_METER = {
	LOW: 1,
	MODERATE: 2,
	HIGH: 3,
};

export const NOTIFICATION_TYPE = {
	REQUEST: 1,
	POST: 2,
	MESSAGE: 3,
};

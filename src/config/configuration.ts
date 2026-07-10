import 'dotenv/config';

export default () => ({
  apiKey: process.env.API_KEY,
  isProd: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT, 10) || 3333,
  admin: {
    document: process.env.SET_USER_DOCUMENT,
    email: process.env.SET_USER_EMAIL,
    name: process.env.SET_USER_NAME,
    password: process.env.SET_USER_PASSWORD,
  },
  database: {
    databaseName: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASSWORD,
    schema: process.env.DATABASE_SCHEMA || 'public',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME,
  },
  jwt: {
    expiresIn: process.env.ACCESS_TOKEN_VALIDITY_DURATION_IN_DAYS,
    secret: process.env.JWT_SECRET,
  },
  social_auth: {
    secret: process.env.SOCIAL_MEDIA_SECRET_AUTH,
  },
  mail: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  aws: {
    region: process.env.AWS_S3_BUCKET_REGION,
    bucketName: process.env.AWS_S3_BUCKET_NAME,
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    folder: process.env.AWS_S3_FOLDER || 'uploads',
  },
});

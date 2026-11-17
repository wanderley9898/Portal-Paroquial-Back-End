import 'dotenv/config';

const parseBoolean = (value: string | undefined, defaultValue: boolean) => {
  if (value === undefined || value === '') return defaultValue;
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  throw new Error('S3_FORCE_PATH_STYLE and S3_USE_SSL must be true or false.');
};

const normalizeEndpoint = (
  endpoint: string | undefined,
  useSSL: boolean,
): string | undefined => {
  if (!endpoint) return undefined;
  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(endpoint)
    ? endpoint
    : `${useSSL ? 'https' : 'http'}://${endpoint}`;
  const parsed = new URL(withProtocol);

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('S3_ENDPOINT must use http or https.');
  }

  return parsed.toString().replace(/\/$/, '');
};

const normalizePublicUrl = (publicUrl: string | undefined) => {
  if (!publicUrl) return undefined;
  const parsed = new URL(publicUrl);

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('S3_PUBLIC_URL must use http or https.');
  }

  return parsed.toString().replace(/\/$/, '');
};

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
  s3: {
    endpoint: normalizeEndpoint(
      process.env.S3_ENDPOINT,
      parseBoolean(process.env.S3_USE_SSL, true),
    ),
    region: process.env.S3_REGION || 'us-east-1',
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    bucketName: process.env.S3_BUCKET || 'pousada',
    forcePathStyle: parseBoolean(process.env.S3_FORCE_PATH_STYLE, true),
    publicUrl: normalizePublicUrl(process.env.S3_PUBLIC_URL),
    useSSL: parseBoolean(process.env.S3_USE_SSL, true),
    folder: process.env.S3_FOLDER || 'uploads',
    enabled: Boolean(process.env.S3_ENDPOINT),
  },
});

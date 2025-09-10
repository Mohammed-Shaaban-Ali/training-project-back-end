

export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_expiresIn,
  },

  db: {
    type: process.env.DB_TYPE ?? 'postgres' as const,
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'postgres',
    synchronize: (process.env.TYPEORM_SYNCHRONIZE ?? 'false') === 'true',
    migrationsRun: (process.env.TYPEORM_MIGRATIONS_RUN ?? 'false') === 'true',
    logging: (process.env.TYPEORM_LOGGING ?? 'false') === 'true',
  },
  emailInfo: { 
    emailAddress: process.env.EMAIL_ADDRESS,
    emailPassword: process.env.EMAIL_PASSWORD,
    securePort: process.env.EMAIL_PORT_SECURE,
    nonSecurePort: process.env.EMAIL_PORT,
    emailHost: process.env.EMAIL_HOST,
  },

  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRY_IN || '7', // in days

})
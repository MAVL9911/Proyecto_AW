export const ENV = {
  PORT: process.env.PORT || '3001',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || '3306',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'ecommerce_db',
  JWT_SECRET: process.env.JWT_SECRET || 'secret_key',
  STRIPE_SECRET: process.env.STRIPE_SECRET || '',
};
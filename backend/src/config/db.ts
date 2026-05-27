import mysql from 'mysql2/promise';
import { ENV } from './env';

const pool = mysql.createPool({
  host: ENV.DB_HOST,
  port: parseInt(ENV.DB_PORT),
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
import mysql, {Pool} from "mysql2/promise";
import { ENV } from "./env.js";

const  connectionDB : Pool = mysql.createPool({
  host: ENV.MYSQL.DB_HOST,
  port: Number(ENV.MYSQL.DB_PORT), 
  user: ENV.MYSQL.DB_USER,
  password: ENV.MYSQL.DB_PASSWORD,
  database: ENV.MYSQL.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export default connectionDB

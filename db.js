const mysql = require('mysql2');

// Railway MySQL 연결 설정
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.DB_HOST || '127.0.0.1',
  port: process.env.MYSQL_PORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || 'mac12345',
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'blockchain_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  // Railway MySQL은 SSL 연결이 필요할 수 있음
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
}).promise();

console.log('MySQL 연결 풀이 생성되었습니다.');

// 연결 테스트
pool.getConnection()
  .then(connection => {
    console.log('✅ 데이터베이스 연결 성공!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ 데이터베이스 연결 실패:', err.message);
  });

module.exports = pool;
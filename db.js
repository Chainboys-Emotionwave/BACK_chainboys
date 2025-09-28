const mysql = require('mysql2');

// Railway MySQL 환경변수를 우선으로 설정
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.DB_HOST || '127.0.0.1',
  port: process.env.MYSQL_PORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || 'mac12345',
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'blockchain_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Railway에서는 SSL 필요할 수 있음
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
}).promise();

console.log('🔧 DB 설정:', {
  host: process.env.MYSQL_HOST || process.env.DB_HOST || '127.0.0.1',
  port: process.env.MYSQL_PORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'blockchain_db'
});

console.log('MySQL 연결 풀이 생성되었습니다.');

// 연결 테스트
pool.getConnection()
  .then(connection => {
    console.log('✅ 데이터베이스 연결 성공!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ 데이터베이스 연결 실패:', err.message);
    console.error('🔍 환경변수 확인:', {
      MYSQL_HOST: !!process.env.MYSQL_HOST,
      MYSQL_PORT: !!process.env.MYSQL_PORT,
      MYSQL_USER: !!process.env.MYSQL_USER,
      MYSQL_PASSWORD: !!process.env.MYSQL_PASSWORD,
      MYSQL_DATABASE: !!process.env.MYSQL_DATABASE
    });
  });

module.exports = pool;
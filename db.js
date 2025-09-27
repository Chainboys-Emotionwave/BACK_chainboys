const mysql = require('mysql2');

// MySQL 연결 풀(Connection Pool) 생성
// 동시에 여러 요청을 효율적으로 처리하기 위해 사용
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'mac12345',
  database: 'blockchain_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise(); // Promise API를 사용하도록 설정

console.log('MySQL 연결 풀이 생성되었습니다.');

// 외부에 pool 객체를 노출
module.exports = pool;
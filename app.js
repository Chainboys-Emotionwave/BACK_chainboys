const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); 

dotenv.config();

const app = express()
// Railway는 PORT 환경변수를 자동으로 설정
const port = process.env.PORT || 3000;

const authRoutes = require('./routes/authRoutes')
const contentRoutes = require('./routes/contentRoutes')
const userRoutes = require('./routes/userRoutes');
const challRoutes = require('./routes/challengeRoutes');
const searchRoutes = require('./routes/searchRoutes');
const supportRoutes = require('./routes/supportRoutes');

// ✨ CORS 설정 수정 - 모든 도메인 허용 (개발/테스트용)
app.use(cors({
  origin: '*', // 모든 도메인 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false // credentials를 false로 설정 (origin: '*'와 함께 사용)
}));

// Preflight 요청 처리
app.options('*', cors());

app.use(express.json());

// 기본 헬스체크 엔드포인트 추가
app.get('/', (req, res) => {
  res.json({ 
    message: 'K-POP 창작 플랫폼 API 서버가 정상 작동 중입니다!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/users', userRoutes)
app.use('/api/challenges', challRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/supports',supportRoutes);

app.listen(port, '0.0.0.0', () => {
    console.log(`서버가 http://0.0.0.0:${port} 에서 실행중입니다.`);
});
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); 

dotenv.config();

const app = express()
const port = process.env.PORT || 3000;

const authRoutes = require('./routes/authRoutes')
const contentRoutes = require('./routes/contentRoutes')
const userRoutes = require('./routes/userRoutes');
const challRoutes = require('./routes/challengeRoutes');
const searchRoutes = require('./routes/searchRoutes');
const supportRoutes = require('./routes/supportRoutes');
const pagesRoutes = require('./routes/pagesRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const badgeRoutes = require('./routes/badgeRoutes');

// ✨ CORS 설정 - Swagger UI 호환성 개선
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(cors({
  origin: true,
  credentials: false
}));

app.use(express.json());

// 기본 헬스체크 엔드포인트
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
app.use('/api/pages', pagesRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/badges', badgeRoutes);

app.listen(port, '0.0.0.0', () => {
    console.log(`서버가 http://0.0.0.0:${port} 에서 실행중입니다.`);
});
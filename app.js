const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); 

dotenv.config();

const app = express()
const port = process.env.PORT || 3000;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json()); 

const authRoutes = require('./routes/authRoutes')
const contentRoutes = require('./routes/contentRoutes')
const userRoutes = require('./routes/userRoutes');
const challRoutes = require('./routes/challengeRoutes');
const searchRoutes = require('./routes/searchRoutes');

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/users', userRoutes)
app.use('/api/challenges', challRoutes);
app.use('/api/search', searchRoutes);

app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행중입니다.`);
});
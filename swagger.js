// Swagger 문서의 기본 정보를 설정하는 파일입니다.
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  // 1. API 명세 정보
  openapi: '3.0.0',
  info: {
    title: 'kpop 2차 창작 유통 플랫폼',
    version: '1.0.0',
    description: '웹3 지갑 기반의 팬 콘텐츠 플랫폼 MVP API 목록입니다.',
  },
  servers: [
    {
      url: 'http://localhost:3000', // API 서버 주소
      description: '로컬 개발 서버',
    },
  ],
  // 2. 공통 스키마 및 보안 정의
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT 토큰을 HTTP Header의 Authorization 필드에 넣어 인증합니다.',
      },
    },
    schemas: {
      // API 응답/요청에 사용할 공통 JSON 스키마 정의 (선택 사항)
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          walletAddress: { type: 'string' },
          nickname: { type: 'string' },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  // API 주석이 포함된 파일 경로 (현재 폴더의 모든 .js 파일을 탐색)
  apis: [
    './*.js',             // 루트 폴더의 파일 (예: index.js)
    './routes/*.js',      // routes 폴더 안의 모든 파일
    './controllers/*.js'  // controllers 폴더 안의 모든 파일
  ], 
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
// const YAML = require('yamljs');
// const path = require('path');

// // YAML 파일에서 Swagger 문서 로드
// const swaggerDocument = YAML.load(path.join(__dirname, 'docs/swagger.yaml'));

// module.exports = swaggerDocument;


const YAML = require('yamljs');
const path = require('path');

const swaggerDocument = YAML.load(path.join(__dirname, 'docs/swagger.yaml'));

// Railway 배포 URL로 서버 설정 업데이트
if (process.env.NODE_ENV === 'production') {
  swaggerDocument.servers = [
    {
      url: 'https://your-actual-railway-url.up.railway.app', // 여기에 실제 Railway URL 입력
      description: 'Production server'
    }
  ];
} else {
  swaggerDocument.servers = [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ];
}

module.exports = swaggerDocument;
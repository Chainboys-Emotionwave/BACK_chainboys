const YAML = require('yamljs');
const path = require('path');

// YAML 파일에서 Swagger 문서 로드
const swaggerDocument = YAML.load(path.join(__dirname, 'docs/swagger.yaml'));

module.exports = swaggerDocument;
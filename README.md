# 블록체인 K-POP 창작 컨텐츠 유통 플랫폼 (백엔드)

## 환경 설정

node.js v22.19.0

### Mac 설치 방법
```Bash
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"
# Download and install Node.js:
nvm install 22
# Verify the Node.js version:
node -v # Should print "v22.19.0".
# Verify npm version:
npm -v # Should print "10.9.3".
```

### Windows 설치 방법
https://nodejs.org/en/download 에 접속하여 아래 설치 파일을 다운로드

## 서버 실행
```Bash
npm run dev
```
Bash 혹은 console에 위 명령어를 통해서 실행가능

## swagger
http://localhost:3000/api-docs/

## 테스트 위한 jwt 토큰 받기
`node test_login_flow` 로 실행

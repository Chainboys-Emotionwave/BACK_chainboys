-- 사용자
CREATE TABLE users (
  userNum               INT AUTO_INCREMENT PRIMARY KEY,           -- PK
  userName              VARCHAR(255) NOT NULL,
  userWalletAddress     VARCHAR(64) UNIQUE,                        -- 지갑 주소(체크섬/소문자 통일 저장 권장)
  userNonce             VARCHAR(64),                               -- 로그인 난수(문자열 권장)
  role                  ENUM('user','admin') NOT NULL DEFAULT 'user',
  profileImageNum       INT NULL,                                  -- 이미지/아바타 id (별도 테이블 쓰면 FK로 교체)
  profileImageBackNum  INT NULL,                                  -- 배경 이미지 id
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 카테고리
CREATE TABLE category (
  cateNum   INT AUTO_INCREMENT PRIMARY KEY,
  cateName  VARCHAR(100) NOT NULL UNIQUE
);

-- 챌린지
CREATE TABLE challenges (
  challNum       INT AUTO_INCREMENT PRIMARY KEY,
  challName      VARCHAR(255) NOT NULL,
  challStartDate DATETIME NOT NULL,
  challEndDate   DATETIME NOT NULL,
  challPrize     INT NULL,  -- FK 
  challDescription TEXT
);

-- 콘텐츠
CREATE TABLE contents (
  conNum         INT AUTO_INCREMENT PRIMARY KEY,
  conTitle       VARCHAR(255) NOT NULL,
  conDescription TEXT,
  conURL         VARCHAR(1024),
  conDate        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  conViews       INT NOT NULL DEFAULT 0,
  conSupports    INT NOT NULL DEFAULT 0,          -- 누적 응원 수(집계 컬럼이면 트리거나 애플리케이션에서 관리)
  userNum        INT NOT NULL,                    -- FK → users
  challNum       INT NULL,                        -- FK → challenges
  cateNum        INT NULL,                        -- FK → category
  INDEX idx_contents_user (userNum),
  INDEX idx_contents_cate (cateNum),
  INDEX idx_contents_chall (challNum),
  CONSTRAINT fk_contents_user
    FOREIGN KEY (userNum) REFERENCES users(userNum)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_contents_cate
    FOREIGN KEY (cateNum) REFERENCES category(cateNum)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_contents_chall
    FOREIGN KEY (challNum) REFERENCES challenges(challNum)
    ON UPDATE CASCADE ON DELETE SET NULL
);

-- 응원(서포트) 
CREATE TABLE supports (
  supNum         INT AUTO_INCREMENT PRIMARY KEY,
  supDate        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  supporterNum   INT NOT NULL,     -- 응원한 사람(users.userNum)
  conNum         INT NOT NULL,     -- 응원 대상 콘텐츠(contents.conNum)
  receiverNum    INT NOT NULL,     -- 응원 받은 사람(users.userNum)
  INDEX idx_supports_con (conNum),
  INDEX idx_supports_supporter (supporterNum),
  INDEX idx_supports_receiver (receiverNum),
  CONSTRAINT fk_supports_supporter
    FOREIGN KEY (supporterNum) REFERENCES users(userNum)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_supports_receiver
    FOREIGN KEY (receiverNum) REFERENCES users(userNum)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_supports_content
    FOREIGN KEY (conNum) REFERENCES contents(conNum)
    ON UPDATE CASCADE ON DELETE CASCADE
  -- (옵션) 같은 사용자가 같은 콘텐츠를 여러 번 응원 못 하게 하려면:
  -- , UNIQUE KEY uk_support_once (supporterNum, conNum)
);



-- 광고 시청 기록
CREATE TABLE adViews (
  adId     BIGINT AUTO_INCREMENT PRIMARY KEY,
  adTime   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  userNum  INT NOT NULL,
  INDEX idx_adviews_user (userNum),
  CONSTRAINT fk_adviews_user
    FOREIGN KEY (userNum) REFERENCES users(userNum)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- 수익/보상
CREATE TABLE rewards (
  rewardNum     BIGINT AUTO_INCREMENT PRIMARY KEY,
  rewardAmount  DECIMAL(18,2) NOT NULL,
  rewardTime    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  userNum       INT NOT NULL,
  INDEX idx_rewards_user (userNum),
  CONSTRAINT fk_rewards_user
    FOREIGN KEY (userNum) REFERENCES users(userNum)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE badges (
  badgesNum    INT AUTO_INCREMENT PRIMARY KEY,
  badgesName   VARCHAR(100) NOT NULL UNIQUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE userBadges (
    userNum INT,
    badgesNum INT,
    PRIMARY KEY (userNum, badgesNum),
    FOREIGN KEY (userNum) REFERENCES users(userNum) ON DELETE CASCADE,
    FOREIGN KEY (badgesNum) REFERENCES badges(badgesNum) ON DELETE CASCADE
);

ALTER TABLE supports ADD COLUMN blockchainTxHash VARCHAR(66);
ALTER TABLE supports ADD COLUMN blockchainBlockNumber BIGINT;
ALTER TABLE supports ADD COLUMN blockchainRecordedAt TIMESTAMP NULL;

ALTER TABLE challenges ADD COLUMN blockchainTxHash VARCHAR(66);
ALTER TABLE challenges ADD COLUMN blockchainBlockNumber BIGINT;
ALTER TABLE challenges ADD COLUMN distributionTxHash VARCHAR(66);
ALTER TABLE challenges ADD COLUMN distributionBlockNumber BIGINT;
ALTER TABLE challenges ADD COLUMN prizeDistribution JSON;
ALTER TABLE challenges ADD COLUMN blockchainStatus ENUM('created', 'distributed', 'failed') DEFAULT 'created';
ALTER TABLE challenges ADD COLUMN distributedAt TIMESTAMP NULL;


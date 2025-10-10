-- 테스트 데이터 삽입
-- INSERT INTO challenges (challName, challStartDate, challEndDate, challPrize, challDescription) VALUES 
-- ('2025 K-POP 커버댄스 대회', '2025-01-01', '2025-06-30', 10, '올해 가장 인기있는 K-POP 곡으로 커버댄스를 만들어보세요!'),
-- ('신년 보컬 챌린지', '2025-01-01', '2025-01-31', 5, '새해를 맞아 K-POP 보컬 실력을 뽐내보세요!');

-- INSERT INTO category (cateName) VALUES 
-- ('음악'),
-- ('댄스'),
-- ('커버');

-- INSERT INTO badges (badgesNum, badgesName, badgesDescription) VALUES
-- (1, '새싹 주민', '커뮤니티에 처음 가입한 주민' ),
-- (2, '성장 주민', '게시물을 1개 이상 작성한 주민'),
-- (3, '성숙 주민', '게시물을 5개 이상 작성한 주민'),
-- (4, '명예 주민', '게시물을 10개 이상 작성한 주민'),
-- (5, '빌리지 마스터', '게시물을 50개 이상 작성한 주민');

-- INSERT INTO users (userName, userWalletAddress, userNonce, role) VALUES 
-- ('admin', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'abc123', 'admin'),
-- ('user1', '0xba3e1794371B9e42a7d17Bdb4B07b520137483A7', 'def456', 'user'),
-- ('user2', '0xe516e01E574b30aD176CF6076657fA9177E7F618', 'abc123', 'user'),
-- ('user3', '0x8495e5296f18839a3B9042592d8B5f386F152A4c', 'def456', 'user'),
-- ('user4', '0x7049A125408153532d7C825A1F0329b644624E70', 'abc123', 'user');

-- INSERT INTO userBadges (userNum, badgesNum) VALUES
-- (1,1),
-- (2,1),
-- (3,1),
-- (4,1),
-- (5,1);

-- UPDATE users set role = "admin" where userNum=1;
-- UPDATE challenges set challEndDate = "2025-08-31" where challNum=2;

-- select * from challenges;

-- select * from contents;

-- select * from category;

-- select * from supports;

-- select * from users;

-- select * from adViews;

-- select * from rewards;

-- select * from badges;

-- select * from userBadges;
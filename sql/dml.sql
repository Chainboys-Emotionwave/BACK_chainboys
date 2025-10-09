-- 테스트 데이터 삽입
INSERT INTO users (userName, userWalletAddress, userNonce, role) VALUES 
('admin', '0x871c87FBfA6367c78B664e533Ee90CCf68039Feb', 'abc123', 'admin'),
('testuser', '0x5F5814844abfb8177FC850160C7cC119Decef372', 'def456', 'user'),
('admin_block', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'abc123', 'admin');

INSERT INTO challenges (challName, challStartDate, challEndDate, challPrize, challDescription) VALUES 
('2025 K-POP 커버댄스 대회', '2025-01-01', '2025-12-31', 10, '올해 가장 인기있는 K-POP 곡으로 커버댄스를 만들어보세요!'),
('신년 보컬 챌린지', '2025-01-01', '2025-01-31', 5, '새해를 맞아 K-POP 보컬 실력을 뽐내보세요!');

INSERT INTO category (cateName) VALUES 
('음악'),
('댄스'),
('커버');



select * from challenges;

select * from contents;

select * from category;
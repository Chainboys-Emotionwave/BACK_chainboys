USE blockchain_db;

CREATE TABLE users (
id int NOT NULL AUTO_INCREMENT,
walletAddress varchar(255) NOT NULL,
nonce varchar(255) NOT NULL,
username varchar(255) NOT NULL,
profileImageUrl varchar(512) DEFAULT NULL,
fanTicketCount int NOT NULL,
PRIMARY KEY (id),
UNIQUE KEY walletAddress_UNIQUE (walletAddress)
);

CREATE TABLE contents (
id int NOT NULL AUTO_INCREMENT,
title varchar(255) NOT NULL,
description text,
contentUrl varchar(512) DEFAULT NULL,
creatorId int NOT NULL,
supportCount int NOT NULL,
createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
viewsCount int NOT NULL,
PRIMARY KEY (id),
KEY FK_content_user_idx (creatorId),
CONSTRAINT FK_content_user FOREIGN KEY (creatorId) REFERENCES users (id)
);

CREATE TABLE supports (
id int NOT NULL AUTO_INCREMENT,
supporterId int NOT NULL,
contentId int NOT NULL,
createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (id),
KEY FK_support_user_idx (supporterId),
KEY FK_support_content_idx (contentId),
CONSTRAINT FK_support_content FOREIGN KEY (contentId) REFERENCES contents (id),
CONSTRAINT FK_support_user FOREIGN KEY (supporterId) REFERENCES users (id)
);

CREATE TABLE ad_views (
id int NOT NULL AUTO_INCREMENT,
viewerId int NOT NULL,
viewedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (id),
KEY FK_adview_user_idx (viewerId),
CONSTRAINT FK_adview_user FOREIGN KEY (viewerId) REFERENCES users (id)
);

CREATE TABLE rewards (
id int NOT NULL AUTO_INCREMENT,
creatorId int NOT NULL,
amount double NOT NULL,
createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (id),
KEY FK_reward_user_idx (creatorId),
CONSTRAINT FK_reward_user FOREIGN KEY (creatorId) REFERENCES users (id)
);

CREATE TABLE ranking_snapshot (
id int NOT NULL AUTO_INCREMENT,
rankDate timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
creatorRank json NOT NULL,
contentRank json NOT NULL,
PRIMARY KEY (id)
);
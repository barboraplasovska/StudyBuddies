GRANT ALL PRIVILEGES ON *.* TO 'admin_user'@'%' IDENTIFIED BY 'sql_to_define';
FLUSH PRIVILEGES;


-- Study Buddies database creation

CREATE DATABASE IF NOT EXISTS studybuddies;
USE studybuddies;

-- AppRole table initialization

CREATE TABLE IF NOT EXISTS approle (
    id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

INSERT INTO approle (NAME) VALUES ("ADMINISTRATOR");
INSERT INTO approle (NAME) VALUES ("USER");

-- User table initialization

CREATE TABLE IF NOT EXISTS user (
    id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    joindate DATE NOT NULL,
    bandate DATE,
    roleid BIGINT,
    picture VARCHAR(255),
    verified TINYINT(1) NOT NULL,
    CONSTRAINT `fk_user_approle`
        FOREIGN KEY (roleid) REFERENCES approle (id)
        ON DELETE SET NULL
);

-- Group table initialization

CREATE TABLE IF NOT EXISTS groups (
    id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    address VARCHAR(255),
    picture VARCHAR(255),
    parentid BIGINT,
    verified BOOLEAN,
    CONSTRAINT `fk_groups_parent`
        FOREIGN KEY (parentid) REFERENCES groups (id)
        ON DELETE SET NULL
);

-- Group role table initialization

CREATE TABLE IF NOT EXISTS grouprole (
    id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

INSERT INTO grouprole (NAME) VALUES ("OWNER");
INSERT INTO grouprole (NAME) VALUES ("ADMINISTRATOR");
INSERT INTO grouprole (NAME) VALUES ("MEMBER");

-- Group user table initialization

CREATE TABLE IF NOT EXISTS groupuser (
    id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    userid BIGINT NOT NULL,
    groupid BIGINT NOT NULL,
    grouproleid BIGINT,
    CONSTRAINT `fk_groupuser_user`
        FOREIGN KEY (userid) REFERENCES user (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    CONSTRAINT `fk_groupuser_group`
        FOREIGN KEY (groupid) REFERENCES groups (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    CONSTRAINT `fk_groupuser_grouprole`
        FOREIGN KEY (grouproleid) REFERENCES grouprole (id)
        ON DELETE SET NULL
);

-- Group Waiting List table initialization

CREATE TABLE IF NOT EXISTS groupwaitinglist (
    id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    userid BIGINT NOT NULL,
    groupid BIGINT NOT NULL,
    CONSTRAINT `fk_groupwaitinglist_user`
        FOREIGN KEY (userid) REFERENCES user (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    CONSTRAINT `fk_groupwaitinglist_group`
        FOREIGN KEY (groupid) REFERENCES groups (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
);

-- Credential table

CREATE TABLE IF NOT EXISTS credential (
    id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    userid BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    CONSTRAINT `fk_credential_user`
        FOREIGN KEY (userid) REFERENCES user (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
);

-- Session table initialization

CREATE TABLE IF NOT EXISTS session (
    id UUID PRIMARY KEY NOT NULL,
    userid BIGINT NOT NULL,
    expireat DATETIME NOT NULL,
    CONSTRAINT `fk_session_user`
        FOREIGN KEY (userid) REFERENCES user (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
);

-- Event table initialization

CREATE TABLE IF NOT EXISTS event (
    id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    groupid BIGINT NOT NULL,
    date DATETIME NOT NULL,
    endtime DATETIME NOT NULL,
    location ENUM('online', 'offline', 'hybrid') NOT NULL,
    link VARCHAR(255),
    address VARCHAR(255),
    maxpeople INT NOT NULL,
    CONSTRAINT `fk_event_group`
        FOREIGN KEY (groupid) REFERENCES groups (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
);

-- Event user table initialization

CREATE TABLE IF NOT EXISTS eventuser  (
    id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    userid BIGINT NOT NULL,
    eventid BIGINT NOT NULL,
    grouproleid BIGINT,
    CONSTRAINT `fk_eventuser_user`
        FOREIGN KEY (userid) REFERENCES user (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    CONSTRAINT `fk_eventuser_event`
        FOREIGN KEY (eventid) REFERENCES event (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    CONSTRAINT `fk_eventuser_grouprole`
        FOREIGN KEY (grouproleid) REFERENCES grouprole (id)
        ON DELETE SET NULL
);

-- Event Waiting List table initialization

CREATE TABLE IF NOT EXISTS eventwaitinglist (
    id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    userid BIGINT NOT NULL,
    eventid BIGINT NOT NULL,
    CONSTRAINT `fk_eventwaitinglist_user`
        FOREIGN KEY (userid) REFERENCES user (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    CONSTRAINT `fk_eventwaitinglist_event`
        FOREIGN KEY (eventid) REFERENCES event (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
);

-- Exam table initialization

CREATE TABLE IF NOT EXISTS exam (
    id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    userid BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    date DATETIME NOT NULL,
    endtime DATETIME NOT NULL,
    CONSTRAINT `fk_examuser_user`
        FOREIGN KEY (userid) REFERENCES user (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
);
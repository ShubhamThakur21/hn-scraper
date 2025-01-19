CREATE DATABASE hackernews;

USE hackernews;

CREATE TABLE stories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    story_id INT NOT NULL UNIQUE,
    title VARCHAR(255),
    url VARCHAR(255),
    author VARCHAR(255),
    score INT,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

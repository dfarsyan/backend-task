CREATE DATABASE combinations_db;
USE combinations_db;

CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(10) UNIQUE NOT NULL
);

CREATE TABLE combinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combination JSON NOT NULL
);

CREATE TABLE responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combination_ids JSON NOT NULL
);
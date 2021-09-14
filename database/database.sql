CREATE DATABASE upgrap;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(40),
    email TEXT
);

CREATE TABLE customer(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    apellido VARCHAR(50),
    email TEXT,
    city VARCHAR(40),
    dir TEXT,
    pais VARCHAR(50),
    password TEXT,
    phone VARCHAR(20)
);

INSERT INTO users (name, email)
    VALUES('david', '1400kss@gmail.com');

-- categorias

create table products (
	id SERIAL PRIMARY KEY,
	address TEXT,
	category INT4,
	change VARCHAR(300),
	city VARCHAR(50),
	description TEXT,
	estado VARCHAR(15),
	fecha TEXT,
	id_user INT4,
	name VARCHAR(150),
	pais VARCHAR(80),
	photo TEXT,
	visible BOOLEAN,
	image TEXT,
	image1 TEXT,
	image2 TEXT
	
);
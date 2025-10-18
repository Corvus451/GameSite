DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS passwords;
DROP TABLE IF EXISTS refresh_tokens;

CREATE TABLE users (
user_id serial PRIMARY KEY,
username varchar(15) NOT NULL UNIQUE,
admin boolean DEFAULT false,
created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE passwords (
    user_id integer NOT NULL,
    password_hash varchar(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE refresh_tokens (
    token_id serial PRIMARY KEY,
    token varchar(255) NOT NULL,
    user_id integer NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
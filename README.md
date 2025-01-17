# Tables For the Database

//Admin
CREATE TABLE "admins" (
  "admin_id" int NOT NULL,
  "admin_name" varchar(50) NOT NULL,
  PRIMARY KEY ("admin_id")
); \n

//Books
CREATE TABLE "books" (
  "book_id" int NOT NULL AUTO_INCREMENT,
  "title" varchar(1000) DEFAULT NULL,
  "author" varchar(100) NOT NULL,
  "rating" double DEFAULT NULL,
  "book_desc" varchar(10000) DEFAULT NULL,
  "pageCount" int DEFAULT NULL,
  "image_link" varchar(2000) DEFAULT NULL,
  "genre_id" int DEFAULT NULL,
  "admin_id" int DEFAULT NULL,
  "published_date" date DEFAULT NULL,
  "added_at" date DEFAULT NULL,
  PRIMARY KEY ("book_id"),
  KEY "genre_id" ("genre_id"),
  KEY "admin_id" ("admin_id"),
  CONSTRAINT "books_ibfk_1" FOREIGN KEY ("genre_id") REFERENCES "genres" ("genre_id"),
  CONSTRAINT "books_ibfk_2" FOREIGN KEY ("admin_id") REFERENCES "admins" ("admin_id")
);

//Books Genres
CREATE TABLE "books_genres" (
  "book_id" int NOT NULL,
  "genre_id" int NOT NULL,
  PRIMARY KEY ("book_id","genre_id"),
  KEY "genre_id" ("genre_id"),
  CONSTRAINT "books_genres_ibfk_1" FOREIGN KEY ("book_id") REFERENCES "books" ("book_id"),
  CONSTRAINT "books_genres_ibfk_2" FOREIGN KEY ("genre_id") REFERENCES "genres" ("genre_id")
);

//Completed
CREATE TABLE "completed" (
  "completedId" int NOT NULL AUTO_INCREMENT,
  "userId" int DEFAULT NULL,
  "bookId" int DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("completedId"),
  KEY "userId" ("userId"),
  KEY "bookId" ("bookId"),
  CONSTRAINT "completed_ibfk_1" FOREIGN KEY ("userId") REFERENCES "user" ("userId"),
  CONSTRAINT "completed_ibfk_2" FOREIGN KEY ("bookId") REFERENCES "books" ("book_id")
);

//Favourites
CREATE TABLE "favorites" (
  "favid" int NOT NULL AUTO_INCREMENT,
  "userId" int DEFAULT NULL,
  "bookId" int DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("favid"),
  KEY "userId" ("userId"),
  KEY "bookId" ("bookId"),
  CONSTRAINT "favorites_ibfk_1" FOREIGN KEY ("userId") REFERENCES "user" ("userId"),
  CONSTRAINT "favorites_ibfk_2" FOREIGN KEY ("bookId") REFERENCES "books" ("book_id")
);

//Friend Requests
CREATE TABLE "friend_requests" (
  "request_id" int NOT NULL AUTO_INCREMENT,
  "sender_id" int NOT NULL,
  "receiver_id" int NOT NULL,
  "status" varchar(100) NOT NULL DEFAULT 'pending',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("request_id"),
  KEY "sender_id" ("sender_id"),
  KEY "receiver_id" ("receiver_id"),
  CONSTRAINT "friend_requests_ibfk_1" FOREIGN KEY ("sender_id") REFERENCES "user" ("userId"),
  CONSTRAINT "friend_requests_ibfk_2" FOREIGN KEY ("receiver_id") REFERENCES "user" ("userId")
);

//Friendships
CREATE TABLE "friendships" (
  "friendship_id" int NOT NULL AUTO_INCREMENT,
  "sender" int NOT NULL,
  "receiver" int NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("friendship_id"),
  KEY "user1Id" ("sender"),
  KEY "user2Id" ("receiver"),
  CONSTRAINT "friendships_ibfk_1" FOREIGN KEY ("sender") REFERENCES "user" ("userId"),
  CONSTRAINT "friendships_ibfk_2" FOREIGN KEY ("receiver") REFERENCES "user" ("userId")
);

//Genres
CREATE TABLE "genres" (
  "genre_id" int NOT NULL AUTO_INCREMENT,
  "genre_name" varchar(50) NOT NULL,
  PRIMARY KEY ("genre_id")
);

//Reading
CREATE TABLE "reading" (
  "readingId" int NOT NULL AUTO_INCREMENT,
  "userId" int DEFAULT NULL,
  "bookId" int DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("readingId"),
  KEY "userId" ("userId"),
  KEY "bookId" ("bookId"),
  CONSTRAINT "reading_ibfk_1" FOREIGN KEY ("userId") REFERENCES "user" ("userId"),
  CONSTRAINT "reading_ibfk_2" FOREIGN KEY ("bookId") REFERENCES "books" ("book_id")
);

//TO_read
CREATE TABLE "to_read" (
  "toReadId" int NOT NULL AUTO_INCREMENT,
  "userId" int DEFAULT NULL,
  "bookId" int DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("toReadId"),
  KEY "userId" ("userId"),
  KEY "bookId" ("bookId"),
  CONSTRAINT "to_read_ibfk_1" FOREIGN KEY ("userId") REFERENCES "user" ("userId"),
  CONSTRAINT "to_read_ibfk_2" FOREIGN KEY ("bookId") REFERENCES "books" ("book_id")
);

//User
CREATE TABLE "user" (
  "userId" int NOT NULL AUTO_INCREMENT,
  "username" varchar(250) DEFAULT NULL,
  "pass" varchar(250) DEFAULT NULL,
  "profile_pic" varchar(250) DEFAULT NULL,
  PRIMARY KEY ("userId")
);

# Steps to Start the Project
1. Set Up the Development Environment
Install Required Tools:
  Node.js (for backend and frontend tools)
  MySQL or MariaDB (for the database)
2. Backend Development
Initialize a Node.js Backend:
  mkdir backend
  cd backend
  npm init -y
3. Create .env File:
  DB_HOST=localhost
  DB_USER=root
  DB_PASS=your_password
  DB_NAME=book_management
  PORT=5000
4.NPM START to run the project

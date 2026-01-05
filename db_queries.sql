-- SQLite Database Schema Queries
-- Run these commands in terminal: sqlite3 chatbot.db < db_queries.sql
-- Or run interactively: sqlite3 chatbot.db

-- 1. List all tables
SELECT name FROM sqlite_master WHERE type='table';

-- 2. View users table schema
.schema users

-- 3. View conversations table schema
.schema conversations

-- 4. View all users
SELECT * FROM users;

-- 5. View all conversations
SELECT id, user_id, created_at, updated_at FROM conversations;

-- 6. Count users
SELECT COUNT(*) as total_users FROM users;

-- 7. Count conversations
SELECT COUNT(*) as total_conversations FROM conversations;

-- 8. View users with their conversation count
SELECT 
    u.id,
    u.name,
    u.email,
    u.auth0_sub,
    COUNT(c.id) as conversation_count
FROM users u
LEFT JOIN conversations c ON u.id = c.user_id
GROUP BY u.id;

-- 9. View recent conversations
SELECT 
    c.id,
    u.name,
    u.email,
    c.created_at,
    c.updated_at
FROM conversations c
JOIN users u ON c.user_id = u.id
ORDER BY c.updated_at DESC
LIMIT 10;

-- 10. View indexes
SELECT name, sql FROM sqlite_master WHERE type='index';


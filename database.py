import sqlite3
from typing import Optional, Dict, List
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Database:
    """Simple SQLite database for users and conversations"""
    
    def __init__(self, db_path: str = "chatbot.db"):
        self.db_path = Path(db_path)
        self.init_db()
    
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_db(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Users table - ADD auth0_sub field
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                auth0_sub TEXT UNIQUE,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Add auth0_sub column if it doesn't exist (for existing databases)
        # SQLite doesn't allow adding UNIQUE columns, so add column first, then index
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN auth0_sub TEXT")
            # Create unique index separately
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth0_sub ON users(auth0_sub)")
            conn.commit()
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                pass  # Column already exists
            else:
                logger.warning(f"Could not add auth0_sub column: {e}")
        
        # Conversations table (temporary storage - auto cleanup old ones)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                messages TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info(f"Database initialized at {self.db_path}")
    
    # User methods
    def create_user(self, name: str, email: str, phone: Optional[str] = None) -> Optional[int]:
        """Create a new user"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (name, email, phone) VALUES (?, ?, ?)",
                (name, email, phone)
            )
            user_id = cursor.lastrowid
            conn.commit()
            conn.close()
            return user_id
        except sqlite3.IntegrityError:
            logger.error(f"User with email {email} already exists")
            return None
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None
    
    def get_user(self, user_id: int) -> Optional[Dict]:
        """Get user by ID"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            conn.close()
            
            if row:
                return dict(row)
            return None
        except Exception as e:
            logger.error(f"Error getting user: {e}")
            return None
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            conn.close()
            
            if row:
                return dict(row)
            return None
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return None
    
    # Conversation methods
    def store_conversation(self, user_id: int, conversation_id: str, messages: List[Dict]):
        """Store conversation history"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            messages_json = json.dumps(messages)
            cursor.execute("""
                INSERT OR REPLACE INTO conversations (id, user_id, messages, updated_at)
                VALUES (?, ?, ?, ?)
            """, (conversation_id, user_id, messages_json, datetime.utcnow()))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            logger.error(f"Error storing conversation: {e}")
            return False
    
    def get_conversation(self, user_id: int, conversation_id: str) -> Optional[List[Dict]]:
        """Get conversation history"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT messages FROM conversations WHERE id = ? AND user_id = ?",
                (conversation_id, user_id)
            )
            row = cursor.fetchone()
            conn.close()
            
            if row:
                return json.loads(row['messages'])
            return None
        except Exception as e:
            logger.error(f"Error getting conversation: {e}")
            return None
    
    def clear_conversation(self, user_id: int, conversation_id: str):
        """Delete a conversation"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "DELETE FROM conversations WHERE id = ? AND user_id = ?",
                (conversation_id, user_id)
            )
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            logger.error(f"Error clearing conversation: {e}")
            return False
    
    def cleanup_old_conversations(self, days: int = 1):
        """Clean up conversations older than specified days"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cutoff = datetime.utcnow() - timedelta(days=days)
            cursor.execute(
                "DELETE FROM conversations WHERE updated_at < ?",
                (cutoff,)
            )
            deleted = cursor.rowcount
            conn.commit()
            conn.close()
            logger.info(f"Cleaned up {deleted} old conversations")
            return deleted
        except Exception as e:
            logger.error(f"Error cleaning up conversations: {e}")
            return 0
    
    def create_or_update_user_from_auth0(
        self, 
        auth0_sub: str, 
        name: str, 
        email: str, 
        picture: Optional[str] = None
    ) -> Optional[int]:
        """Create or update user from Auth0 info"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Check if user exists by auth0_sub
            cursor.execute("SELECT id FROM users WHERE auth0_sub = ?", (auth0_sub,))
            existing = cursor.fetchone()
            
            if existing:
                # Update existing user
                user_id = existing['id']
                cursor.execute(
                    "UPDATE users SET name = ?, email = ? WHERE auth0_sub = ?",
                    (name, email, auth0_sub)
                )
            else:
                # Check if user exists by email (for migration)
                cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
                email_existing = cursor.fetchone()
                
                if email_existing:
                    # Update existing user with auth0_sub
                    user_id = email_existing['id']
                    cursor.execute(
                        "UPDATE users SET auth0_sub = ?, name = ? WHERE email = ?",
                        (auth0_sub, name, email)
                    )
                else:
                    # Create new user
                    cursor.execute(
                        "INSERT INTO users (auth0_sub, name, email) VALUES (?, ?, ?)",
                        (auth0_sub, name, email)
                    )
                    user_id = cursor.lastrowid
            
            conn.commit()
            conn.close()
            return user_id
        except Exception as e:
            logger.error(f"Error creating/updating user from Auth0: {e}")
            return None
    
    def get_user_by_auth0_sub(self, auth0_sub: str) -> Optional[Dict]:
        """Get user by Auth0 sub (subject) identifier"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE auth0_sub = ?", (auth0_sub,))
            row = cursor.fetchone()
            conn.close()
            
            if row:
                return dict(row)
            return None
        except Exception as e:
            logger.error(f"Error getting user by auth0_sub: {e}")
            return None

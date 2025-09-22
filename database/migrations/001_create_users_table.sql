-- =============================================
-- SIKAP Database Migration #001
-- Create Users Table
-- Author: SIKAP Development Team
-- Date: 2024-01-01
-- Description: Core user authentication table
-- =============================================

-- Create users table
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    status ENUM('active', 'inactive', 'suspended', 'pending_verification') NOT NULL DEFAULT 'pending_verification',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    email_verified_at TIMESTAMP NULL,

    -- Primary key
    PRIMARY KEY (id),

    -- Unique constraints
    UNIQUE KEY uk_users_email (email),
    UNIQUE KEY uk_users_username (username),

    -- Indexes for performance
    INDEX idx_users_status (status),
    INDEX idx_users_created_at (created_at),
    INDEX idx_users_email_verified (email_verified_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User accounts and authentication data';

-- Insert default admin user
INSERT INTO users (email, username, password_hash, full_name, status, email_verified_at) VALUES
('admin@tanatidung.go.id', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'active', NOW());

-- Add comments to columns
ALTER TABLE users
    MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key - user identifier',
    MODIFY COLUMN email VARCHAR(255) NOT NULL COMMENT 'User email address (unique)',
    MODIFY COLUMN username VARCHAR(100) NOT NULL COMMENT 'Username for login (unique)',
    MODIFY COLUMN password_hash VARCHAR(255) NOT NULL COMMENT 'Hashed password using bcrypt',
    MODIFY COLUMN full_name VARCHAR(255) NOT NULL COMMENT 'User full name',
    MODIFY COLUMN phone VARCHAR(20) NULL COMMENT 'User phone number (optional)',
    MODIFY COLUMN status ENUM('active', 'inactive', 'suspended', 'pending_verification') NOT NULL DEFAULT 'pending_verification' COMMENT 'User account status',
    MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation timestamp',
    MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    MODIFY COLUMN email_verified_at TIMESTAMP NULL COMMENT 'Email verification timestamp';

-- Create audit trigger for users table
DELIMITER $$
CREATE TRIGGER tr_users_audit_insert
    AFTER INSERT ON users
    FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, entity_type, entity_id, action, description, ip_address, created_at)
    VALUES (NEW.id, 'users', NEW.id, 'CREATE', CONCAT('User account created: ', NEW.full_name), '127.0.0.1', NOW());
END$$

CREATE TRIGGER tr_users_audit_update
    AFTER UPDATE ON users
    FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, entity_type, entity_id, action, description, ip_address, created_at)
    VALUES (NEW.id, 'users', NEW.id, 'UPDATE', CONCAT('User account updated: ', NEW.full_name), '127.0.0.1', NOW());
END$$
DELIMITER ;

-- Migration completion log
SELECT 'Migration 001_create_users_table.sql completed successfully' AS status;
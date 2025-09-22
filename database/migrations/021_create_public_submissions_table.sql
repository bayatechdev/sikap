-- =============================================
-- SIKAP Database Migration #021
-- Create Public Submissions Table
-- Author: SIKAP Development Team
-- Date: 2024-01-21
-- Description: Public submission tracking for non-logged users
-- =============================================

-- Create public_submissions table
CREATE TABLE public_submissions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    application_id BIGINT UNSIGNED NOT NULL,
    tracking_number VARCHAR(20) NOT NULL UNIQUE,
    public_token VARCHAR(64) NOT NULL UNIQUE,

    -- Contact information
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,

    -- Tracking
    last_accessed TIMESTAMP NULL,
    email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Primary key
    PRIMARY KEY (id),

    -- Foreign keys
    CONSTRAINT fk_public_submissions_application_id
        FOREIGN KEY (application_id) REFERENCES applications(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- Indexes for performance
    INDEX idx_public_submissions_tracking (tracking_number),
    INDEX idx_public_submissions_token (public_token),
    INDEX idx_public_submissions_email (contact_email),
    INDEX idx_public_submissions_application (application_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Public submission tracking for non-registered users';

-- Add column comments
ALTER TABLE public_submissions
    MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key - public submission identifier',
    MODIFY COLUMN application_id BIGINT UNSIGNED NOT NULL COMMENT 'FK to applications - linked application',
    MODIFY COLUMN tracking_number VARCHAR(20) NOT NULL UNIQUE COMMENT 'Public tracking number (e.g. SIKAP-2024-001)',
    MODIFY COLUMN public_token VARCHAR(64) NOT NULL UNIQUE COMMENT 'Secure token for public access',
    MODIFY COLUMN contact_email VARCHAR(255) NOT NULL COMMENT 'Email for notifications and tracking',
    MODIFY COLUMN last_accessed TIMESTAMP NULL COMMENT 'Last time tracking page was accessed';

-- Migration completion log
SELECT 'Migration 021_create_public_submissions_table.sql completed successfully' AS status;
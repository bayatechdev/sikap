-- =============================================
-- SIKAP Database Migration #022
-- Create Application Status History Table
-- Author: SIKAP Development Team
-- Date: 2024-01-22
-- Description: Track all status changes for applications
-- =============================================

-- Create application_status_history table
CREATE TABLE application_status_history (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    application_id BIGINT UNSIGNED NOT NULL,

    -- Status tracking
    previous_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NOT NULL,

    -- Change tracking
    changed_by BIGINT UNSIGNED NULL COMMENT 'User who made the change (nullable for system changes)',
    notes TEXT NULL COMMENT 'Additional notes about the status change',
    notify_applicant BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether to send notification to applicant',

    -- Timestamps
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Primary key
    PRIMARY KEY (id),

    -- Foreign keys
    CONSTRAINT fk_status_history_application_id
        FOREIGN KEY (application_id) REFERENCES applications(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_status_history_changed_by
        FOREIGN KEY (changed_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    -- Indexes for performance
    INDEX idx_status_history_application (application_id),
    INDEX idx_status_history_changed_at (changed_at DESC),
    INDEX idx_status_history_new_status (new_status),
    INDEX idx_status_history_notify (notify_applicant, changed_at DESC),
    INDEX idx_status_history_changed_by (changed_by)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='History of all application status changes';

-- Add column comments
ALTER TABLE application_status_history
    MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key - status history identifier',
    MODIFY COLUMN application_id BIGINT UNSIGNED NOT NULL COMMENT 'FK to applications - application being tracked',
    MODIFY COLUMN previous_status VARCHAR(50) NULL COMMENT 'Previous status (null for initial status)',
    MODIFY COLUMN new_status VARCHAR(50) NOT NULL COMMENT 'New status after change',
    MODIFY COLUMN changed_by BIGINT UNSIGNED NULL COMMENT 'FK to users - who made the change (null for system)';

-- Create trigger to automatically log status changes
DELIMITER $$
CREATE TRIGGER tr_applications_status_history
    AFTER UPDATE ON applications
    FOR EACH ROW
BEGIN
    -- Only log if status actually changed
    IF OLD.status != NEW.status THEN
        INSERT INTO application_status_history (
            application_id, previous_status, new_status, changed_by,
            notes, notify_applicant, changed_at
        ) VALUES (
            NEW.id, OLD.status, NEW.status, NEW.assigned_to,
            CONCAT('Status changed from ', OLD.status, ' to ', NEW.status),
            TRUE, NOW()
        );
    END IF;
END$$
DELIMITER ;

-- Migration completion log
SELECT 'Migration 022_create_application_status_history_table.sql completed successfully' AS status;
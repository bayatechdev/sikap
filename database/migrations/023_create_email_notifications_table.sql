-- =============================================
-- SIKAP Database Migration #023
-- Create Email Notifications Table
-- Author: SIKAP Development Team
-- Date: 2024-01-23
-- Description: Email notification queue and history
-- =============================================

-- Create email_notifications table
CREATE TABLE email_notifications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    application_id BIGINT UNSIGNED NOT NULL,

    -- Email details
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,

    -- Notification metadata
    notification_type ENUM(
        'status_change',
        'document_upload',
        'approval_request',
        'rejection_notice',
        'revision_request',
        'deadline_reminder',
        'submission_confirmation'
    ) NOT NULL,

    -- Delivery status
    status ENUM('pending', 'sent', 'failed', 'bounced') NOT NULL DEFAULT 'pending',
    error_message TEXT NULL,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL,

    -- Primary key
    PRIMARY KEY (id),

    -- Foreign keys
    CONSTRAINT fk_email_notifications_application_id
        FOREIGN KEY (application_id) REFERENCES applications(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- Indexes for performance
    INDEX idx_email_notifications_application (application_id),
    INDEX idx_email_notifications_status (status, created_at DESC),
    INDEX idx_email_notifications_type (notification_type),
    INDEX idx_email_notifications_recipient (recipient_email),
    INDEX idx_email_notifications_pending (status, created_at ASC),
    INDEX idx_email_notifications_sent_at (sent_at DESC)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Email notification queue and delivery history';

-- Add column comments
ALTER TABLE email_notifications
    MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key - notification identifier',
    MODIFY COLUMN application_id BIGINT UNSIGNED NOT NULL COMMENT 'FK to applications - related application',
    MODIFY COLUMN recipient_email VARCHAR(255) NOT NULL COMMENT 'Email address to send notification to',
    MODIFY COLUMN subject VARCHAR(500) NOT NULL COMMENT 'Email subject line',
    MODIFY COLUMN message TEXT NOT NULL COMMENT 'Email body content',
    MODIFY COLUMN notification_type ENUM('status_change','document_upload','approval_request','rejection_notice','revision_request','deadline_reminder','submission_confirmation') NOT NULL COMMENT 'Type of notification being sent',
    MODIFY COLUMN status ENUM('pending','sent','failed','bounced') NOT NULL DEFAULT 'pending' COMMENT 'Delivery status of the email';

-- Create trigger to auto-generate notifications on status change
DELIMITER $$
CREATE TRIGGER tr_applications_email_notification
    AFTER INSERT ON application_status_history
    FOR EACH ROW
BEGIN
    DECLARE v_contact_email VARCHAR(255);
    DECLARE v_tracking_number VARCHAR(20);
    DECLARE v_title VARCHAR(500);
    DECLARE v_subject VARCHAR(500);
    DECLARE v_message TEXT;

    -- Get application details
    SELECT a.contact_email, a.tracking_number, a.title
    INTO v_contact_email, v_tracking_number, v_title
    FROM applications a
    WHERE a.id = NEW.application_id;

    -- Only send notification if notify_applicant is true
    IF NEW.notify_applicant = TRUE THEN
        -- Generate subject and message based on status
        CASE NEW.new_status
            WHEN 'submitted' THEN
                SET v_subject = CONCAT('[SIKAP] Permohonan Diterima - ', v_tracking_number);
                SET v_message = CONCAT('Permohonan Anda dengan nomor tracking ', v_tracking_number, ' telah diterima dan sedang dalam proses review. Anda akan mendapat notifikasi update status selanjutnya.');
            WHEN 'approved' THEN
                SET v_subject = CONCAT('[SIKAP] Permohonan Disetujui - ', v_tracking_number);
                SET v_message = CONCAT('Selamat! Permohonan Anda dengan nomor tracking ', v_tracking_number, ' telah disetujui. Silakan hubungi kantor kami untuk proses selanjutnya.');
            WHEN 'rejected' THEN
                SET v_subject = CONCAT('[SIKAP] Permohonan Ditolak - ', v_tracking_number);
                SET v_message = CONCAT('Mohon maaf, permohonan Anda dengan nomor tracking ', v_tracking_number, ' tidak dapat disetujui. ', COALESCE(NEW.notes, ''));
            WHEN 'revision_required' THEN
                SET v_subject = CONCAT('[SIKAP] Perlu Revisi - ', v_tracking_number);
                SET v_message = CONCAT('Permohonan Anda dengan nomor tracking ', v_tracking_number, ' memerlukan revisi. ', COALESCE(NEW.notes, ''));
            ELSE
                SET v_subject = CONCAT('[SIKAP] Update Status - ', v_tracking_number);
                SET v_message = CONCAT('Status permohonan Anda dengan nomor tracking ', v_tracking_number, ' telah berubah menjadi: ', NEW.new_status);
        END CASE;

        -- Insert notification record
        INSERT INTO email_notifications (
            application_id, recipient_email, subject, message,
            notification_type, status, created_at
        ) VALUES (
            NEW.application_id, v_contact_email, v_subject, v_message,
            'status_change', 'pending', NOW()
        );
    END IF;
END$$
DELIMITER ;

-- Migration completion log
SELECT 'Migration 023_create_email_notifications_table.sql completed successfully' AS status;
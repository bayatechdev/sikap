-- =============================================
-- SIKAP Database Migration #007
-- Create Applications Table
-- Author: SIKAP Development Team
-- Date: 2024-01-07
-- Description: Main applications/permohonan table
-- =============================================

-- Create applications table
CREATE TABLE applications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NULL COMMENT 'FK to users - nullable for public submissions',
    application_type_id INT UNSIGNED NOT NULL,
    institution_id INT UNSIGNED NULL,
    cooperation_category_id INT UNSIGNED NULL,

    -- Public tracking system
    tracking_number VARCHAR(20) NOT NULL UNIQUE COMMENT 'Public tracking number (e.g. SIKAP-2024-001)',
    public_token VARCHAR(64) NOT NULL UNIQUE COMMENT 'Secure token for public access',
    is_public_submission BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'True for public, false for admin-created',

    -- Basic information
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    purpose TEXT NOT NULL COMMENT 'Keperluan - purpose of cooperation',
    about TEXT NOT NULL COMMENT 'Tentang - detailed description',
    notes TEXT NULL COMMENT 'Catatan - additional notes',

    -- Contact information from form
    contact_person VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    institution_name VARCHAR(255) NOT NULL,

    -- Status and workflow
    status ENUM(
        'draft',
        'submitted',
        'in_review',
        'document_verification',
        'legal_review',
        'approval_pending',
        'approved',
        'rejected',
        'revision_required',
        'cancelled'
    ) NOT NULL DEFAULT 'draft',

    priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',

    -- Timestamps
    submitted_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    rejected_at TIMESTAMP NULL,
    due_date TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Assignment
    assigned_to BIGINT UNSIGNED NULL COMMENT 'Currently assigned reviewer',
    assigned_at TIMESTAMP NULL,

    -- Rejection details
    rejection_reason TEXT NULL,
    revision_notes TEXT NULL,

    -- Primary key
    PRIMARY KEY (id),

    -- Foreign keys
    CONSTRAINT fk_applications_user_id
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT fk_applications_application_type_id
        FOREIGN KEY (application_type_id) REFERENCES application_types(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_applications_institution_id
        FOREIGN KEY (institution_id) REFERENCES institutions(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT fk_applications_cooperation_category_id
        FOREIGN KEY (cooperation_category_id) REFERENCES cooperation_categories(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT fk_applications_assigned_to
        FOREIGN KEY (assigned_to) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    -- Indexes for performance
    INDEX idx_applications_user_id (user_id),
    INDEX idx_applications_status (status),
    INDEX idx_applications_type_status (application_type_id, status),
    INDEX idx_applications_submitted_at (submitted_at DESC),
    INDEX idx_applications_assigned_to (assigned_to),
    INDEX idx_applications_user_status (user_id, status),
    INDEX idx_applications_priority_status (priority, status),
    INDEX idx_applications_tracking_number (tracking_number),
    INDEX idx_applications_public_token (public_token),
    INDEX idx_applications_public_submission (is_public_submission, status),
    INDEX idx_applications_contact_email (contact_email),

    -- Full-text search index
    FULLTEXT INDEX idx_applications_search (title, description, purpose, about)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Main applications/cooperation requests table';

-- Add column comments
ALTER TABLE applications
    MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key - application identifier',
    MODIFY COLUMN user_id BIGINT UNSIGNED NOT NULL COMMENT 'FK to users - application submitter',
    MODIFY COLUMN application_type_id INT UNSIGNED NOT NULL COMMENT 'FK to application_types - type of cooperation',
    MODIFY COLUMN title VARCHAR(500) NOT NULL COMMENT 'Application title/subject',
    MODIFY COLUMN description TEXT NOT NULL COMMENT 'Detailed description of cooperation',
    MODIFY COLUMN status ENUM('draft', 'submitted', 'in_review', 'document_verification', 'legal_review', 'approval_pending', 'approved', 'rejected', 'revision_required', 'cancelled') NOT NULL DEFAULT 'draft' COMMENT 'Current application status',
    MODIFY COLUMN priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal' COMMENT 'Application priority level';

-- Create audit trigger for applications
DELIMITER $$
CREATE TRIGGER tr_applications_audit_insert
    AFTER INSERT ON applications
    FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, entity_type, entity_id, action, description, ip_address, created_at)
    VALUES (NEW.user_id, 'applications', NEW.id, 'CREATE', CONCAT('Application created: ', NEW.title), '127.0.0.1', NOW());
END$$

CREATE TRIGGER tr_applications_audit_update
    AFTER UPDATE ON applications
    FOR EACH ROW
BEGIN
    -- Log status changes
    IF OLD.status != NEW.status THEN
        INSERT INTO activity_logs (user_id, entity_type, entity_id, action, description, ip_address, created_at)
        VALUES (NEW.user_id, 'applications', NEW.id, 'STATUS_CHANGE',
                CONCAT('Application status changed from ', OLD.status, ' to ', NEW.status), '127.0.0.1', NOW());
    END IF;

    -- Log assignment changes
    IF (OLD.assigned_to IS NULL AND NEW.assigned_to IS NOT NULL) OR
       (OLD.assigned_to IS NOT NULL AND NEW.assigned_to IS NULL) OR
       (OLD.assigned_to != NEW.assigned_to) THEN
        INSERT INTO activity_logs (user_id, entity_type, entity_id, action, description, ip_address, created_at)
        VALUES (COALESCE(NEW.assigned_to, NEW.user_id), 'applications', NEW.id, 'ASSIGNMENT_CHANGE',
                CONCAT('Application assignment changed to user ID: ', COALESCE(NEW.assigned_to, 'none')), '127.0.0.1', NOW());
    END IF;
END$$
DELIMITER ;

-- Insert sample applications for testing
INSERT INTO applications (
    user_id, application_type_id, title, description, purpose, about,
    contact_person, contact_email, contact_phone, institution_name,
    status, submitted_at
) VALUES
(1, 1, 'MOU Kerjasama Pendidikan dengan Universitas Mulawarman',
 'Pengajuan MOU untuk program beasiswa mahasiswa Tana Tidung',
 'Peningkatan SDM melalui program beasiswa',
 'Program beasiswa S1 untuk 50 mahasiswa berprestasi dari Tana Tidung setiap tahunnya',
 '+62-812-3456-7890', 'admin@tanatidung.go.id', '+62-812-3456-7890', 'Pemerintah Kabupaten Tana Tidung',
 'submitted', NOW()),

(1, 2, 'PKS Pembangunan Infrastruktur Jalan dengan PT. Adhi Karya',
 'Perjanjian kerjasama pembangunan jalan penghubung antar kecamatan',
 'Peningkatan konektivitas dan aksesibilitas daerah',
 'Pembangunan jalan sepanjang 25 km dengan standar nasional termasuk jembatan dan drainase',
 '+62-812-3456-7891', 'admin@tanatidung.go.id', '+62-812-3456-7891', 'Pemerintah Kabupaten Tana Tidung',
 'in_review', NOW());

-- Migration completion log
SELECT 'Migration 007_create_applications_table.sql completed successfully' AS status;
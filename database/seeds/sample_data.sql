-- =============================================
-- SIKAP Database Seed Data
-- Sample data for development and testing
-- Author: SIKAP Development Team
-- Date: 2024-01-01
-- =============================================

-- Insert sample roles
INSERT INTO roles (name, description, permissions_json) VALUES
('admin', 'System Administrator', '["*"]'),
('reviewer', 'Application Reviewer', '["applications.view", "applications.review", "applications.approve", "documents.view"]'),
('staff', 'Government Staff', '["applications.view", "reports.generate", "documents.view"]'),
('applicant', 'External Applicant', '["applications.create", "applications.edit_own", "applications.view_own", "documents.upload"]'),
('manager', 'Department Manager', '["applications.view", "applications.assign", "reports.generate", "users.manage"]');

-- Insert sample users
INSERT INTO users (email, username, password_hash, full_name, phone, status, email_verified_at) VALUES
('admin@tanatidung.go.id', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', '+62-812-1000-0001', 'active', NOW()),
('reviewer1@tanatidung.go.id', 'reviewer1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ahmad Reviewer', '+62-812-1000-0002', 'active', NOW()),
('reviewer2@tanatidung.go.id', 'reviewer2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Siti Reviewer', '+62-812-1000-0003', 'active', NOW()),
('staff1@tanatidung.go.id', 'staff1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Budi Staff', '+62-812-1000-0004', 'active', NOW()),
('manager1@tanatidung.go.id', 'manager1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ibu Manager', '+62-812-1000-0005', 'active', NOW()),
('applicant1@external.com', 'applicant1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. External Partner', '+62-812-2000-0001', 'active', NOW()),
('university@unmul.ac.id', 'unmul', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Prof. Universitas Rep', '+62-812-2000-0002', 'active', NOW()),
('company@adhikarya.co.id', 'adhikarya', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PT Adhi Karya Rep', '+62-812-2000-0003', 'active', NOW());

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at) VALUES
(1, 1, 1, NOW()), -- Admin role
(2, 2, 1, NOW()), -- Reviewer role
(3, 2, 1, NOW()), -- Reviewer role
(4, 3, 1, NOW()), -- Staff role
(5, 5, 1, NOW()), -- Manager role
(6, 4, 1, NOW()), -- Applicant role
(7, 4, 1, NOW()), -- Applicant role
(8, 4, 1, NOW()); -- Applicant role

-- Insert cooperation categories
INSERT INTO cooperation_categories (name, description, icon, active, sort_order) VALUES
('Pendidikan', 'Kerjasama di bidang pendidikan dan pengembangan SDM', 'graduation-cap', true, 1),
('Infrastruktur', 'Kerjasama pembangunan infrastruktur dan fasilitas umum', 'building', true, 2),
('Kesehatan', 'Kerjasama di bidang kesehatan dan layanan medis', 'heart', true, 3),
('Pariwisata', 'Kerjasama pengembangan pariwisata dan budaya', 'map', true, 4),
('Teknologi', 'Kerjasama di bidang teknologi informasi dan inovasi', 'computer', true, 5),
('Lingkungan', 'Kerjasama pengelolaan lingkungan dan konservasi', 'leaf', true, 6),
('Ekonomi', 'Kerjasama pengembangan ekonomi dan investasi', 'trending-up', true, 7),
('Sosial', 'Kerjasama pemberdayaan sosial dan masyarakat', 'users', true, 8);

-- Insert institutions
INSERT INTO institutions (name, type, code, address, contact_person, phone, email, active) VALUES
('Universitas Mulawarman', 'university', 'UNMUL', 'Jl. Kuaro, Gn. Kelua, Kota Samarinda, Kalimantan Timur', 'Prof. Dr. Rektor', '+62-541-743848', 'info@unmul.ac.id', true),
('PT. Adhi Karya (Persero) Tbk', 'private_company', 'ADHI', 'Jl. Jend. Gatot Subroto Kav. 4, Jakarta Selatan', 'Direktur Regional', '+62-21-7987000', 'info@adhikarya.co.id', true),
('RSUD Tarakan', 'hospital', 'RSUD_TRK', 'Jl. Pulau Irian No.1, Tarakan, Kalimantan Utara', 'dr. Direktur', '+62-551-21118', 'info@rsudtarakan.go.id', true),
('Dinas Pariwisata Prov. Kaltara', 'government', 'DISPAR_KALTARA', 'Jl. Jend. Sudirman, Tanjung Selor, Kalimantan Utara', 'Kepala Dinas', '+62-552-21001', 'dispar@kaltaraprov.go.id', true),
('Bank Kaltara', 'financial', 'BANK_KALTARA', 'Jl. Jend. Sudirman No.8, Tanjung Selor', 'Direktur Utama', '+62-552-21234', 'info@bankkaltara.co.id', true),
('LSM Lingkungan Borneo', 'ngo', 'LSM_BORNEO', 'Jl. Mangrove Indah, Tarakan', 'Ketua Organisasi', '+62-551-31234', 'info@lsmborneo.org', true);

-- Insert application types
INSERT INTO application_types (code, name, description, required_documents_json, workflow_steps_json, active) VALUES
('mou', 'Memorandum of Understanding', 'Perjanjian tidak mengikat secara hukum yang menetapkan kerangka kerjasama',
 '[{"key":"suratPermohonan","name":"Surat Permohonan","required":true},{"key":"draftMou","name":"Draft MOU","required":true},{"key":"studiKelayakan","name":"Studi Kelayakan Kerjasama / KAK","required":true},{"key":"profilKota","name":"Profil Kota","required":true},{"key":"legalStanding","name":"Legal Standing Perusahaan","required":true}]',
 '[{"step":"document_verification","name":"Verifikasi Dokumen","assignable_roles":["reviewer"]},{"step":"legal_review","name":"Review Legal","assignable_roles":["reviewer","manager"]},{"step":"approval_pending","name":"Persetujuan Akhir","assignable_roles":["admin","manager"]}]',
 true),

('pks', 'Perjanjian Kerjasama', 'Perjanjian formal yang mengikat secara hukum dengan kewajiban dan hak yang jelas',
 '[{"key":"suratPermohonan","name":"Surat Permohonan","required":true},{"key":"draftPks","name":"Draft PKS","required":true}]',
 '[{"step":"document_verification","name":"Verifikasi Dokumen","assignable_roles":["reviewer"]},{"step":"legal_review","name":"Review Legal","assignable_roles":["reviewer","manager"]},{"step":"approval_pending","name":"Persetujuan Akhir","assignable_roles":["admin","manager"]}]',
 true),

('surat_kuasa', 'Surat Kuasa Kerjasama', 'Dokumen legal yang memberikan wewenang kepada pihak tertentu untuk mewakili Pemerintah',
 '[{"key":"suratPermohonan","name":"Surat Permohonan","required":true},{"key":"draftPks","name":"Draft PKS","required":true}]',
 '[{"step":"document_verification","name":"Verifikasi Dokumen","assignable_roles":["reviewer"]},{"step":"approval_pending","name":"Persetujuan Akhir","assignable_roles":["admin","manager"]}]',
 true),

('nota_kesepakatan', 'Nota Kesepakatan', 'Dokumen awal yang memuat kesepahaman dasar antara para pihak',
 '[{"key":"suratPermohonan","name":"Surat Permohonan","required":true},{"key":"draftPks","name":"Draft PKS","required":true}]',
 '[{"step":"document_verification","name":"Verifikasi Dokumen","assignable_roles":["reviewer"]},{"step":"approval_pending","name":"Persetujuan Akhir","assignable_roles":["admin","manager"]}]',
 true);

-- Insert sample settings
INSERT INTO settings (`key`, `value`, description, `type`) VALUES
('app_name', 'SIKAP - Sistem Kerjasama Tana Tidung', 'Application name displayed in UI', 'string'),
('app_version', '1.0.0', 'Current application version', 'string'),
('max_file_size', '5242880', 'Maximum file upload size in bytes (5MB)', 'integer'),
('allowed_file_types', 'pdf,doc,docx,jpg,jpeg,png', 'Allowed file extensions for upload', 'string'),
('email_notifications', 'true', 'Enable email notifications', 'boolean'),
('auto_assign_reviewer', 'false', 'Automatically assign applications to available reviewers', 'boolean'),
('application_deadline_days', '30', 'Default deadline for application processing (days)', 'integer'),
('dashboard_refresh_interval', '300', 'Dashboard auto-refresh interval in seconds', 'integer');

-- Insert legal documents
INSERT INTO legal_documents (title, document_number, year, category, file_path, description) VALUES
('Peraturan Daerah tentang Kerjasama Daerah', 'Perda No. 5', '2023', 'perda', '/legal/perda_05_2023.pdf', 'Peraturan Daerah yang mengatur tentang mekanisme kerjasama daerah'),
('Pedoman Teknis Kerjasama Pemerintah', 'SK Bupati No. 123', '2023', 'sk_bupati', '/legal/sk_123_2023.pdf', 'Pedoman teknis pelaksanaan kerjasama pemerintah daerah'),
('SOP Pengelolaan Dokumen Kerjasama', 'SOP/001/2023', '2023', 'sop', '/legal/sop_001_2023.pdf', 'Standard Operating Procedure untuk pengelolaan dokumen kerjasama');

-- Insert dashboard statistics (sample data)
INSERT INTO dashboard_stats (stat_key, stat_value, date) VALUES
('total_applications', '156', CURDATE()),
('applications_today', '5', CURDATE()),
('applications_pending', '23', CURDATE()),
('applications_approved', '98', CURDATE()),
('applications_rejected', '12', CURDATE()),
('active_users', '45', CURDATE()),
('documents_uploaded', '234', CURDATE()),
('avg_processing_days', '7', CURDATE());

-- Create some sample notifications
INSERT INTO notifications (user_id, title, message, type, action_url, related_id) VALUES
(2, 'Permohonan Baru', 'Ada permohonan MOU baru yang memerlukan review Anda', 'application_review', '/dashboard/applications/1', 1),
(3, 'Dokumen Diunggah', 'Dokumen baru telah diunggah untuk aplikasi PKS Infrastructure', 'document_upload', '/dashboard/applications/2', 2),
(1, 'Laporan Mingguan', 'Laporan aktivitas mingguan telah tersedia', 'report_ready', '/dashboard/reports/weekly', NULL),
(5, 'Deadline Mendekat', 'Permohonan dengan ID #3 akan mencapai deadline dalam 2 hari', 'deadline_warning', '/dashboard/applications/3', 3);

-- Sample activity logs
INSERT INTO activity_logs (user_id, entity_type, entity_id, action, description, ip_address, user_agent) VALUES
(1, 'users', 1, 'LOGIN', 'User logged in successfully', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(6, 'applications', 1, 'CREATE', 'Created new MOU application', '203.142.1.15', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
(2, 'applications', 1, 'STATUS_CHANGE', 'Changed status from draft to submitted', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(7, 'documents', 1, 'UPLOAD', 'Uploaded document: surat_permohonan.pdf', '110.139.75.22', 'Mozilla/5.0 (X11; Linux x86_64)');

SELECT 'Sample data inserted successfully!' AS status;
SELECT 'Total users created:', COUNT(*) AS count FROM users;
SELECT 'Total roles created:', COUNT(*) AS count FROM roles;
SELECT 'Total institutions created:', COUNT(*) AS count FROM institutions;
SELECT 'Total application types created:', COUNT(*) AS count FROM application_types;
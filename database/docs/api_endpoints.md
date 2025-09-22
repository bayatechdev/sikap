# 🚀 SIKAP API Endpoints Documentation

## 📊 Database Mapping untuk API Endpoints

Dokumen ini menjelaskan mapping antara database tables dengan API endpoints yang akan digunakan dalam aplikasi SIKAP.

---

## 🔐 Authentication Endpoints

### POST `/api/auth/login`
```sql
-- Database Query
SELECT u.*, r.name as role_name, r.permissions_json
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email = ? AND u.status = 'active'
```

### POST `/api/auth/register`
```sql
-- Insert new user
INSERT INTO users (email, username, password_hash, full_name, phone, status)
VALUES (?, ?, ?, ?, ?, 'pending_verification')

-- Assign default role
INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
VALUES (LAST_INSERT_ID(), 4, 1, NOW()) -- Role 4 = applicant
```

---

## 📋 Applications API

### GET `/api/applications`
**Query Parameters**: `?status=pending&type=mou&page=1&limit=10`

```sql
-- Main query with filters
SELECT a.*,
       u.full_name as submitter_name,
       at.name as type_name,
       at.code as type_code,
       i.name as institution_name,
       cc.name as category_name,
       reviewer.full_name as reviewer_name
FROM applications a
LEFT JOIN users u ON a.user_id = u.id
LEFT JOIN application_types at ON a.application_type_id = at.id
LEFT JOIN institutions i ON a.institution_id = i.id
LEFT JOIN cooperation_categories cc ON a.cooperation_category_id = cc.id
LEFT JOIN users reviewer ON a.assigned_to = reviewer.id
WHERE 1=1
  -- Dynamic filters based on query params
  AND (? IS NULL OR a.status = ?)
  AND (? IS NULL OR at.code = ?)
ORDER BY a.submitted_at DESC
LIMIT ? OFFSET ?
```

### GET `/api/applications/{id}`
```sql
-- Get application details
SELECT a.*,
       u.full_name as submitter_name, u.email as submitter_email,
       at.name as type_name, at.code as type_code,
       at.required_documents_json, at.workflow_steps_json,
       i.name as institution_name,
       cc.name as category_name,
       reviewer.full_name as reviewer_name
FROM applications a
LEFT JOIN users u ON a.user_id = u.id
LEFT JOIN application_types at ON a.application_type_id = at.id
LEFT JOIN institutions i ON a.institution_id = i.id
LEFT JOIN cooperation_categories cc ON a.cooperation_category_id = cc.id
LEFT JOIN users reviewer ON a.assigned_to = reviewer.id
WHERE a.id = ?

-- Get application documents
SELECT d.*, dr.document_name, dr.is_required
FROM documents d
LEFT JOIN document_requirements dr ON d.document_requirement_id = dr.id
WHERE d.application_id = ?

-- Get workflow history
SELECT aw.*, u.full_name as assigned_user_name
FROM application_workflows aw
LEFT JOIN users u ON aw.assigned_to = u.id
WHERE aw.application_id = ?
ORDER BY aw.created_at ASC
```

### POST `/api/applications`
```sql
-- Insert new application
INSERT INTO applications (
    user_id, application_type_id, title, description, purpose, about,
    contact_person, contact_email, contact_phone, institution_name,
    status, submitted_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())

-- Insert dynamic form data
INSERT INTO application_data (application_id, field_key, field_value, field_type)
VALUES (LAST_INSERT_ID(), ?, ?, ?)

-- Create initial workflow step
INSERT INTO application_workflows (application_id, step_name, status, created_at)
VALUES (LAST_INSERT_ID(), 'document_verification', 'pending', NOW())
```

### PUT `/api/applications/{id}/status`
```sql
-- Update application status
UPDATE applications
SET status = ?,
    reviewed_at = CASE WHEN ? IN ('approved', 'rejected') THEN NOW() ELSE reviewed_at END,
    approved_at = CASE WHEN ? = 'approved' THEN NOW() ELSE approved_at END,
    rejected_at = CASE WHEN ? = 'rejected' THEN NOW() ELSE rejected_at END,
    rejection_reason = CASE WHEN ? = 'rejected' THEN ? ELSE rejection_reason END,
    assigned_to = ?,
    updated_at = NOW()
WHERE id = ?

-- Insert approval record
INSERT INTO approvals (application_id, reviewer_id, status, comments, reviewed_at)
VALUES (?, ?, ?, ?, NOW())

-- Update workflow step
UPDATE application_workflows
SET status = 'completed', completed_at = NOW(), notes = ?
WHERE application_id = ? AND step_name = ? AND status = 'pending'
```

---

## 📎 Documents API

### POST `/api/applications/{id}/documents`
```sql
-- Insert document record
INSERT INTO documents (
    application_id, document_requirement_id, original_filename,
    stored_filename, file_path, file_size, mime_type,
    uploaded_by, document_type, uploaded_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
```

### GET `/api/documents/{id}/download`
```sql
-- Get document info for download
SELECT file_path, original_filename, mime_type, file_size
FROM documents
WHERE id = ? AND uploaded_by = ? -- Security check
```

### DELETE `/api/documents/{id}`
```sql
-- Soft delete document
UPDATE documents
SET deleted_at = NOW(), updated_at = NOW()
WHERE id = ? AND uploaded_by = ?
```

---

## 👥 Users & Roles API

### GET `/api/users`
```sql
-- Get users list with roles
SELECT u.*,
       GROUP_CONCAT(r.name) as roles,
       ur.assigned_at as role_assigned_at
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.status != 'deleted'
GROUP BY u.id
ORDER BY u.created_at DESC
```

### POST `/api/users/{id}/assign-role`
```sql
-- Assign role to user
INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
VALUES (?, ?, ?, NOW())
ON DUPLICATE KEY UPDATE
    assigned_by = VALUES(assigned_by),
    assigned_at = VALUES(assigned_at),
    expires_at = NULL
```

---

## 📊 Dashboard API

### GET `/api/dashboard/stats`
```sql
-- Get dashboard statistics
SELECT
    COUNT(*) as total_applications,
    COUNT(CASE WHEN DATE(submitted_at) = CURDATE() THEN 1 END) as today_applications,
    COUNT(CASE WHEN status = 'submitted' THEN 1 END) as pending_applications,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_applications,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_applications,
    AVG(DATEDIFF(COALESCE(approved_at, rejected_at), submitted_at)) as avg_processing_days
FROM applications
WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)

-- Get recent activities
SELECT al.*, u.full_name as user_name
FROM activity_logs al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 10

-- Get pending notifications count
SELECT COUNT(*) as unread_count
FROM notifications
WHERE user_id = ? AND read_at IS NULL
```

### GET `/api/dashboard/charts/applications-by-month`
```sql
-- Applications trend by month
SELECT
    DATE_FORMAT(submitted_at, '%Y-%m') as month,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
FROM applications
WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(submitted_at, '%Y-%m')
ORDER BY month ASC
```

### GET `/api/dashboard/charts/applications-by-type`
```sql
-- Applications by type
SELECT
    at.name as type_name,
    at.code as type_code,
    COUNT(a.id) as total,
    COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved
FROM application_types at
LEFT JOIN applications a ON at.id = a.application_type_id
    AND a.submitted_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
GROUP BY at.id, at.name, at.code
ORDER BY total DESC
```

---

## 🔔 Notifications API

### GET `/api/notifications`
```sql
-- Get user notifications
SELECT * FROM notifications
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 50
```

### PUT `/api/notifications/{id}/read`
```sql
-- Mark notification as read
UPDATE notifications
SET read_at = NOW()
WHERE id = ? AND user_id = ?
```

### POST `/api/notifications/mark-all-read`
```sql
-- Mark all notifications as read
UPDATE notifications
SET read_at = NOW()
WHERE user_id = ? AND read_at IS NULL
```

---

## 📈 Reports API

### GET `/api/reports/applications-summary`
**Query Parameters**: `?start_date=2024-01-01&end_date=2024-12-31&type=mou`

```sql
-- Applications summary report
SELECT
    at.name as application_type,
    COUNT(*) as total_applications,
    COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected,
    COUNT(CASE WHEN a.status IN ('submitted', 'in_review') THEN 1 END) as pending,
    AVG(DATEDIFF(COALESCE(a.approved_at, a.rejected_at), a.submitted_at)) as avg_processing_days
FROM applications a
JOIN application_types at ON a.application_type_id = at.id
WHERE a.submitted_at BETWEEN ? AND ?
    AND (? IS NULL OR at.code = ?)
GROUP BY at.id, at.name
ORDER BY total_applications DESC
```

### POST `/api/reports/generate`
```sql
-- Log report generation
INSERT INTO reports (generated_by, report_type, parameters_json, file_path, generated_at, expires_at)
VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))
```

---

## 🔧 Settings API

### GET `/api/settings`
```sql
-- Get all settings
SELECT `key`, `value`, description, `type`
FROM settings
ORDER BY `key`
```

### PUT `/api/settings/{key}`
```sql
-- Update setting value
UPDATE settings
SET `value` = ?, updated_at = NOW()
WHERE `key` = ?
```

---

## 🔍 Search API

### GET `/api/search/applications`
**Query Parameters**: `?q=pendidikan&status=approved&limit=20`

```sql
-- Full-text search applications
SELECT a.*,
       u.full_name as submitter_name,
       at.name as type_name,
       MATCH(a.title, a.description, a.purpose, a.about) AGAINST (? IN NATURAL LANGUAGE MODE) as relevance_score
FROM applications a
LEFT JOIN users u ON a.user_id = u.id
LEFT JOIN application_types at ON a.application_type_id = at.id
WHERE MATCH(a.title, a.description, a.purpose, a.about) AGAINST (? IN NATURAL LANGUAGE MODE)
    AND (? IS NULL OR a.status = ?)
ORDER BY relevance_score DESC, a.submitted_at DESC
LIMIT ?
```

---

## 📋 Performance Considerations

### Indexing Strategy
```sql
-- Critical indexes for API performance
CREATE INDEX idx_applications_status_submitted ON applications(status, submitted_at DESC);
CREATE INDEX idx_applications_user_status ON applications(user_id, status);
CREATE INDEX idx_applications_type_status ON applications(application_type_id, status);
CREATE INDEX idx_documents_application_user ON documents(application_id, uploaded_by);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_at, created_at DESC);
CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, created_at DESC);

-- Full-text search indexes
CREATE FULLTEXT INDEX idx_applications_search ON applications(title, description, purpose, about);
```

### Caching Strategy
- **Dashboard stats**: Cache for 5 minutes
- **Application types**: Cache for 1 hour
- **User roles**: Cache for 30 minutes
- **Settings**: Cache for 1 hour

### Query Optimization
- Use `EXPLAIN` untuk semua query kompleks
- Implement pagination untuk semua list endpoints
- Use prepared statements untuk prevent SQL injection
- Monitor slow query log untuk optimization

---

> 💡 **Tips**: Gunakan database connection pooling dan implement proper error handling untuk semua database operations.
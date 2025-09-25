/*
  Warnings:

  - You are about to drop the `application_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `application_type_id` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `application_type_id` on the `document_requirements` table. All the data in the column will be lost.
  - You are about to drop the column `file_path` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `file_path` on the `legal_documents` table. All the data in the column will be lost.
  - You are about to drop the column `file_path` on the `reports` table. All the data in the column will be lost.
  - Added the required column `cooperation_type_id` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cooperation_type_id` to the `document_requirements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relative_path` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relative_path` to the `legal_documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relative_path` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "application_types_code_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "application_types";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "cooperation_types" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "display_title" TEXT,
    "long_description" TEXT,
    "features" JSONB,
    "examples" JSONB,
    "download_info" JSONB,
    "color" TEXT,
    "icon" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "show_on_homepage" BOOLEAN NOT NULL DEFAULT true,
    "required_documents_json" JSONB NOT NULL,
    "workflow_steps_json" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "cooperations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "application_id" TEXT,
    "title" TEXT NOT NULL,
    "cooperationType" TEXT NOT NULL,
    "cooperation_type_color" TEXT NOT NULL,
    "org_unit" TEXT NOT NULL,
    "partner_institution" TEXT NOT NULL,
    "cooperation_date" DATETIME NOT NULL,
    "start_date" DATETIME,
    "end_date" DATETIME,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "objectives" TEXT,
    "scope" TEXT,
    "document_path" TEXT,
    "document_number" TEXT,
    "document_size" INTEGER,
    "document_mime_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "cooperations_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "cooperation_type_id" INTEGER NOT NULL,
    "institution_id" INTEGER,
    "cooperation_category_id" INTEGER,
    "tracking_number" TEXT NOT NULL,
    "public_token" TEXT NOT NULL,
    "is_public_submission" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "notes" TEXT,
    "contact_person" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "institution_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "submitted_at" DATETIME,
    "reviewed_at" DATETIME,
    "approved_at" DATETIME,
    "rejected_at" DATETIME,
    "due_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "assigned_to" TEXT,
    "assigned_at" DATETIME,
    "rejection_reason" TEXT,
    "revision_notes" TEXT,
    CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "applications_cooperation_type_id_fkey" FOREIGN KEY ("cooperation_type_id") REFERENCES "cooperation_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "applications_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "applications_cooperation_category_id_fkey" FOREIGN KEY ("cooperation_category_id") REFERENCES "cooperation_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "applications_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_applications" ("about", "approved_at", "assigned_at", "assigned_to", "contact_email", "contact_person", "contact_phone", "cooperation_category_id", "created_at", "description", "due_date", "id", "institution_id", "institution_name", "is_public_submission", "notes", "priority", "public_token", "purpose", "rejected_at", "rejection_reason", "reviewed_at", "revision_notes", "status", "submitted_at", "title", "tracking_number", "updated_at", "user_id") SELECT "about", "approved_at", "assigned_at", "assigned_to", "contact_email", "contact_person", "contact_phone", "cooperation_category_id", "created_at", "description", "due_date", "id", "institution_id", "institution_name", "is_public_submission", "notes", "priority", "public_token", "purpose", "rejected_at", "rejection_reason", "reviewed_at", "revision_notes", "status", "submitted_at", "title", "tracking_number", "updated_at", "user_id" FROM "applications";
DROP TABLE "applications";
ALTER TABLE "new_applications" RENAME TO "applications";
CREATE UNIQUE INDEX "applications_tracking_number_key" ON "applications"("tracking_number");
CREATE UNIQUE INDEX "applications_public_token_key" ON "applications"("public_token");
CREATE TABLE "new_document_requirements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cooperation_type_id" INTEGER NOT NULL,
    "document_name" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL,
    "allowed_formats" TEXT NOT NULL,
    "max_file_size" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "document_requirements_cooperation_type_id_fkey" FOREIGN KEY ("cooperation_type_id") REFERENCES "cooperation_types" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_document_requirements" ("allowed_formats", "created_at", "description", "document_name", "id", "is_required", "max_file_size", "updated_at") SELECT "allowed_formats", "created_at", "description", "document_name", "id", "is_required", "max_file_size", "updated_at" FROM "document_requirements";
DROP TABLE "document_requirements";
ALTER TABLE "new_document_requirements" RENAME TO "document_requirements";
CREATE TABLE "new_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "application_id" TEXT NOT NULL,
    "document_requirement_id" INTEGER,
    "original_filename" TEXT NOT NULL,
    "stored_filename" TEXT NOT NULL,
    "relative_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_hash" TEXT,
    "virus_scan_result" TEXT,
    "uploaded_by" TEXT,
    "document_type" TEXT NOT NULL,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documents_document_requirement_id_fkey" FOREIGN KEY ("document_requirement_id") REFERENCES "document_requirements" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_documents" ("application_id", "document_requirement_id", "document_type", "file_hash", "file_size", "id", "mime_type", "original_filename", "stored_filename", "uploaded_at", "uploaded_by", "virus_scan_result") SELECT "application_id", "document_requirement_id", "document_type", "file_hash", "file_size", "id", "mime_type", "original_filename", "stored_filename", "uploaded_at", "uploaded_by", "virus_scan_result" FROM "documents";
DROP TABLE "documents";
ALTER TABLE "new_documents" RENAME TO "documents";
CREATE TABLE "new_legal_documents" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "document_number" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "relative_path" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_legal_documents" ("category", "created_at", "description", "document_number", "id", "title", "updated_at", "year") SELECT "category", "created_at", "description", "document_number", "id", "title", "updated_at", "year" FROM "legal_documents";
DROP TABLE "legal_documents";
ALTER TABLE "new_legal_documents" RENAME TO "legal_documents";
CREATE UNIQUE INDEX "legal_documents_document_number_key" ON "legal_documents"("document_number");
CREATE TABLE "new_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generated_by" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "parameters_json" JSONB NOT NULL,
    "relative_path" TEXT NOT NULL,
    "generated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" DATETIME NOT NULL,
    CONSTRAINT "reports_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_reports" ("expires_at", "generated_at", "generated_by", "id", "parameters_json", "report_type") SELECT "expires_at", "generated_at", "generated_by", "id", "parameters_json", "report_type" FROM "reports";
DROP TABLE "reports";
ALTER TABLE "new_reports" RENAME TO "reports";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "cooperation_types_code_key" ON "cooperation_types"("code");

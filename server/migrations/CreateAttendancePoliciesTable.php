<?php
// server/migrations/CreateAttendancePoliciesTable.php

require_once __DIR__ . '/Migration.php';

class CreateAttendancePoliciesTable extends Migration
{
    public function up()
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS attendance_policies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            office_start_time TIME DEFAULT '09:00:00',
            office_end_time TIME DEFAULT '18:00:00',
            late_allow_minutes INT DEFAULT 15,
            grace_minutes INT DEFAULT 30,
            weekly_holidays JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            UNIQUE KEY (company_id)
        )";

        $this->db->exec($sql);
        echo "Attendance policies table created successfully.\n";
    }

    public function down()
    {
        $sql = "DROP TABLE IF EXISTS attendance_policies";
        $this->db->exec($sql);
        echo "Attendance policies table dropped successfully.\n";
    }
}

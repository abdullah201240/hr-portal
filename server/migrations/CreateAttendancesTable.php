<?php

require_once __DIR__ . '/Migration.php';

class CreateAttendancesTable extends Migration
{
    public function up()
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS attendances (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_id INT NOT NULL,
            company_id INT NOT NULL,
            date DATE NOT NULL,
            clock_in TIME,
            clock_out TIME,
            status ENUM('present', 'absent', 'late', 'half-day', 'holiday') DEFAULT 'present',
            late_minutes INT DEFAULT 0,
            overtime_minutes INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            UNIQUE KEY employee_date (employee_id, date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

        $this->db->exec($sql);
    }

    public function down()
    {
        $sql = "DROP TABLE IF EXISTS attendances";
        $this->db->exec($sql);
    }
}

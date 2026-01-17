<?php
// server/migrations/CreateLeavesTable.php

require_once __DIR__ . '/Migration.php';

class CreateLeavesTable extends Migration
{
    public function up()
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS leaves (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_id INT NOT NULL,
            company_id INT NOT NULL,
            leave_policy_id INT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            days INT NOT NULL,
            reason TEXT,
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            manager_id INT NULL,
            manager_note TEXT,
            approved_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (leave_policy_id) REFERENCES leave_policies(id) ON DELETE CASCADE,
            FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

        $this->db->exec($sql);
        echo "Leaves table created successfully.\n";
    }

    public function down()
    {
        $sql = "DROP TABLE IF EXISTS leaves";
        $this->db->exec($sql);
        echo "Leaves table dropped successfully.\n";
    }
}

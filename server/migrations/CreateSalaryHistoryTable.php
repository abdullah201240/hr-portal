<?php
// server/migrations/CreateSalaryHistoryTable.php

require_once __DIR__ . '/Migration.php';

class CreateSalaryHistoryTable extends Migration
{
    public function up()
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS salary_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_id INT NOT NULL,
            company_id INT NOT NULL,
            previous_salary DECIMAL(10, 2) NULL,
            current_salary DECIMAL(10, 2) NOT NULL,
            increment_amount DECIMAL(10, 2) NULL,
            increment_percentage DECIMAL(5, 2) NULL,
            increment_date DATE NOT NULL,
            reason TEXT NULL,
            created_by INT NULL, 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

        $this->db->exec($sql);
        echo "Salary History table created successfully.\n";
    }

    public function down()
    {
        $sql = "DROP TABLE IF EXISTS salary_history";
        $this->db->exec($sql);
        echo "Salary History table dropped successfully.\n";
    }
}

<?php
// server/migrations/CreateMonthlyPayoutsTable.php

require_once __DIR__ . '/Migration.php';

class CreateMonthlyPayoutsTable extends Migration
{
    public function up()
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS monthly_payouts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_id INT NOT NULL,
            company_id INT NOT NULL,
            month TINYINT NOT NULL,
            year INT NOT NULL,
            basic_salary DECIMAL(15, 2) NOT NULL,
            allowances DECIMAL(15, 2) DEFAULT 0.00,
            deductions DECIMAL(15, 2) DEFAULT 0.00,
            net_salary DECIMAL(15, 2) NOT NULL,
            status ENUM('pending', 'paid') DEFAULT 'pending',
            payment_date DATE NULL,
            payment_method VARCHAR(50) NULL,
            note TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_payout (employee_id, month, year),
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

        $this->db->exec($sql);
        echo "Monthly Payouts table created successfully.\n";
    }

    public function down()
    {
        $sql = "DROP TABLE IF EXISTS monthly_payouts";
        $this->db->exec($sql);
        echo "Monthly Payouts table dropped successfully.\n";
    }
}

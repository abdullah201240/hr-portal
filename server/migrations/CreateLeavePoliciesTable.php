<?php
// server/migrations/CreateLeavePoliciesTable.php

require_once __DIR__ . '/Migration.php';

class CreateLeavePoliciesTable extends Migration
{
    public function up()
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS leave_policies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            days INT NOT NULL,
            enabled BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )";

        $this->db->exec($sql);
        echo "Leave policies table created successfully.\n";
    }

    public function down()
    {
        $sql = "DROP TABLE IF EXISTS leave_policies";
        $this->db->exec($sql);
        echo "Leave policies table dropped successfully.\n";
    }
}

<?php
// server/migrations/CreateHolidaysTable.php

require_once __DIR__ . '/Migration.php';

class CreateHolidaysTable extends Migration
{
    public function up()
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS holidays (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            holiday_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            UNIQUE KEY (company_id, holiday_date)
        )";

        $this->db->exec($sql);
        echo "Holidays table created successfully.\n";
    }

    public function down()
    {
        $sql = "DROP TABLE IF EXISTS holidays";
        $this->db->exec($sql);
        echo "Holidays table dropped successfully.\n";
    }
}

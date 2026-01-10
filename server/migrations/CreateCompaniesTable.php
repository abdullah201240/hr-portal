<?php
// server/migrations/CreateCompaniesTable.php

require_once __DIR__ . '/Migration.php';

class CreateCompaniesTable extends Migration
{
    public function up()
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS companies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            address TEXT NOT NULL,
            phone VARCHAR(20),
            website VARCHAR(255),
            description TEXT,
            logo VARCHAR(255),
            established_date DATE,
            status ENUM('active', 'inactive', 'suspended') DEFAULT 'inactive',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";

        $this->db->exec($sql);
        echo "Companies table created successfully.\n";
    }

    public function down()
    {
        $sql = "DROP TABLE IF EXISTS companies";
        $this->db->exec($sql);
        echo "Companies table dropped successfully.\n";
    }
}
<?php
// server/migrations/CreateAdminsTable.php

require_once __DIR__ . '/Migration.php';

class CreateAdminsTable extends Migration
{
    public function up()
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('super_admin', 'admin') DEFAULT 'admin',
            status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
            last_login TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";

        $this->db->exec($sql);
        echo "Admins table created successfully.\n";
    }

    public function down()
    {
        $sql = "DROP TABLE IF EXISTS admins";
        $this->db->exec($sql);
        echo "Admins table dropped successfully.\n";
    }
}
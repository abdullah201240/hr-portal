<?php

require_once __DIR__ . '/Migration.php';

class CreateDepartmentsTable extends Migration
{
    public function up()
    {
        $sql = "
            CREATE TABLE IF NOT EXISTS departments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        ";
        
        $this->db->exec($sql);
    }

    public function down()
    {
        $this->db->exec("DROP TABLE IF EXISTS departments");
    }
}
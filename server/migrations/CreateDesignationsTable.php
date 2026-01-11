<?php

require_once __DIR__ . '/Migration.php';

class CreateDesignationsTable extends Migration
{
    public function up()
    {
        $sql = "
            CREATE TABLE IF NOT EXISTS designations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                department_id INT,
                description TEXT,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
            )
        ";
        
        $this->db->exec($sql);
    }

    public function down()
    {
        $this->db->exec("DROP TABLE IF EXISTS designations");
    }
}
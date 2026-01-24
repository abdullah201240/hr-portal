<?php
// server/migrations/CreateRolesTable.php

require_once __DIR__ . '/Migration.php';

class CreateRolesTable extends Migration
{
    public function up()
    {
        $sql = "
            CREATE TABLE IF NOT EXISTS roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
                UNIQUE KEY unique_company_role (company_id, name)
            )
        ";
        
        $this->db->exec($sql);
    }

    public function down()
    {
        $this->db->exec("DROP TABLE IF EXISTS roles");
    }
}
?>
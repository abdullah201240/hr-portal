<?php
// server/migrations/CreateRolePermissionsTable.php

require_once __DIR__ . '/Migration.php';

class CreateRolePermissionsTable extends Migration
{
    public function up()
    {
        $sql = "
            CREATE TABLE IF NOT EXISTS role_permissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                role_id INT NOT NULL,
                feature_key VARCHAR(100) NOT NULL,
                feature_name VARCHAR(100) NOT NULL,
                can_view BOOLEAN DEFAULT FALSE,
                can_create BOOLEAN DEFAULT FALSE,
                can_edit BOOLEAN DEFAULT FALSE,
                can_delete BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
                UNIQUE KEY unique_role_feature (role_id, feature_key)
            )
        ";
        
        $this->db->exec($sql);
    }

    public function down()
    {
        $this->db->exec("DROP TABLE IF EXISTS role_permissions");
    }
}
?>
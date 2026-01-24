<?php
// server/migrations/CreateEmployeeRolesTable.php

require_once __DIR__ . '/Migration.php';

class CreateEmployeeRolesTable extends Migration
{
    public function up()
    {
        $sql = "
            CREATE TABLE IF NOT EXISTS employee_roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id INT NOT NULL,
                role_id INT NOT NULL,
                assigned_by INT,
                assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
                FOREIGN KEY (assigned_by) REFERENCES employees(id) ON DELETE SET NULL,
                UNIQUE KEY unique_employee_role (employee_id, role_id)
            )
        ";
        
        $this->db->exec($sql);
    }

    public function down()
    {
        $this->db->exec("DROP TABLE IF EXISTS employee_roles");
    }
}
?>
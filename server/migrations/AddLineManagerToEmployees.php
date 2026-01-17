<?php

require_once __DIR__ . '/Migration.php';

class AddLineManagerToEmployees extends Migration
{
    public function up()
    {
        $sql = "ALTER TABLE employees ADD COLUMN line_manager_id INT NULL AFTER companyId;";
        $this->db->exec($sql);
        
        $sql = "ALTER TABLE employees ADD CONSTRAINT fk_line_manager FOREIGN KEY (line_manager_id) REFERENCES employees(id) ON DELETE SET NULL;";
        $this->db->exec($sql);
    }

    public function down()
    {
        $sql = "ALTER TABLE employees DROP FOREIGN KEY fk_line_manager;";
        $this->db->exec($sql);
        
        $sql = "ALTER TABLE employees DROP COLUMN line_manager_id;";
        $this->db->exec($sql);
    }
}

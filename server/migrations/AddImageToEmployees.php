<?php

require_once __DIR__ . '/Migration.php';

class AddImageToEmployees extends Migration
{
    public function up()
    {
        $sql = "ALTER TABLE employees ADD COLUMN image VARCHAR(255) DEFAULT NULL";
        $this->db->exec($sql);
    }

    public function down()
    {
        $sql = "ALTER TABLE employees DROP COLUMN image";
        $this->db->exec($sql);
    }
}
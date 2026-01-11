<?php

require_once __DIR__ . '/Migration.php';

class AddCompanyIdToDepartments extends Migration
{
    public function up()
    {
        $sql = "
            ALTER TABLE departments 
            ADD COLUMN company_id INT,
            ADD FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        ";
        
        $this->db->exec($sql);
    }

    public function down()
    {
        $this->db->exec("ALTER TABLE departments DROP FOREIGN KEY departments_ibfk_1, DROP COLUMN company_id");
    }
}
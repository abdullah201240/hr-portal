<?php

require_once __DIR__ . '/Migration.php';

class AddCompanyIdToDesignations extends Migration
{
    public function up()
    {
        $sql = "
            ALTER TABLE designations 
            ADD COLUMN company_id INT,
            ADD FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        ";
        
        $this->db->exec($sql);
    }

    public function down()
    {
        $this->db->exec("ALTER TABLE designations DROP FOREIGN KEY designations_ibfk_1, DROP COLUMN company_id");
    }
}
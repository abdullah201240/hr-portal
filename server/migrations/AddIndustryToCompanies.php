<?php
// server/migrations/AddIndustryToCompanies.php

require_once __DIR__ . '/Migration.php';

class AddIndustryToCompanies extends Migration
{
    public function up()
    {
        // Check if the industry column already exists
        $checkSql = "SHOW COLUMNS FROM companies LIKE 'industry'";
        $result = $this->db->query($checkSql);
        $columnExists = $result->fetch();
        
        if (!$columnExists) {
            $sql = "ALTER TABLE companies ADD COLUMN industry VARCHAR(255) DEFAULT NULL";
            $this->db->exec($sql);
            echo "Industry column added to companies table successfully.\n";
        } else {
            echo "Industry column already exists in companies table.\n";
        }
    }

    public function down()
    {
        $sql = "ALTER TABLE companies DROP COLUMN industry";
        $this->db->exec($sql);
        echo "Industry column removed from companies table successfully.\n";
    }
}
<?php
// server/migrations/UpdateSalaryHistoryPrecision.php

require_once __DIR__ . '/Migration.php';

class UpdateSalaryHistoryPrecision extends Migration
{
    public function up()
    {
        $sql = "ALTER TABLE salary_history MODIFY increment_percentage DECIMAL(15, 2) NULL;";
        $this->db->exec($sql);
        echo "Salary history table updated: increment_percentage precision increased.\n";
    }

    public function down()
    {
        $sql = "ALTER TABLE salary_history MODIFY increment_percentage DECIMAL(5, 2) NULL;";
        $this->db->exec($sql);
        echo "Salary history table rolled back: increment_percentage precision decreased.\n";
    }
}

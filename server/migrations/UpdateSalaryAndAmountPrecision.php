<?php
// server/migrations/UpdateSalaryAndAmountPrecision.php

require_once __DIR__ . '/Migration.php';

class UpdateSalaryAndAmountPrecision extends Migration
{
    public function up()
    {
        // Update employees table
        $sql1 = "ALTER TABLE employees MODIFY salary DECIMAL(15, 2) NULL;";
        $this->db->exec($sql1);

        // Update salary_history table
        $sql2 = "ALTER TABLE salary_history 
                MODIFY previous_salary DECIMAL(15, 2) NULL,
                MODIFY current_salary DECIMAL(15, 2) NOT NULL,
                MODIFY increment_amount DECIMAL(15, 2) NULL;";
        $this->db->exec($sql2);

        echo "Salary and amount precision increased in employees and salary_history tables.\n";
    }

    public function down()
    {
        // Rollback employees table
        $sql1 = "ALTER TABLE employees MODIFY salary DECIMAL(10, 2) NULL;";
        $this->db->exec($sql1);

        // Rollback salary_history table
        $sql2 = "ALTER TABLE salary_history 
                MODIFY previous_salary DECIMAL(10, 2) NULL,
                MODIFY current_salary DECIMAL(10, 2) NOT NULL,
                MODIFY increment_amount DECIMAL(10, 2) NULL;";
        $this->db->exec($sql2);

        echo "Salary and amount precision rolled back to default.\n";
    }
}

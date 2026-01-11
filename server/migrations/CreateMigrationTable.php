<?php
// server/migrations/CreateMigrationTable.php

require_once __DIR__ . '/Migration.php';

class CreateMigrationTable extends Migration
{
    public function up()
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            migration_name VARCHAR(255) NOT NULL UNIQUE,
            batch INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        
        $this->db->exec($sql);
        echo "Migrations table created successfully.\n";
    }

    public function down()
    {
        $sql = "DROP TABLE IF EXISTS migrations";
        $this->db->exec($sql);
        echo "Migrations table dropped successfully.\n";
    }
}
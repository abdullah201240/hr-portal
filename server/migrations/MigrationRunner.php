<?php
// server/migrations/MigrationRunner.php

require_once __DIR__ . '/CreateCompaniesTable.php';
require_once __DIR__ . '/CreateAdminsTable.php';

class MigrationRunner
{
    private $migrations = [
        'CreateCompaniesTable',
        'CreateAdminsTable'
    ];

    public function runMigrations()
    {
        echo "Running migrations...\n";
        
        foreach ($this->migrations as $migrationName) {
            $migration = new $migrationName();
            $migration->up();
        }
        
        echo "All migrations completed!\n";
    }

    public function rollbackMigrations()
    {
        echo "Rolling back migrations...\n";
        
        // Run migrations in reverse order
        $reversedMigrations = array_reverse($this->migrations);
        foreach ($reversedMigrations as $migrationName) {
            $migration = new $migrationName();
            $migration->down();
        }
        
        echo "All migrations rolled back!\n";
    }
}
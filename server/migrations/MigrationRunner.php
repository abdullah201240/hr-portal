<?php
// server/migrations/MigrationRunner.php

require_once __DIR__ . '/../database/Database.php';

class MigrationRunner
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function runMigrations($migrations)
    {
        echo "Running migrations...\n";
        
        $batch = $this->getNextBatchNumber();
        
        foreach ($migrations as $migration) {
            $migrationName = get_class($migration);
            
            if ($this->migrationHasRun($migrationName)) {
                echo "Skipping {$migrationName} (already run)\n";
                continue;
            }
            
            try {
                $migration->up();
                $this->logMigration($migrationName, $batch);
                echo "Executed {$migrationName}\n";
            } catch (Exception $e) {
                echo "Error executing {$migrationName}: " . $e->getMessage() . "\n";
                throw $e;
            }
        }
        
        echo "All migrations completed!\n";
    }

    public function rollbackMigrations()
    {
        echo "Rolling back migrations...\n";
        
        $lastBatch = $this->getLastBatchNumber();
        if ($lastBatch === 0) {
            echo "No migrations to rollback.\n";
            return;
        }
        
        $migrationsToRollback = $this->getMigrationsByBatch($lastBatch);
        
        foreach (array_reverse($migrationsToRollback) as $migrationRecord) {
            $migrationName = $migrationRecord['migration_name'];
            
            // Find and instantiate the migration class
            $migrationFile = __DIR__ . '/' . $migrationName . '.php';
            if (file_exists($migrationFile)) {
                require_once $migrationFile;
                
                $migration = new $migrationName();
                $migration->down();
                
                $this->removeMigrationLog($migrationName);
                echo "Rolled back {$migrationName}\n";
            }
        }
        
        echo "All migrations in batch {$lastBatch} rolled back!\n";
    }

    private function migrationHasRun($migrationName)
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM migrations WHERE migration_name = ?");
        $stmt->execute([$migrationName]);
        return $stmt->fetchColumn() > 0;
    }

    private function logMigration($migrationName, $batch)
    {
        $stmt = $this->db->prepare("INSERT INTO migrations (migration_name, batch) VALUES (?, ?)");
        $stmt->execute([$migrationName, $batch]);
    }

    private function removeMigrationLog($migrationName)
    {
        $stmt = $this->db->prepare("DELETE FROM migrations WHERE migration_name = ?");
        $stmt->execute([$migrationName]);
    }

    private function getNextBatchNumber()
    {
        $stmt = $this->db->prepare("SELECT COALESCE(MAX(batch), 0) + 1 FROM migrations");
        $stmt->execute();
        return $stmt->fetchColumn();
    }

    private function getLastBatchNumber()
    {
        $stmt = $this->db->prepare("SELECT COALESCE(MAX(batch), 0) FROM migrations");
        $stmt->execute();
        return $stmt->fetchColumn();
    }

    private function getMigrationsByBatch($batch)
    {
        $stmt = $this->db->prepare("SELECT * FROM migrations WHERE batch = ? ORDER BY id DESC");
        $stmt->execute([$batch]);
        return $stmt->fetchAll();
    }
}
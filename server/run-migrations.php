<?php
// server/run-migrations.php

require_once __DIR__ . '/migrations/CreateMigrationTable.php';
require_once __DIR__ . '/migrations/CreateCompaniesTable.php';
require_once __DIR__ . '/migrations/CreateAdminsTable.php';
require_once __DIR__ . '/migrations/AddIndustryToCompanies.php';
require_once __DIR__ . '/migrations/MigrationRunner.php';

// First, create the migrations table if it doesn't exist
$migrationTable = new CreateMigrationTable();
$migrationTable->up();

$migrationRunner = new MigrationRunner();

if (isset($argv[1]) && $argv[1] === 'rollback') {
    $migrationRunner->rollbackMigrations();
} else {
    $migrationRunner->runMigrations([
        new CreateCompaniesTable(),
        new CreateAdminsTable(),
        new AddIndustryToCompanies(),
    ]);
    
    // Run admin seeds after migrations
    if (isset($argv[1]) && $argv[1] === '--seed') {
        require_once __DIR__ . '/run-admin-seeds.php';
        echo "Admin seeds completed.\n";
    }
}
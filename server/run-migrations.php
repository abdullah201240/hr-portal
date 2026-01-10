<?php
// server/run-migrations.php

require_once __DIR__ . '/migrations/MigrationRunner.php';
require_once __DIR__ . '/migrations/CreateCompaniesTable.php';
require_once __DIR__ . '/migrations/CreateAdminsTable.php';

$migrationRunner = new MigrationRunner();

if (isset($argv[1]) && $argv[1] === 'rollback') {
    $migrationRunner->rollbackMigrations();
} else {
    $migrationRunner->runMigrations([
        new CreateCompaniesTable(),
        new CreateAdminsTable(),
    ]);
    
    // Run admin seeds after migrations
    if (isset($argv[1]) && $argv[1] === '--seed') {
        require_once __DIR__ . '/run-admin-seeds.php';
        echo "Admin seeds completed.\n";
    }
}
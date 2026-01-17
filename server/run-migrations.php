<?php
// server/run-migrations.php

require_once __DIR__ . '/migrations/CreateMigrationTable.php';
require_once __DIR__ . '/migrations/CreateCompaniesTable.php';
require_once __DIR__ . '/migrations/CreateAdminsTable.php';
require_once __DIR__ . '/migrations/AddIndustryToCompanies.php';
require_once __DIR__ . '/migrations/CreateDepartmentsTable.php';
require_once __DIR__ . '/migrations/CreateDesignationsTable.php';
require_once __DIR__ . '/migrations/CreateEmployeesTable.php';
require_once __DIR__ . '/migrations/AddCompanyIdToDepartments.php';
require_once __DIR__ . '/migrations/AddCompanyIdToDesignations.php';
require_once __DIR__ . '/migrations/AddImageToEmployees.php';
require_once __DIR__ . '/migrations/CreateAttendancePoliciesTable.php';
require_once __DIR__ . '/migrations/CreateHolidaysTable.php';
require_once __DIR__ . '/migrations/CreateLeavePoliciesTable.php';
require_once __DIR__ . '/migrations/CreateAttendancesTable.php';
require_once __DIR__ . '/migrations/AddLineManagerToEmployees.php';
require_once __DIR__ . '/migrations/CreateLeavesTable.php';
require_once __DIR__ . '/migrations/CreateSalaryHistoryTable.php';
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
        new CreateDepartmentsTable(),
        new CreateDesignationsTable(),
        new CreateEmployeesTable(),
        new AddCompanyIdToDepartments(),
        new AddCompanyIdToDesignations(),
        new AddImageToEmployees(),
        new CreateAttendancePoliciesTable(),
        new CreateHolidaysTable(),
        new CreateLeavePoliciesTable(),
        new CreateAttendancesTable(),
        new AddLineManagerToEmployees(),
        new CreateLeavesTable(),
        new CreateSalaryHistoryTable(),
    ]);
    
    // Run admin seeds after migrations
    if (isset($argv[1]) && $argv[1] === '--seed') {
        require_once __DIR__ . '/run-admin-seeds.php';
        echo "Admin seeds completed.\n";
    }
}
<?php
// server/migrations/Migration.php

require_once __DIR__ . '/../database/Database.php';

abstract class Migration
{
    protected $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    abstract public function up();
    abstract public function down();
}
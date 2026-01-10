<?php
// server/database/Database.php

class Database
{
    private static $instance = null;
    private $connection;

    private function __construct()
    {
        $config = require_once __DIR__ . '/../config/database.php';
        
        // Build DSN based on whether unix_socket is provided
        if (!empty($config['unix_socket'])) {
            $dsn = "mysql:unix_socket={$config['unix_socket']};dbname={$config['dbname']};charset={$config['charset']}";
        } else {
            $dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']};port={$config['port']}";
        }
        
        try {
            $this->connection = new PDO($dsn, $config['username'], $config['password']);
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this->connection;
    }

    private function __clone() {}
    public function __wakeup() {}
}
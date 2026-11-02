<?php
declare(strict_types=1);

require dirname(__DIR__).'/vendor/autoload.php';

$kernel = new App\Kernel('dev', true);
$request = Symfony\Component\HttpFoundation\Request::createFromGlobals();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);

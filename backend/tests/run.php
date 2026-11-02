<?php
declare(strict_types=1);

require dirname(__DIR__).'/vendor/autoload.php';

use App\Kernel;
use App\Service\MarketService;
use Symfony\Component\HttpFoundation\Request;

$service = new MarketService();
$count = 0;
function check(bool $condition, string $message): void {
    global $count;
    if (!$condition) throw new RuntimeException($message);
    ++$count;
    echo "OK — $message\n";
}
function buy(array $items, string $title = 'Livre', int $max = 1500, string $login = 'bob'): array {
    global $service;
    return $service->buy(['items' => $items, 'userLogin' => $login, 'itemTitle' => $title, 'maxPrice' => $max]);
}
$input = ['items' => [], 'userLogin' => 'alice', 'itemTitle' => 'Livre', 'minPrice' => 1500];
$first = $service->sell($input);
$second = $service->sell([...$input, 'items' => $first['items']]);
check(count($second['items']) === 2 && $second['items'][0]['id'] !== $second['items'][1]['id'], 'Titres dupliqués, identifiants distincts');
check(buy($first['items'])['success'], 'Achat au prix exact');
check(!buy($first['items'], 'Livre', 1499)['success'], 'Budget insuffisant');
check(!buy($first['items'], 'livre')['success'], 'Respect de la casse');
check(!buy($first['items'], 'Livre ')['success'], 'Respect des espaces');
check(!buy($first['items'], 'Autre')['success'], 'Titre absent');
check(!buy([])['success'], 'Catalogue vide');
check(!buy($first['items'], 'Livre', 2000, 'alice')['success'], 'Auto-achat refusé');
$selfPurchase = buy($first['items'], 'Livre', 2000, 'alice');
check($selfPurchase['code'] === 'SELF_PURCHASE'
    && str_contains($selfPurchase['message'], 'Vous ne pouvez pas acheter vos propres articles.'), 'Message explicite pour un auto-achat');
check(buy($first['items'], 'Livre', 1499, 'alice')['code'] === 'NO_MATCH', 'Budget insuffisant sans faux message d’auto-achat');
check(buy(buy($first['items'])['items'], 'Livre', 2000, 'alice')['code'] === 'NO_MATCH', 'Article déjà vendu sans faux message d’auto-achat');
$bought = buy($second['items']);
check($bought['item']['id'] === $first['item']['id'], 'Premier article à prix égal');
check(count(array_filter($bought['items'], fn ($item) => $item['buyerLogin'] !== null)) === 1, 'Un seul article acheté');
check(!buy(buy($first['items'])['items'])['success'], 'Article vendu indisponible');
$own = [...$first['item'], 'id' => 'own', 'sellerLogin' => 'bob', 'minPrice' => 100];
$cheap = [...$first['item'], 'id' => 'cheap', 'minPrice' => 1000];
check(buy([$own, $first['item'], $cheap])['item']['id'] === 'cheap', 'Propre article ignoré et moins cher sélectionné');
$zero = $service->sell([...$input, 'minPrice' => 0]);
check(buy($zero['items'], 'Livre', 0)['success'], 'Prix nul accepté');
$before = $first['items'];
buy($before, 'Livre', 1);
check($before === $first['items'], 'Échec sans mutation');
foreach ([-1, 1.5, '1500', null, MarketService::MAX_PRICE + 1] as $price) {
    try {
        $service->sell([...$input, 'minPrice' => $price]);
        throw new RuntimeException('Prix invalide accepté');
    } catch (InvalidArgumentException) { check(true, 'Prix invalide refusé : '.json_encode($price)); }
}
try {
    buy([$first['item'], $first['item']]);
    throw new RuntimeException('Identifiant dupliqué accepté');
} catch (InvalidArgumentException) { check(true, 'Identifiants dupliqués refusés'); }

$kernel = new Kernel('test', true);
foreach ([
    ['GET', '/api/health', '', 200],
    ['POST', '/api/sell', json_encode($input), 201],
    ['POST', '/api/buy', json_encode(['items' => [], 'userLogin' => 'bob', 'itemTitle' => 'Livre', 'maxPrice' => 1500]), 409],
    ['POST', '/api/sell', '{', 400],
    ['POST', '/api/sell', '{}', 422],
    ['POST', '/api/sell', json_encode([...$input, 'items' => new stdClass()]), 422],
] as [$method, $url, $body, $status]) {
    $request = Request::create($url, $method, [], [], [], ['CONTENT_TYPE' => 'application/json'], $body);
    $response = $kernel->handle($request);
    check($response->getStatusCode() === $status, "$method $url → $status");
    $kernel->terminate($request, $response);
}
$kernel->shutdown();
echo "\n$count vérifications réussies.\n";

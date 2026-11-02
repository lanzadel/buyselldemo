<?php
declare(strict_types=1);

namespace App\Service;

use InvalidArgumentException;

final class MarketService
{
    public const MAX_PRICE = 1_000_000_000;

    public function sell(array $input): array
    {
        [$items, $login, $title, $price] = $this->validate($input, 'minPrice');
        $ids = array_fill_keys(array_column($items, 'id'), true);
        do {
            $id = bin2hex(random_bytes(16));
        } while (isset($ids[$id]));
        $item = ['id' => $id, 'sellerLogin' => $login, 'title' => $title,
            'minPrice' => $price, 'buyerLogin' => null];
        $items[] = $item;
        return ['success' => true, 'item' => $item, 'items' => $items];
    }

    public function buy(array $input): array
    {
        [$items, $login, $title, $price] = $this->validate($input, 'maxPrice');
        $best = null;
        $ownMatch = false;
        foreach ($items as $index => $item) {
            if ($item['buyerLogin'] !== null || $item['title'] !== $title
                || $item['minPrice'] > $price) {
                continue;
            }
            if ($item['sellerLogin'] === $login) {
                $ownMatch = true;
                continue;
            }
            if ($best === null || $item['minPrice'] < $items[$best]['minPrice']) {
                $best = $index;
            }
        }
        if ($best === null) {
            if ($ownMatch) {
                return ['success' => false, 'code' => 'SELF_PURCHASE',
                    'message' => 'Vous ne pouvez pas acheter vos propres articles. Changez d’identifiant pour simuler un autre acheteur.'];
            }
            return ['success' => false, 'code' => 'NO_MATCH',
                'message' => 'Aucun article disponible ne correspond à votre demande.'];
        }
        $items[$best]['buyerLogin'] = $login;
        return ['success' => true, 'item' => $items[$best], 'items' => $items];
    }

    private function validate(array $input, string $priceField): array
    {
        $this->text($input['userLogin'] ?? null, 'userLogin', 100);
        $this->text($input['itemTitle'] ?? null, 'itemTitle', 255);
        $this->price($input[$priceField] ?? null, $priceField);
        $items = $input['items'] ?? null;
        if (!is_array($items) || !array_is_list($items)) {
            throw new InvalidArgumentException('items doit être une liste.');
        }
        $ids = [];
        foreach ($items as $item) {
            if (!is_array($item)) {
                throw new InvalidArgumentException('Article invalide.');
            }
            $this->text($item['id'] ?? null, 'id', 100);
            if (isset($ids[$item['id']])) {
                throw new InvalidArgumentException('Les identifiants des articles doivent être uniques.');
            }
            $ids[$item['id']] = true;
            $this->text($item['sellerLogin'] ?? null, 'sellerLogin', 100);
            $this->text($item['title'] ?? null, 'title', 255);
            $this->price($item['minPrice'] ?? null, 'minPrice');
            if (!array_key_exists('buyerLogin', $item)) {
                throw new InvalidArgumentException('buyerLogin est requis.');
            }
            if ($item['buyerLogin'] !== null) {
                $this->text($item['buyerLogin'], 'buyerLogin', 100);
                if ($item['buyerLogin'] === $item['sellerLogin']) {
                    throw new InvalidArgumentException('Un vendeur ne peut pas être son propre acheteur.');
                }
            }
        }
        return [$items, $input['userLogin'], $input['itemTitle'], $input[$priceField]];
    }

    private function text(mixed $value, string $field, int $max): void
    {
        if (!is_string($value) || trim($value) === '' || strlen($value) > $max) {
            throw new InvalidArgumentException("$field doit être un texte non vide de $max octets maximum.");
        }
    }

    private function price(mixed $value, string $field): void
    {
        if (!is_int($value) || $value < 0 || $value > self::MAX_PRICE) {
            throw new InvalidArgumentException("$field doit être un entier entre 0 et ".self::MAX_PRICE.' centimes.');
        }
    }
}

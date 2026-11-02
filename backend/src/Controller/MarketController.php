<?php
declare(strict_types=1);

namespace App\Controller;

use App\Service\MarketService;
use InvalidArgumentException;
use JsonException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
final class MarketController extends AbstractController
{
    public function __construct(private readonly MarketService $marketService)
    {
    }

    #[Route('/health', name: 'health', methods: ['GET'])]
    public function health(): JsonResponse
    {
        return new JsonResponse(['status' => 'ok']);
    }

    #[Route('/sell', name: 'sell', methods: ['POST'])]
    public function sell(Request $request): JsonResponse
    {
        return $this->execute($request, 'sell');
    }

    #[Route('/buy', name: 'buy', methods: ['POST'])]
    public function buy(Request $request): JsonResponse
    {
        return $this->execute($request, 'buy');
    }

    private function execute(Request $request, string $operation): JsonResponse
    {
        try {
            // Decode the root as an object to distinguish {} from [].
            $root = json_decode($request->getContent(), false, 512, JSON_THROW_ON_ERROR);
            if (!$root instanceof \stdClass || !isset($root->items) || !is_array($root->items)) {
                throw new InvalidArgumentException('Un objet JSON avec une liste items est requis.');
            }
            $input = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
            $result = $this->marketService->{$operation}($input);
            return new JsonResponse($result, $result['success'] ? ($operation === 'sell' ? 201 : 200) : 409);
        } catch (JsonException) {
            return new JsonResponse(['success' => false, 'message' => 'JSON invalide.'], 400);
        } catch (InvalidArgumentException $error) {
            return new JsonResponse(['success' => false, 'message' => $error->getMessage()], 422);
        }
    }
}

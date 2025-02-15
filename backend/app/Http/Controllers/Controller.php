<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

abstract class Controller
{
    /**
     * Success response.
     */
    protected function successResponse($data, string $message = 'Success', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    /**
     * Cursor pagination response (Best for Performance).
     */
    protected function paginatedResponse(AnonymousResourceCollection $resourceCollection, CursorPaginator $paginator): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Data retrieved successfully.',
            'data' => $resourceCollection->collection, // Extracts the items
            'pagination' => [
                'per_page' => $paginator->perPage(),
                'has_more_pages' => $paginator->hasMorePages(),
                'next_cursor' => $paginator->nextCursor()?->encode(),  // Encoded cursor for next page
                'prev_cursor' => $paginator->previousCursor()?->encode(), // Encoded cursor for previous page
            ]
        ]);
    }

    /**
     * Error response.
     */
    protected function errorResponse(string $message, int $status = 400, array $errors = []): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }
}

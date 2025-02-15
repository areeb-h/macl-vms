<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
       // Ensure the user is authenticated
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Normalize roles to lowercase for case-insensitive comparison
        $userRole = strtolower($request->user()->role);
        $allowedRoles = array_map('strtolower', $roles);

        // Check if the user's role is in the allowed roles
        if (!in_array($userRole, $allowedRoles)) {
            return response()->json(['message' => 'Forbidden. You do not have access.'], 403);
        }

        return $next($request);
    }
}

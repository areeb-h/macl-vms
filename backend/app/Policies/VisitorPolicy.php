<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Visitor;

class VisitorPolicy
{
    /**
     * Determine if a user can delete a visitor.
     */
    public function delete(User $user, Visitor $visitor): bool
    {
        return $user->role === 'admin' || ($user->role === 'staff' && $visitor->staff_id === $user->id);
    }

    /**
     * Determine if a user can create a visitor.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff']);
    }

    /**
     * Determine if a user can create a visitor.
     */
    public function update(User $user, Visitor $visitor): bool
    {
        return $user->role === 'admin' || $visitor->staff_id === $user->id;
    }

    /**
     * Determine if a user can check in a visitor.
     * - ✅ Admins can check in any visitor.
     * - ✅ Staff can check in visitors they registered.
     * - ✅ Visitors can check **themselves in** using their unique code.
     */
    public function checkIn(?User $user, Visitor $visitor): bool
    {
        // Visitors checking in themselves (unauthenticated request using unique code)
        if (!$user) {
            return true;
        }

        return $user->role === 'admin' || $visitor->staff_id === $user->id;
    }

    /**
     * Determine if a user can view any visitors.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff']);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Visitor;
use Carbon\Carbon;

class StatController extends Controller
{
    public function getStats(Request $request): JsonResponse
    {
        $today = Carbon::today();

        $stats = Visitor::selectRaw("
            COUNT(*) as total_visitors,
            SUM(CASE WHEN checked_in_at IS NOT NULL THEN 1 ELSE 0 END) as checked_in_visitors,
            SUM(CASE WHEN checked_in_at IS NULL THEN 1 ELSE 0 END) as pending_visitors,
            SUM(CASE WHEN DATE(created_at) = ? THEN 1 ELSE 0 END) as visitors_today
        ", [$today])->first();

        $visitorsByNationality = Visitor::selectRaw('nationality, COUNT(*) as count')
            ->groupBy('nationality')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_visitors' => $stats->total_visitors,
                'checked_in_visitors' => $stats->checked_in_visitors,
                'pending_visitors' => $stats->pending_visitors,
                'visitors_today' => $stats->visitors_today,
                'visitors_by_nationality' => $visitorsByNationality,
            ],
        ]);
    }
}

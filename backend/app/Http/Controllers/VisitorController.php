<?php

namespace App\Http\Controllers;

use App\Http\Requests\VisitorRequest;
use App\Http\Resources\VisitorResource;
use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class VisitorController extends Controller
{
    public function store(VisitorRequest $request)
    {
        Gate::authorize('create', Visitor::class);

        $visitor = Visitor::create([
            'staff_id' => auth()->id(),
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'purpose_of_visit' => $request->purpose_of_visit,
            'expected_check_in_date' => $request->expected_check_in_date,
            'nationality' => $request->nationality,
            'unique_code' => strtoupper(Str::random(10)),
        ]);

        return $this->successResponse(new VisitorResource($visitor), 'Visitor registered successfully.', 201);
    }

    public function update(VisitorRequest $request, Visitor $visitor)
    {
        Gate::authorize('update', $visitor);

        $visitor->update([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'purpose_of_visit' => $request->purpose_of_visit,
            'expected_check_in_date' => $request->expected_check_in_date,
            'nationality' => $request->nationality,
        ]);

        return $this->successResponse(new VisitorResource($visitor), 'Visitor updated successfully.');
    }

    public function index(Request $request)
    {
        $perPage = min(max((int) $request->query('per_page', 10), 1), 100);
        $search = $request->query('search');
        $nationality = $request->query('nationality');
        $checkedInAt = $request->query('checked_in_at');
        $checkedInStart = $request->query('checked_in_start');
        $checkedInEnd = $request->query('checked_in_end');

        $query = Visitor::query()
            ->select([
                'id', 'staff_id', 'full_name', 'email', 'phone_number',
                'purpose_of_visit', 'expected_check_in_date', 'checked_in_at',
                'nationality', 'unique_code', 'created_at'
            ])
            ->when($search, fn($query) =>
                $query->whereRaw('(full_name LIKE ? OR email LIKE ? OR phone_number LIKE ?)', 
                    ["%{$search}%", "%{$search}%", "%{$search}%"]
                )
            )
            ->when($nationality, fn($query) => $query->where('nationality', $nationality))
            ->when($checkedInAt !== null, function ($query) use ($checkedInAt) {
                if ($checkedInAt === 'null') {
                    $query->whereNull('checked_in_at');
                } else {
                    $query->whereRaw('DATE(checked_in_at) = ?', [$checkedInAt]);
                }
            })
            ->when($checkedInStart && $checkedInEnd, fn($query) =>
                $query->whereRaw('checked_in_at BETWEEN ? AND ?', [$checkedInStart, $checkedInEnd])
            )
            ->orderByDesc('created_at');

        $visitors = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Visitors retrieved successfully.',
            'data' => VisitorResource::collection($visitors)->collection,
            'pagination' => [
                'per_page' => $visitors->perPage(),
                'current_page' => $visitors->currentPage(),
                'total_pages' => $visitors->lastPage(),
                'total_items' => $visitors->total(),
                'has_more_pages' => $visitors->hasMorePages(),
                'next_page' => $visitors->nextPageUrl(),
                'prev_page' => $visitors->previousPageUrl(),
            ]
        ]);
    }

    public function checkIn(Request $request)
    {
        $request->validate(['unique_code' => 'required|string|size:10']);

        $visitor = Visitor::where('unique_code', $request->unique_code)->firstOrFail();

        Gate::authorize('checkIn', $visitor);

        if ($visitor->checked_in_at) {
            return response()->json(['message' => 'Already checked in.'], 400);
        }

        if (now()->lt($visitor->expected_check_in_date)) {
            return response()->json(['message' => 'Cannot check in before expected date.'], 400);
        }

        $visitor->update(['checked_in_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Check-in successful!',
            'data' => new VisitorResource($visitor),
        ]);
    }

    public function show($unique_code)
    {
        $visitor = Visitor::where('unique_code', $unique_code)->first();

        if (!$visitor) {
            return response()->json(['success' => false, 'message' => 'Visitor not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new VisitorResource($visitor),
        ]);
    }
    
    public function destroy(Visitor $visitor)
    {
        Gate::authorize('delete', $visitor);
        $visitor->delete();

        return response()->json(['message' => 'Visitor record deleted.']);
    }
}

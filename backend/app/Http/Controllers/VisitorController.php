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
    /**
     * Store a new visitor (Staff registers visitor)
     */
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
            'unique_code' => strtoupper(Str::random(10)), // ✅ Generate 10-char unique code
        ]);

        return $this->successResponse(new VisitorResource($visitor), 'Visitor registered successfully.', 201);
    }


/**
     * Update an existing visitor (Only staff who registered the visitor or admin can update)
     */
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
    /**
     * List visitors with optional search and filter by check-in status.
     */
    // public function index(Request $request)
    // {
    //     Gate::authorize('viewAny', Visitor::class); 

    //     $visitors = Visitor::query()
    //         ->when($request->search, fn ($query) => 
    //             $query->where('full_name', 'like', "%{$request->search}%")
    //                 ->orWhere('email', 'like', "%{$request->search}%")
    //                 ->orWhere('phone_number', 'like', "%{$request->search}%")
    //         )
    //         ->when($request->status === 'checked-in', fn ($query) => 
    //             $query->whereNotNull('checked_in_at')
    //         )
    //         ->when($request->status === 'pending', fn ($query) => 
    //             $query->whereNull('checked_in_at')
    //         )
    //         ->paginate(10);

    //     return VisitorResource::collection($visitors);
    // }

//     public function index(Request $request)
// {
//     $visitors = Visitor::query()
//         ->when($request->search, function ($query) use ($request) {
//             $query->where('full_name', 'like', "%{$request->search}%")
//                 ->orWhere('email', 'like', "%{$request->search}%")
//                 ->orWhere('phone_number', 'like', "%{$request->search}%");
//         })
//         ->orderBy('id') // Cursor pagination requires ordering
//         ->cursorPaginate(10); // Use cursor pagination

//     return response()->json([
//         'success' => true,
//         'message' => 'Visitors retrieved successfully.',
//         'data' => VisitorResource::collection($visitors),
//         'links' => [
//             'first' => $visitors->url(1),
//             'last' => $visitors->url($visitors->lastPage()),
//             'prev' => $visitors->previousPageUrl(),
//             'next' => $visitors->nextPageUrl(),
//         ],
//         'meta' => [
//             'current_page' => $visitors->currentPage(),
//             'per_page' => $visitors->perPage(),
//             'total' => $visitors->total(),
//         ]
//     ]);
// }


    /**
     * List visitors with optional search and filter by check-in status using **Cursor Pagination (Best Performance)**.
     */
    // public function index(Request $request): JsonResponse
    // {
    //     $perPage = min(max((int) $request->query('per_page', 10), 1), 100); // ✅ Prevents overload
    //     $cursor = $request->query('cursor'); // ✅ Gets cursor from query params
    //     $search = $request->query('search'); // ✅ Search query
    
    //     $visitors = Visitor::query()
    //     ->whereNotNull('created_at') // ✅ Ensure no NULL values in cursor-based pagination
    //         ->select(['id', 'staff_id', 'full_name', 'email', 'phone_number', 'purpose_of_visit', 'expected_check_in_date', 'checked_in_at', 'nationality', 'unique_code']) // ✅ Select only necessary fields for better performance
    //         ->when($request->search, fn($query) => 
    //             $query->where('full_name', 'like', "%{$request->search}%")
    //                 ->orWhere('email', 'like', "%{$request->search}%")
    //                 ->orWhere('phone_number', 'like', "%{$request->search}%")
    //         )
    //         ->orderBy('created_at', 'DESC') // ✅ Cursor pagination requires ordering
    //         ->cursorPaginate($perPage, ['*'], 'cursor', $cursor); // ✅ Cursor-based pagination
    
    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Visitors retrieved successfully.',
    //         'data' => VisitorResource::collection($visitors)->collection, // ✅ Extract only the visitor data
    //         'pagination' => [
    //             'per_page' => $perPage,
    //             'has_more_pages' => $visitors->hasMorePages(),
    //             'next_cursor' => $visitors->nextCursor()?->encode(),  
    //             'prev_cursor' => $visitors->previousCursor()?->encode(),
    //         ]
    //     ]);
    // }

    public function index(Request $request)
    {
        $perPage = min(max((int) $request->query('per_page', 10), 1), 100); // ✅ Prevent overload
        $search = $request->query('search');
        $nationality = $request->query('nationality');
        $checkedInAt = $request->query('checked_in_at'); // Can be 'null' or a date
        $checkedInStart = $request->query('checked_in_start'); // Start of range
        $checkedInEnd = $request->query('checked_in_end'); // End of range
    
//         $query = Visitor::query()
//             ->select([
//                 'id', 'staff_id', 'full_name', 'email', 'phone_number',
//                 'purpose_of_visit', 'expected_check_in_date', 'checked_in_at',
//                 'nationality', 'unique_code', 'created_at'
//             ])
//             ->when($search, fn($query) =>
//                 $query->where(function ($q) use ($search) {
//                     $q->where('full_name', 'like', "%{$search}%")
//                         ->orWhere('email', 'like', "%{$search}%")
//                         ->orWhere('phone_number', 'like', "%{$search}%");
//                 })
//             )
//             ->when($nationality, fn($query) => $query->where('nationality', $nationality))
//   ->when($checkedInAt !== null, function ($query) use ($checkedInAt) {
//         if ($checkedInAt === 'null') {
//             $query->whereNull('checked_in_at');
//         } else {
//             $query->whereDate('checked_in_at', date('Y-m-d', strtotime($checkedInAt)));
//         }
//     })            
//     ->when($checkedInAt && $checkedInAt !== 'null', fn($query) => $query->whereDate('checked_in_at', $checkedInAt)) // Filter exact date
//             ->when($checkedInStart && $checkedInEnd, fn($query) =>
//                 $query->whereBetween('checked_in_at', [$checkedInStart, $checkedInEnd]) // Date range
//             )
//             ->orderBy('created_at', 'desc'); // ✅ Ensures newest visitors show first


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
    
    /**
     * Visitor checks in using their unique code.
     */
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


    /**
     * Admin can delete a visitor
     */
    public function destroy(Visitor $visitor)
    {
        Gate::authorize('delete', $visitor); 
        $visitor->delete();

        return response()->json(['message' => 'Visitor record deleted.']);
    }
}

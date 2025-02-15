<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VisitorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'purpose_of_visit' => $this->purpose_of_visit,
            'expected_check_in_date' => $this->expected_check_in_date,
            'nationality' => $this->nationality,
            'checked_in_at' => $this->checked_in_at,
            'unique_code' => $this->unique_code,
            // 'staff' => [
            //     'id' => $this->staff->id,
            //     'name' => $this->staff->name,
            // ]
        ];
    }
}

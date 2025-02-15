<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class Visitor extends Model
{
    use HasUlids;

    protected $fillable = [
        'staff_id',
        'full_name',
        'email',
        'phone_number',
        'purpose_of_visit',
        'expected_check_in_date',
        'checked_in_at',
        'nationality',
        'unique_code',
    ];

    protected $casts = [
        'expected_check_in_date' => 'date',
    ];

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }
}

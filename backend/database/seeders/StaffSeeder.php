<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class StaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'staff@example.com'], 
            [
                'name' => 'Staff Member',
                'email' => 'staff@example.com',
                'password' => Hash::make('password123'), 
                'role' => 'staff',
            ]
        );
    }
}

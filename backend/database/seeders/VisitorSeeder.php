<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Visitor;
use App\Models\User;
use Illuminate\Support\Str;
use Carbon\Carbon;

class VisitorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $staff = User::where('role', 'staff')->first();

        if (!$staff) {
            $this->command->info("No staff found. Please run `php artisan db:seed --class=StaffSeeder` first.");
            return;
        }

       $visitors = [
            ['Alice Johnson', 'alice@example.com', '1234567890', 'Meeting', 'United States'],
            ['Carlos Rivera', 'carlos@example.com', '9876543210', 'Conference', 'Mexico'],
            ['Hiroshi Tanaka', 'hiroshi@example.com', '1112233445', 'Interview', 'Argentina'],
            ['Fatima Al-Farsi', 'fatima@example.com', '4455667788', 'Business', 'UAE'],
            ['Luís Costa', 'luis@example.com', '2233445566', 'Tour', 'Brazil'],
            ['Sophie Dubois', 'sophie@example.com', '6655443322', 'Event', 'Portugal'],
            ['Ivan Petrov', 'ivan@example.com', '9988776655', 'Meeting', 'Portugal'],
            ['Amina Yusuf', 'amina@example.com', '5566778899', 'Workshop', 'Nigeria'],
            ['Noah Williams', 'noahw@example.com', '1122334455', 'Seminar', 'South Africa'],
            ['Zhang Wei', 'zhang@example.com', '7788990011', 'Conference', 'Argentina'],
            ['Ahmed Hassan', 'ahmed@example.com', '8899001122', 'Training', 'Argentina'],
            ['Emma Scott', 'emma@example.com', '3344556677', 'Networking', 'United States'],
            ['Liam Evans', 'liam@example.com', '5566778899', 'Expo', 'United States'],
            ['Nina Kovács', 'nina@example.com', '6655443322', 'Presentation', 'Australia'],
            ['Daniel Müller', 'daniel@example.com', '9988776655', 'Trade Fair', 'Australia'],
            ['Julia Silva', 'julia@example.com', '5566778899', 'Tech Talk', 'Australia'],
            ['Samir Patel', 'samir@example.com', '7788990011', 'Product Demo', 'United States'],
            ['Elena Rossi', 'elena@example.com', '8899001122', 'Consultation', 'Portugal'],
            ['George Brown', 'george@example.com', '3344556677', 'Panel Discussion', 'Australia'],
            ['Jamal Khan', 'jamal@example.com', '5566778899', 'Roundtable', 'Pakistan'],
            ['Anna Smirnova', 'anna@example.com', '6655443322', 'Strategy Session', 'Japan'],
            ['Miguel Torres', 'miguel@example.com', '9988776655', 'Innovation Summit', 'Portugal'],
            ['Yuki Yamamoto', 'yuki@example.com', '5566778899', 'Startup Pitch', 'Japan'],
            ['Hassan Bouzid', 'hassan@example.com', '7788990011', 'Investor Meet', 'Japan'],
            ['Maria Gonzalez', 'maria@example.com', '8899001122', 'Collaboration Forum', 'Argentina'],
        ];

        foreach ($visitors as $index => $data) {
            Visitor::updateOrCreate(
                ['email' => $data[1]],
                [
                    'staff_id' => $staff->id,
                    'full_name' => $data[0],
                    'email' => $data[1],
                    'phone_number' => $data[2],
                    'purpose_of_visit' => $data[3],
                    'expected_check_in_date' => Carbon::today()->addDays(rand(0, 10)),
                    'checked_in_at' => $index % 3 === 0 ? Carbon::now()->subHours(rand(1, 5)) : null,
                    'nationality' => $data[4],
                    'unique_code' => strtoupper(Str::random(10)),
                ]
            );
        }
    }
}

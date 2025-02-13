<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('visitors', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('staff_id')->constrained('users')->onDelete('cascade');
            $table->string('full_name', 150);
            $table->string('email', 100)->nullable()->index();
            $table->string('phone_number', 20);
            $table->string('purpose_of_visit', 255);
            $table->date('expected_check_in_date')->index();
            $table->string('nationality', 50);
            $table->char('unique_code', 10)->unique(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitors');
    }
};

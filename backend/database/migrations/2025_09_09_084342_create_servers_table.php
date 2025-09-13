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
        Schema::create('servers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->index();
            $table->string('ip_address',50)->unique();
            $table->string('provider',50)->index();
            $table->enum('status', ['active', 'inactive', 'maintenance'])->index()->default('inactive');
            $table->unsignedTinyInteger('cpu_cores');
            $table->unsignedInteger('ram_mb');
            $table->unsignedInteger('storage_gb');
            $table->foreignId('user_id')->index()->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['name', 'provider']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('servers');
    }
};

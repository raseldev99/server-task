<?php
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\RegistrationController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [LoginController::class, 'login'])->name('login');
Route::post('/register', [RegistrationController::class, 'register']);

// user routes
Route::middleware(['auth:sanctum'])->group(function () {
   Route::post('/logout', [LoginController::class, 'logout']);
   Route::post('/user', [LoginController::class, 'user']);
});



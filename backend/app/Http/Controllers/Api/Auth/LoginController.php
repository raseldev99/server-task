<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthenticationService;
use App\Traits\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpFoundation\JsonResponse;

class LoginController extends Controller
{
    use ApiResponse;

    public AuthenticationService $authenticationService;

    public function __construct(AuthenticationService $authenticationService)
    {
        $this->authenticationService = $authenticationService;
    }

    /**
     * handle login request
     * @throws AuthenticationException
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->authenticationService->login($request);

        return $this->success('Login Successful', [
            'user' => new UserResource($user),
            'token' => [
                'token_type' => 'Bearer',
                'access_token' => $user->createToken('AuthToken')->plainTextToken,
            ],
        ]);
    }

    public function user(): UserResource
    {
        return new UserResource(auth()->user());
    }

    /**
     * Logout user
     * @return JsonResponse
     */
    public function logout(): JsonResponse
    {
        $user = \Auth::user();
        $user->tokens()->delete();
        return $this->success('Logout Successful');
    }
}

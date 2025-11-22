<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;

class TokenController extends Controller
{
    /**
     * Creates a new token for the user.
     */
    public function issue(LoginRequest $request ): JsonResponse
    {
        $request->validated();

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas.'],
            ]);
        }

        return response()->json([
            'token' => $user->createToken($request->device_name)->plainTextToken,
            'user' => $user
        ], 200);
    }

    /**
     * Deletes the current token for the user.
     */
    public function destroy(Request $request): JsonResponse
    {

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout realizado com sucesso (Token revogado).'], 200);
    }
}

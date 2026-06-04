<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Services\ActivityLogger;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            return response()->json(['message' => 'Email atau Password salah!'], 401);
        }

        // Blokir pengguna yang dinonaktifkan oleh administrator
        if (!$user->is_active) {
            return response()->json(['message' => 'Akun Anda telah dinonaktifkan. Hubungi administrator.'], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;

        ActivityLogger::log('LOGIN', "User {$user->email} berhasil login.", $request);

        return response()->json([
            'user' => $user->load('role', 'department'),
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Berhasil keluar sistem.']);
    }

    public function me(Request $request)
    {
        return response()->json(
            $request->user()->load('role', 'department')
        );
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password_hash)) {
            return response()->json(['message' => 'Password saat ini tidak cocok!'], 400);
        }

        $user->update([
            'password_hash' => Hash::make($request->new_password)
        ]);

        return response()->json(['message' => 'Password berhasil diperbarui!'], 200);
    }
}

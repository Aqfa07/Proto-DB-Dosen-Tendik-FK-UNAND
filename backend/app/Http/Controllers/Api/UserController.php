<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('role', 'department');

        if ($search = $request->query('search')) {
            $query->where('email', 'ILIKE', "%{$search}%");
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate($request->query('per_page', 15));

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|min:6',
            'role_id'       => 'required|exists:roles,id',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $user = User::create([
            'email'         => $request->email,
            'password_hash' => Hash::make($request->password),
            'role_id'       => $request->role_id,
            'department_id' => $request->department_id,
            'is_active'     => true,
        ]);

        ActivityLogger::log('CREATE', "Membuat user baru: {$user->email} (Role ID: {$request->role_id})", $request);

        return response()->json($user->load('role', 'department'), 201);
    }

    public function toggleActive(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Cegah admin menonaktifkan dirinya sendiri
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Anda tidak dapat menonaktifkan akun Anda sendiri.'], 403);
        }

        $user->update(['is_active' => !$user->is_active]);

        $status = $user->is_active ? 'MENGAKTIFKAN' : 'MENONAKTIFKAN';
        ActivityLogger::log(
            $user->is_active ? 'ACTIVATE' : 'DEACTIVATE',
            "{$status} akun user: {$user->email}",
            $request
        );

        return response()->json([
            'message' => "Akun {$user->email} berhasil di{$status}.",
            'user' => $user->load('role', 'department'),
        ]);
    }

    public function updateRole(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'role_id'       => 'required|exists:roles,id',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $user->update($request->only('role_id', 'department_id'));

        ActivityLogger::log('UPDATE', "Mengubah role user {$user->email} ke Role ID: {$request->role_id}", $request);

        return response()->json($user->load('role', 'department'));
    }
}

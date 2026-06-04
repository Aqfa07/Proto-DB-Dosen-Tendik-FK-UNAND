<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Department;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $roleAdmin = Role::create(['role_name' => 'admin']);
        $roleDekan = Role::create(['role_name' => 'dekan']);
        $rolePj = Role::create(['role_name' => 'pj']);

        $deptAdmin = Department::create(['name' => 'Dekanat']);
        $deptAnatomi = Department::create(['name' => 'Ilmu urai (Anatomi)']);

        User::create([
            'email' => 'admin@fk.unand.ac.id',
            'password_hash' => 'password',
            'role_id' => $roleAdmin->id,
            'department_id' => $deptAdmin->id,
        ]);

        User::create([
            'email' => 'dekan@fk.unand.ac.id',
            'password_hash' => 'password',
            'role_id' => $roleDekan->id,
            'department_id' => $deptAdmin->id,
        ]);

        User::create([
            'email' => 'pj.anatomi@fk.unand.ac.id',
            'password_hash' => 'password',
            'role_id' => $rolePj->id,
            'department_id' => $deptAnatomi->id,
        ]);
        
        $this->command->info('Database seeded successfully (password: password).');
    }
}

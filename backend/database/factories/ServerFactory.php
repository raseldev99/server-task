<?php

namespace Database\Factories;

use App\Models\Server;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Server>
 */
class ServerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->domainWord(),
            'ip_address' => $this->faker->unique()->ipv4(),
            'provider' => $this->faker->randomElement(['aws', 'digitalocean', 'vultr', 'other']),
            'status' => $this->faker->randomElement(['active', 'inactive', 'maintenance']),
            'cpu_cores' => $this->faker->numberBetween(1, 128),
            'ram_mb' => $this->faker->numberBetween(512, 1048576),
            'storage_gb' => $this->faker->numberBetween(10, 1048576),
            'user_id' => User::inRandomOrder()->first()->id,
        ];
    }
}

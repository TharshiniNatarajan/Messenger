<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $userIds = \App\Models\User::pluck('id')->toArray();
        $senderId = $this->faker->randomElement($userIds);
        $receiverId = $this->faker->randomElement(array_filter($userIds, fn($id) => $id !== $senderId));

        $groupIds = \App\Models\Group::pluck('id')->toArray();
        $groupId = $this->faker->boolean(50) && !empty($groupIds)
            ? $this->faker->randomElement($groupIds)
            : null;

        if ($groupId) {
            $group = \App\Models\Group::find($groupId);
            $senderId = $this->faker->randomElement($group->users->pluck('id')->toArray());
            $receiverId = null;
        }

        return [
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'group_id' => $groupId,
            'message' => $this->faker->realText(200),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
}

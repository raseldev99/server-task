<?php

namespace App\Http\Requests\Api\Auth;

use App\Models\User;
use Hash;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ChangePasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() instanceof User;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            "current_password" => [
                "required",
                "string",
                "min:6",
                "max:100",
                function ($attribute, $value, $fail) {
                    if (! Hash::check($value, $this->user()->password)) {
                        $fail("The current password is incorrect.");
                    }
                }
            ],
            "new_password" => "required|string|min:6|max:100|confirmed",
        ];
    }
}

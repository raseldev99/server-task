<?php

namespace App\Http\Requests\Api\Sever;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255',Rule::unique('servers', 'name')->where(function ($query) {
                $query->where('name', $this->name)->where('provider',$this->provider);
            })],
            'ip_address' => ['required', 'string', 'max:50','unique:servers,ip_address'],
            'provider' => 'required|string|in:aws,digitalocean,vultr,other',
            'status' => 'required|in:active,inactive,maintenance',
            'cpu_cores' => 'required|integer|min:1|max:128',
            'ram_mb' => 'required|integer|min:512|max:1048576',
            'storage_gb' => 'required|integer|min:10|max:1048576',
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'The server name must be unique for this provider.',
        ];
    }
}

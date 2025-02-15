<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VisitorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'full_name' => 'required|string|max:150',
            'email' => 'required|email',
            'phone_number' => 'required|string|max:20',
            'purpose_of_visit' => 'required|string|max:500',
            'expected_check_in_date' => 'required|date|after_or_equal:today',
            'nationality' => 'required|string|max:100',
        ];
    }

    /**
     * Custom validation error messages.
     */
    public function messages(): array
    {
        return [
            'expected_check_in_date.after_or_equal' => 'The check-in date cannot be in the past.',
        ];
    }
}

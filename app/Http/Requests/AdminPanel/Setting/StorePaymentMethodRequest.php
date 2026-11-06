<?php


namespace App\Http\Requests\AdminPanel\Setting;


use App\Models\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;

class StorePaymentMethodRequest extends FormRequest
{
    private $rules = [];

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */

    public function rules()
    {
        if ($this->tab == PaymentMethod::PAYPAL)
            $this->rulesPayPal();

        if ($this->tab == PaymentMethod::STRIPE)
            $this->rulesStripe();

        return $this->rules;
    }

    private function rulesPayPal()
    {
        $this->rules['paypal.name.*'] = ['required'];
  //      $this->rules['paypal.description.*'] = ['required'];

        $this->rules['paypal.config.client_id'] = ['required'];
        $this->rules['paypal.config.secret'] = ['required'];

        if ($this->paypal['sandbox_is_active']) {
            $this->rules['paypal.sandbox_config.client_id'] = ['required', 'string'];
            $this->rules['paypal.sandbox_config.secret'] = ['required', 'string'];
        }
    }

    private function rulesStripe()
    {
        $this->rules['stripe.name.*'] = ['required'];
     //   $this->rules['stripe.description.*'] = ['required'];

        $this->rules['stripe.config.key_id'] = ['required'];
        $this->rules['stripe.config.secret'] = ['required'];

        if ($this->paypal['sandbox_is_active']) {
            $this->rules['stripe.sandbox_config.key_id'] = ['required', 'string'];
            $this->rules['stripe.sandbox_config.secret'] = ['required', 'string'];
        }
    }
}

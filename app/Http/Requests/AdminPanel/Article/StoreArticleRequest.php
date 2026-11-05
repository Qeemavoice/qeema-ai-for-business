<?php


namespace App\Http\Requests\AdminPanel\Article;


use Illuminate\Foundation\Http\FormRequest;

class StoreArticleRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [];
        foreach (languages() as $key => $value) {
            $rules['title.' . $key] = ['required', 'string'];
            $rules['short_description.' . $key] = ['required', 'string'];
            $rules['a_content.' . $key] = ['required', 'string'];
            $rules['meta_description.' . $key] = ['required', 'string'];
            $rules['meta_keywords.' . $key] = ['required', 'string'];
        }
        $rules['video_url'] = ['nullable', 'url'];
        $rules['internal_image'] = ['required'];
        $rules['external_image'] = ['required'];
        return $rules;
    }

    public function attributes()
    {
        $attributes = [];
        foreach (languages() as $key => $value) {
            $attributes['title.' . $key] = $value;
            $attributes['short_description.' . $key] = $value;
            $attributes['a_content.' . $key] = $value;
            $attributes['meta_description.' . $key] = $value;
            $attributes['meta_keywords.' . $key] = $value;
        }
        return $attributes;
    }
}

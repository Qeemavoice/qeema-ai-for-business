<?php

namespace App\Http\Controllers\AdminPanel\SuccessStory;

use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\SuccessStory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class SuccessStoryController extends CoreController
{
    public function __construct(SuccessStory $story)
    {
        parent::__construct($story);
    }

    public function index()
    {
        $stories = SuccessStory::query()->orderBy('sort_order')->latest('id')->get();
        return view('admin_panel.success-stories.index', compact('stories'));
    }

    public function update(Request $request, SuccessStory $story): RedirectResponse
    {
        $data = $request->validate([
            'sort_order' => ['required', 'integer', 'min:0'],
            'is_published' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'permission_confirmed' => ['nullable', 'boolean'],
        ]);

        $story->update([
            'sort_order' => $data['sort_order'],
            'is_published' => $request->boolean('is_published'),
            'is_featured' => $request->boolean('is_featured'),
            'permission_confirmed' => $request->boolean('permission_confirmed'),
        ]);

        return back()->with('success', 'تم حفظ إعدادات القصة.');
    }

    public function import(): RedirectResponse
    {
        Artisan::call('stories:import-test');
        return back()->with('success', trim(Artisan::output()) ?: 'تم استيراد القصص.');
    }
}

<?php

namespace App\Http\Controllers\NewUi;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\NewUi\Collections;
use Illuminate\Http\Request;

/** Admin CRUD over the dashboard collections (see App\Services\NewUi\Collections for the table mapping). */
class CollectionsController extends Controller
{
    /** «إدارة المشرفين»: a supervisor must already have an account with that email; the row is bound to it. */
    private function bindAdmin(array &$body): ?string
    {
        if (!array_key_exists('email', $body)) return null;
        $u = User::whereRaw('LOWER(email) = ?', [mb_strtolower(trim((string) $body['email']))])->first();
        if (!$u) return 'لا يوجد حساب بهذا البريد. اطلب من المشرف إنشاء حساب في الموقع أولاً ثم أضفه هنا.';
        $body['userId'] = (string) $u->id;
        return null;
    }

    public function index(string $name)
    {
        if (!Collections::has($name)) return response()->json(['error' => 'المجموعة غير موجودة'], 404);
        return response()->json(['items' => Collections::list($name)]);
    }

    public function store(Request $r, string $name)
    {
        if (!Collections::has($name)) return response()->json(['error' => 'المجموعة غير موجودة'], 404);
        $body = $r->all();
        if ($name === 'admins' && ($err = $this->bindAdmin($body))) return response()->json(['error' => $err], 400);
        try {
            $item = Collections::create($name, $body);
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['error' => 'تعذر الحفظ: ' . $e->getMessage()], 500);
        }
        if (isset($item['error'])) return response()->json(['error' => $item['error']], 400);
        return response()->json(['item' => $item]);
    }

    public function update(Request $r, string $name, string $id)
    {
        if (!Collections::has($name)) return response()->json(['error' => 'المجموعة غير موجودة'], 404);
        $body = $r->all();
        if ($name === 'admins' && ($err = $this->bindAdmin($body))) return response()->json(['error' => $err], 400);
        try {
            $item = Collections::update($name, $id, $body);
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['error' => 'تعذر الحفظ: ' . $e->getMessage()], 500);
        }
        if (!$item) return response()->json(['error' => 'العنصر غير موجود'], 404);
        return response()->json(['item' => $item]);
    }

    public function destroy(string $name, string $id)
    {
        if (!Collections::has($name)) return response()->json(['error' => 'المجموعة غير موجودة'], 404);
        if (!Collections::delete($name, $id)) return response()->json(['error' => 'العنصر غير موجود'], 404);
        return response()->json(['ok' => true]);
    }
}

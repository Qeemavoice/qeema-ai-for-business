<?php

namespace App\Services\NewUi;

use App\Http\Controllers\NewUi\PublicController;
use App\Models\Article;
use App\Models\ArticleStatus;
use App\Models\Career;
use App\Models\Category;
use App\Models\Dialect;
use App\Models\Faq;
use App\Models\Guide;
use App\Models\Language;
use App\Models\MailingList;
use App\Models\MailMessage;
use App\Models\Page;
use Illuminate\Support\Str;

/**
 * The admin dashboard's collections (/api/v1/admin/collections/{name}) mapped to the old tables where one exists:
 *   articles -> articles, faqs -> faqs, guides -> guides, pages -> pages, dialects -> dialects + languages,
 *   categories -> categories, messages -> mail_messages, newsletter -> mailing_lists, jobPostings -> careers.
 * Everything else (stories, pageTexts, voiceTemplates, services, feedback, jobs, admins) lives in qv_collections.
 * Uploads arrive as data URLs from the dashboard and are written to public/uploads/<dir>/ like the old panel's files.
 */
class Collections
{
    public static function has(string $name): bool
    {
        return in_array($name, ['articles', 'faqs', 'guides', 'pages', 'dialects', 'categories', 'messages', 'newsletter', 'jobPostings',
            'stories', 'pageTexts', 'voiceTemplates', 'services', 'feedback', 'jobs', 'admins', 'humanVoices', 'playerSamples'], true);
    }

    private static function tr(string $v): array
    {
        return ['ar' => $v, 'en' => $v];
    }

    /** data URL -> file under public/uploads/{dir}; returns the file name. Plain file names / URLs are kept. */
    /** Files picked in the dashboard arrive as data: URLs; keep them as files under /uploads/qv instead of inside the record */
    private static function filesOut(array $d): array
    {
        foreach ($d as $k => $v) {
            if (is_string($v) && preg_match('#^data:(image|audio)/#', $v)) $d[$k] = '/' . DIR_UPLOAD . '/qv/' . self::upload($v, 'qv');
        }
        return $d;
    }

    public static function upload(?string $value, string $dir, ?string $current = null): ?string
    {
        if ($value === null) return $current;
        if ($value === '') return null;
        if (preg_match('#^data:([^;]+);base64,(.*)$#s', $value, $m)) {
            $ext = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp', 'image/gif' => 'gif', 'image/svg+xml' => 'svg',
                'audio/mpeg' => 'mp3', 'audio/wav' => 'wav', 'audio/x-wav' => 'wav', 'audio/mp4' => 'm4a', 'application/pdf' => 'pdf'][$m[1]] ?? 'bin';
            $name = 'qv_' . Str::random(12) . '.' . $ext;
            $path = public_path(DIR_UPLOAD . '/' . $dir);
            if (!is_dir($path)) @mkdir($path, 0775, true);
            file_put_contents($path . '/' . $name, base64_decode($m[2]));
            return $name;
        }
        return basename(parse_url($value, PHP_URL_PATH) ?: $value);
    }

    // ---------- list ----------
    public static function list(string $name): array
    {
        switch ($name) {
            case 'articles': return Article::latest()->get()->map(fn ($a) => PublicController::articleItem($a))->all();
            case 'faqs': return Faq::orderBy('sort')->orderBy('id')->get()->map(fn ($f) => PublicController::faqItem($f))->all();
            case 'guides': return Guide::latest()->get()->map(fn ($g) => PublicController::guideItem($g, true))->all();
            case 'pages': return Page::all()->map(fn ($p) => self::pageItem($p))->all();
            case 'dialects':
                $flags = Store::get('dialectFlags', []) ?: [];
                $out = [];
                foreach (Dialect::orderBy('id')->get() as $d) { $n = PublicController::tr($d, 'name'); $out[] = ['id' => 'd' . $d->id, 'name' => $n, 'flag' => (string) ($flags[$n] ?? ''), 'type' => 'لهجة']; }
                foreach (Language::orderBy('id')->get() as $l) { $n = PublicController::tr($l, 'name'); $out[] = ['id' => 'l' . $l->id, 'name' => $n, 'flag' => (string) ($flags[$n] ?? ''), 'type' => 'لغة']; }
                return $out;
            case 'categories': return Category::orderBy('id')->get()->map(fn ($c) => ['id' => (string) $c->id, 'name' => PublicController::tr($c, 'name'), 'status' => 'active'])->all();
            case 'messages': return MailMessage::latest()->get()->map(fn ($m) => self::messageItem($m))->all();
            case 'newsletter': return MailingList::latest()->get()->map(fn ($m) => ['id' => (string) $m->id, 'email' => $m->email, 'date' => Store::day(Store::created($m))])->all();
            case 'jobPostings': return Career::latest()->get()->map(fn ($c) => self::careerItem($c))->all();
            case 'humanVoices': return self::libraryVoices();
            default: return Store::list($name);
        }
    }

    // ---------- humanVoices: the library voices of the old `voices` table (admin «الأصوات») ----------
    private const NARRATOR_SAMPLE_MSG = 'هذه العينة من لوحة المعلق: عدّلها من «المعلقون الصوتيون ← أصواته في المكتبة».';

    private static function libraryVoices(): array
    {
        $pct = Plans::commissionPercent();
        $out = array_map(fn ($v) => self::voiceAdminItem($v, 'active'), Library::all());
        // hidden ones (taken out of the library from here) stay listed so they can be shown again
        foreach (\App\Models\Voice::with(['voiceOver', 'dialect', 'language', 'categories.category'])->where('voice_status_id', \App\Models\VoiceStatus::DRAFT)
            ->whereNotNull('voiceover_id')->latest('id')->get() as $v) {
            $out[] = self::voiceAdminItem(Library::fromVoice($v, $pct), 'hidden');
        }
        return $out;
    }

    private static function voiceAdminItem(array $v, string $status): array
    {
        return ['id' => $v['id'], 'sampleName' => $v['sampleName'], 'talentName' => $v['talentName'], 'gender' => $v['gender'], 'subtitle' => $v['subtitle'],
            'categories' => $v['categories'], 'languages' => array_values(array_filter([$v['language']])), 'dialect' => $v['dialect'], 'accent' => $v['accent'], 'flag' => '',
            'narratorPriceUsd' => $v['narratorPriceUsd'], 'previewUrl' => $v['previewUrl'], 'fileName' => $v['_audioFile'] ?? '',
            'metaTitle' => $v['metaTitle'], 'metaDescription' => $v['metaDescription'], 'status' => $status, 'createdAt' => $v['createdAt'],
            'source' => ($v['_voiceRowId'] ?? 0) ? 'library' : 'narrator'];
    }

    /** A library voice's audio must be a real MP3 (browsers play it everywhere): checked by its bytes, not its name */
    private static function mp3Error(string $audio): ?string
    {
        if (!preg_match('#^data:audio/(mpeg|mp3);base64,(.*)$#s', $audio, $m)) return 'ارفع الملف الصوتي بصيغة MP3';
        if (strlen($audio) > 7 * 1024 * 1024) return 'حجم الملف الصوتي أكبر من 5 ميجابايت';
        $head = base64_decode(substr($m[2], 0, 16), true);
        $mp3 = $head !== false && (str_starts_with($head, 'ID3') || (strlen($head) > 1 && ord($head[0]) === 0xFF && (ord($head[1]) & 0xE0) === 0xE0));
        return $mp3 ? null : 'الملف ليس MP3 فعلياً (ربما ملف بصيغة أخرى غُيّر اسمه): صدّره بصيغة MP3 وارفعه من جديد';
    }

    private static function updateVoice(string $id, array $d): ?array
    {
        if (!ctype_digit($id)) return ['error' => self::NARRATOR_SAMPLE_MSG];
        $v = \App\Models\Voice::find((int) $id);
        if (!$v) return null;
        if (array_key_exists('sampleName', $d)) $v->setTranslations('title', self::tr(trim((string) $d['sampleName'])));
        if (array_key_exists('metaTitle', $d)) $v->setTranslations('meta_title', self::tr((string) $d['metaTitle']));
        if (array_key_exists('metaDescription', $d)) $v->setTranslations('meta_description', self::tr((string) $d['metaDescription']));
        if (array_key_exists('narratorPriceUsd', $d)) {
            $price = (float) $d['narratorPriceUsd'];
            if ($price < 0 || $price > 1000) return ['error' => 'سعر الدقيقة يجب أن يكون بين 0 و 1000 دولار'];
            $v->price_per_minute = $price;
            $v->total_price = $price;   // the model's mutator adds the platform commission
        }
        if (array_key_exists('gender', $d)) $v->voice_type_id = $d['gender'] === 'female' ? \App\Models\VoiceType::VOICE_TYPE_WOMEN : \App\Models\VoiceType::VOICE_TYPE_MAN;
        if (!empty($d['dialect'])) {
            $dl = Dialect::all()->first(fn ($x) => PublicController::tr($x, 'name') === $d['dialect']);
            if ($dl) $v->dialect_id = $dl->id;
        }
        if (!empty($d['previewUrl']) && str_starts_with((string) $d['previewUrl'], 'data:')) {
            // a new file replaces the voice's audio; the page (id, address, texts, counts) stays. The old file stays on disk.
            if ($err = self::mp3Error((string) $d['previewUrl'])) return ['error' => $err];
            $v->audio_file = self::upload((string) $d['previewUrl'], \App\Models\Voice::DIR_VOICES_UPLOADS, $v->audio_file);
        }
        if (array_key_exists('categories', $d) && is_array($d['categories'])) {
            $byName = Category::all()->keyBy(fn ($c) => PublicController::tr($c, 'name'));
            $ids = collect($d['categories'])->map(fn ($n) => optional($byName->get(trim((string) $n)))->id)->filter()->unique()->values()->all();
            if (!$ids) return ['error' => 'اختر تصنيفاً واحداً على الأقل من التصنيفات الموجودة'];
            \App\Models\VoiceCategory::sync($ids, $v->id);   // the old site's own helper: replaces the voice's rows in voice_categories
        }
        if (array_key_exists('status', $d)) $v->voice_status_id = $d['status'] === 'hidden' ? \App\Models\VoiceStatus::DRAFT : \App\Models\VoiceStatus::ACCEPTED;
        $v->save();
        Library::forget();
        $v = $v->fresh(['voiceOver', 'dialect', 'language', 'categories.category']);
        return self::voiceAdminItem(Library::fromVoice($v, Plans::commissionPercent()), (int) $v->voice_status_id === \App\Models\VoiceStatus::ACCEPTED ? 'active' : 'hidden');
    }

    /** «إضافة صوت» from the admin dashboard: a library voice of the chosen narrator (old `voices` table, voiceover_id = the
     *  narrator's account). It is in the library at once and in the narrator's dashboard under «أصواتي في مكتبة الأصوات». */
    private static function createVoice(array $d): array
    {
        if (!preg_match('/^narrator_u(\d+)$/', (string) ($d['narratorId'] ?? ''), $m) || !\App\Models\User::find((int) $m[1])) {
            return ['error' => 'اختر المعلق من القائمة (المعلقون الذين لهم حساب في الموقع)'];
        }
        $title = trim((string) ($d['sampleName'] ?? ''));
        if ($title === '') return ['error' => 'اكتب عنوان الصوت'];
        if ($err = self::mp3Error((string) ($d['previewUrl'] ?? ''))) return ['error' => $err];
        $price = (float) ($d['narratorPriceUsd'] ?? 0);
        if (!($price > 0 && $price <= 1000)) return ['error' => 'سعر الدقيقة يجب أن يكون بين 1 و 1000 دولار'];
        $cats = Category::all()->keyBy(fn ($c) => PublicController::tr($c, 'name'));
        if (!collect((array) ($d['categories'] ?? []))->first(fn ($n) => $cats->has(trim((string) $n)))) return ['error' => 'اختر تصنيفاً واحداً على الأقل من التصنيفات الموجودة'];

        $v = new \App\Models\Voice();
        $v->forceFill([
            'title' => self::tr($title), 'price_per_minute' => $price, 'total_price' => $price,   // the model's mutator adds the platform commission
            'voiceover_id' => (int) $m[1], 'is_sample' => YES, 'voice_status_id' => \App\Models\VoiceStatus::ACCEPTED,
            'number_of_orders' => 0, 'number_of_listened' => 0, 'number_of_likes' => 0,
            'meta_title' => self::tr(''), 'meta_description' => self::tr(''),
        ]);
        $lang = trim((string) (($d['languages'] ?? [])[0] ?? 'العربية'));
        $l = Language::all()->first(fn ($x) => in_array($lang, [PublicController::tr($x, 'name'), 'اللغة ' . PublicController::tr($x, 'name')], true) || PublicController::tr($x, 'name') === 'اللغة ' . $lang);
        if ($l) $v->language_id = $l->id;
        $v->save();
        // the rest (gender, dialect, categories, the MP3 file, meta texts) through the same path as an edit
        $out = self::updateVoice((string) $v->id, $d);
        if (!$out || isset($out['error'])) { $v->forceDelete(); Library::forget(); return $out ?: ['error' => 'تعذر حفظ الصوت']; }
        Store::audit('admin', 'admin', 'VOICE_ADDED: ' . $v->id . ' -> narrator_u' . $m[1]);
        return $out;
    }

    private static function pageItem(Page $p): array
    {
        $key = array_search($p->slug, PublicController::PAGE_KEYS, true) ?: $p->slug;
        return ['id' => $key, 'key' => $key, 'slug' => $p->slug, 'title' => PublicController::tr($p, 'title'), 'intro' => '', 'content' => PublicController::tr($p, 'content'),
            'status' => 'published', 'updatedAt' => Store::iso(Store::created($p, 'updated_at'))];
    }

    private static function messageItem(MailMessage $m): array
    {
        return ['id' => 'messages-' . $m->id, 'name' => (string) $m->full_name, 'email' => (string) $m->from, 'subject' => (string) ($m->subject ?: 'استفسار عام'),
            'message' => (string) $m->content, 'status' => $m->qv_status ?: 'unread', 'date' => Store::day(Store::created($m))];
    }

    private static function careerItem(Career $c): array
    {
        return ['id' => (string) $c->id, 'title' => PublicController::tr($c, 'title'), 'jobTitle' => PublicController::tr($c, 'job_title'), 'experience' => PublicController::tr($c, 'experience'),
            'responsibilities' => PublicController::tr($c, 'responsibilities'), 'tasks' => PublicController::tr($c, 'tasks'), 'salaryFrom' => (float) $c->min_salary, 'salaryTo' => (float) $c->max_salary,
            'workMode' => (string) $c->workplace_type, 'workType' => (string) $c->type, 'coverImage' => $c->external_image ? (string) $c->external_image_url : '',
            'innerImage' => $c->interior_image ? (string) $c->interior_image_url : '', 'status' => (int) $c->status === YES ? 'published' : 'draft',
            'date' => Store::day(Store::created($c))];
    }

    // ---------- create / update ----------
    public static function create(string $name, array $d): array
    {
        switch ($name) {
            case 'humanVoices': return self::createVoice($d);
            case 'articles':
                $a = new Article();
                $a->forceFill(self::articleCols($d, null))->save();
                return PublicController::articleItem($a->fresh());
            case 'faqs':
                $f = new Faq();
                $f->forceFill(['title' => self::tr($d['question'] ?? ''), 'details' => self::tr($d['answer'] ?? ''), 'faq_status' => ($d['status'] ?? 'published') === 'published' ? YES : NO, 'sort' => (int) (Faq::max('sort') ?? 0) + 1])->save();
                return PublicController::faqItem($f);
            case 'guides':
                $g = new Guide();
                $g->forceFill(self::guideCols($d, null))->save();
                return PublicController::guideItem($g->fresh(), true);
            case 'pages':
                return self::update('pages', (string) ($d['id'] ?? $d['key'] ?? ''), $d) ?: ['error' => 'الصفحة غير موجودة'];
            case 'dialects':
                $flagsAll = Store::get('dialectFlags', []) ?: [];
                $n = trim((string) ($d['name'] ?? ''));
                if (!empty($d['flag'])) { $flagsAll[$n] = $d['flag']; Store::set('dialectFlags', $flagsAll); }
                if (($d['type'] ?? 'لهجة') === 'لغة') {
                    $l = new Language(); $l->forceFill(['name' => self::tr($n)])->save();
                    return ['id' => 'l' . $l->id, 'name' => $n, 'flag' => (string) ($d['flag'] ?? ''), 'type' => 'لغة'];
                }
                $lang = Language::orderBy('id')->first();
                $x = new Dialect(); $x->forceFill(['name' => self::tr($n), 'language_id' => $lang ? $lang->id : 1])->save();
                return ['id' => 'd' . $x->id, 'name' => $n, 'flag' => (string) ($d['flag'] ?? ''), 'type' => 'لهجة'];
            case 'categories':
                $c = new Category(); $c->forceFill(['name' => self::tr(trim((string) ($d['name'] ?? '')))])->save();
                return ['id' => (string) $c->id, 'name' => PublicController::tr($c, 'name'), 'status' => 'active'];
            case 'messages':
                return self::messageItem(MailMessage::find((int) substr(PublicController::storeMessage((string) ($d['name'] ?? ''), (string) ($d['email'] ?? ''), (string) ($d['subject'] ?? ''), (string) ($d['message'] ?? '')), 9)));
            case 'newsletter':
                $m = MailingList::firstOrCreate(['email' => mb_strtolower(trim((string) ($d['email'] ?? '')))]);
                return ['id' => (string) $m->id, 'email' => $m->email, 'date' => Store::day(Store::created($m))];
            case 'jobPostings':
                $c = new Career(); $c->forceFill(self::careerCols($d, null))->save();
                return self::careerItem($c->fresh());
            case 'admins':
                return Store::create('admins', $d);
            default:
                return Store::create($name, self::filesOut($d));
        }
    }

    public static function update(string $name, string $id, array $d): ?array
    {
        switch ($name) {
            case 'humanVoices': return self::updateVoice($id, $d);
            case 'articles':
                $a = Article::find((int) $id); if (!$a) return null;
                $a->forceFill(self::articleCols($d, $a))->save();
                return PublicController::articleItem($a->fresh());
            case 'faqs':
                $f = Faq::find((int) $id); if (!$f) return null;
                $cols = [];
                if (isset($d['question'])) $cols['title'] = self::tr($d['question']);
                if (isset($d['answer'])) $cols['details'] = self::tr($d['answer']);
                if (isset($d['status'])) $cols['faq_status'] = $d['status'] === 'published' ? YES : NO;
                $f->forceFill($cols)->save();
                return PublicController::faqItem($f);
            case 'guides':
                $g = Guide::find((int) $id); if (!$g) return null;
                $g->forceFill(self::guideCols($d, $g))->save();
                return PublicController::guideItem($g->fresh(), true);
            case 'pages':
                $slug = PublicController::PAGE_KEYS[$id] ?? $id;
                $p = Page::where('slug', $slug)->first(); if (!$p) return null;
                $cols = [];
                if (isset($d['title'])) $cols['title'] = self::tr($d['title']);
                if (isset($d['content'])) $cols['content'] = self::tr($d['content']);
                $p->forceFill($cols)->save();
                return self::pageItem($p->fresh());
            case 'dialects':
                $flagsAll = Store::get('dialectFlags', []) ?: [];
                $model = $id[0] === 'l' ? Language::find((int) substr($id, 1)) : Dialect::find((int) substr($id, 1));
                if (!$model) return null;
                $old = PublicController::tr($model, 'name');
                $n = trim((string) ($d['name'] ?? $old));
                if (isset($d['name'])) $model->forceFill(['name' => self::tr($n)])->save();
                if (array_key_exists('flag', $d)) { unset($flagsAll[$old]); $flagsAll[$n] = (string) $d['flag']; Store::set('dialectFlags', $flagsAll); }
                return ['id' => $id, 'name' => $n, 'flag' => (string) ($flagsAll[$n] ?? ''), 'type' => $id[0] === 'l' ? 'لغة' : 'لهجة'];
            case 'categories':
                $c = Category::find((int) $id); if (!$c) return null;
                if (isset($d['name'])) $c->forceFill(['name' => self::tr(trim((string) $d['name']))])->save();
                return ['id' => (string) $c->id, 'name' => PublicController::tr($c, 'name'), 'status' => 'active'];
            case 'messages':
                $m = MailMessage::find((int) str_replace('messages-', '', $id)); if (!$m) return null;
                if (isset($d['status'])) { $m->qv_status = $d['status']; $m->save(); }
                return self::messageItem($m);
            case 'newsletter':
                $m = MailingList::find((int) $id); if (!$m) return null;
                if (isset($d['email'])) { $m->email = mb_strtolower(trim((string) $d['email'])); $m->save(); }
                return ['id' => (string) $m->id, 'email' => $m->email, 'date' => Store::day(Store::created($m))];
            case 'jobPostings':
                $c = Career::find((int) $id); if (!$c) return null;
                $c->forceFill(self::careerCols($d, $c))->save();
                return self::careerItem($c->fresh());
            default:
                return Store::update($name, $id, self::filesOut($d));
        }
    }

    public static function delete(string $name, string $id): bool
    {
        switch ($name) {
            // a library voice is never erased from here: it is hidden (status draft) and can be shown again
            case 'humanVoices': return ctype_digit($id) && (bool) self::updateVoice($id, ['status' => 'hidden']);
            case 'articles': return (bool) optional(Article::find((int) $id))->delete();
            case 'faqs': return (bool) optional(Faq::find((int) $id))->delete();
            case 'guides': return (bool) optional(Guide::find((int) $id))->delete();
            case 'pages': return false;
            case 'dialects': return (bool) optional($id[0] === 'l' ? Language::find((int) substr($id, 1)) : Dialect::find((int) substr($id, 1)))->delete();
            case 'categories': return (bool) optional(Category::find((int) $id))->delete();
            case 'messages': return (bool) optional(MailMessage::find((int) str_replace('messages-', '', $id)))->delete();
            case 'newsletter': return (bool) optional(MailingList::find((int) $id))->delete();
            case 'jobPostings': return (bool) optional(Career::find((int) $id))->delete();
            default: return Store::remove($name, $id);
        }
    }

    // ---------- column mappers ----------
    private static function articleCols(array $d, ?Article $cur): array
    {
        $c = [];
        if (isset($d['title'])) $c['title'] = self::tr((string) $d['title']);
        if (isset($d['shortDescription'])) $c['short_description'] = self::tr((string) $d['shortDescription']);
        if (isset($d['content'])) $c['content'] = self::tr((string) $d['content']);
        if (isset($d['metaDescription'])) $c['meta_description'] = self::tr((string) $d['metaDescription']);
        if (isset($d['keywords'])) $c['meta_keywords'] = self::tr((string) $d['keywords']);
        if (isset($d['videoUrl'])) $c['video_url'] = (string) $d['videoUrl'];
        if (isset($d['status'])) $c['status'] = $d['status'] === 'published' ? ArticleStatus::PUBLISHED : ArticleStatus::DRAFT;
        if (array_key_exists('coverImage', $d)) $c['external_image'] = self::upload($d['coverImage'], Article::DIR_ARTICLES_UPLOADS, $cur->external_image ?? null);
        if (array_key_exists('innerImage', $d)) $c['internal_image'] = self::upload($d['innerImage'], Article::DIR_ARTICLES_UPLOADS, $cur->internal_image ?? null);
        if (!$cur) $c = array_merge(['status' => ArticleStatus::DRAFT, 'read_count' => 0, 'short_description' => self::tr(''), 'content' => self::tr(''), 'meta_description' => self::tr(''), 'meta_keywords' => self::tr('')], $c);
        return $c;
    }

    private static function guideCols(array $d, ?Guide $cur): array
    {
        $c = [];
        if (isset($d['title'])) $c['name'] = self::tr((string) $d['title']);
        if (isset($d['description'])) $c['details'] = self::tr((string) $d['description']);
        if (isset($d['type'])) $c['type'] = $d['type'] === 'paid' ? Guide::TYPE_PAID : Guide::TYPE_FREE;
        if (isset($d['price'])) $c['unit_price'] = (float) $d['price'];
        if (array_key_exists('cover', $d)) $c['image'] = self::upload($d['cover'], Guide::DIR_GUIDE_UPLOADS, $cur->image ?? null);
        if (array_key_exists('file', $d)) $c['file'] = self::upload($d['file'], Guide::DIR_GUIDE_UPLOADS, $cur->file ?? null);
        if (!$cur) $c = array_merge(['type' => Guide::TYPE_FREE, 'unit_price' => 0, 'evaluation_rate' => 0, 'number_of_likes' => 0, 'number_of_comments' => 0, 'number_of_downloads' => 0, 'details' => self::tr('')], $c);
        return $c;
    }

    private static function careerCols(array $d, ?Career $cur): array
    {
        $c = [];
        foreach (['title' => 'title', 'jobTitle' => 'job_title', 'experience' => 'experience', 'responsibilities' => 'responsibilities', 'tasks' => 'tasks'] as $k => $col) {
            if (isset($d[$k])) $c[$col] = self::tr((string) $d[$k]);
        }
        if (isset($d['salaryFrom'])) $c['min_salary'] = (float) $d['salaryFrom'];
        if (isset($d['salaryTo'])) $c['max_salary'] = (float) $d['salaryTo'];
        if (isset($d['workMode'])) $c['workplace_type'] = (string) $d['workMode'];
        if (isset($d['workType'])) $c['type'] = (string) $d['workType'];
        if (isset($d['status'])) $c['status'] = $d['status'] === 'published' ? YES : NO;
        if (array_key_exists('coverImage', $d)) $c['external_image'] = self::upload($d['coverImage'], Career::DIR_JOBS_UPLOADS, $cur->external_image ?? null);
        if (array_key_exists('innerImage', $d)) $c['interior_image'] = self::upload($d['innerImage'], Career::DIR_JOBS_UPLOADS, $cur->interior_image ?? null);
        if (!$cur) $c = array_merge(['status' => NO, 'job_title' => self::tr(''), 'experience' => self::tr(''), 'responsibilities' => self::tr(''), 'tasks' => self::tr('')], $c);
        return $c;
    }
}

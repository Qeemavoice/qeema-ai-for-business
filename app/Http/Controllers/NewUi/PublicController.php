<?php

namespace App\Http\Controllers\NewUi;

use App\Http\Controllers\Controller;
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
use App\Models\Voice;
use App\Services\NewUi\Bookings;
use App\Services\NewUi\Library;
use App\Services\NewUi\Plans;
use App\Services\NewUi\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Public data of the new site, read from the old tables where they exist
 * (articles, guides, faqs, pages, careers, categories, dialects, mail_messages, mailing_lists, voices)
 * and from qv_collections for the rest (stories, page texts, voice templates, services).
 */
class PublicController extends Controller
{
    public const PAGE_KEYS = ['privacy' => Page::PRIVACY_POLICY, 'terms' => Page::TERMS_OF_USE, 'about' => Page::ABOUT_US];

    /** translated value of a spatie/translatable field (Arabic first) */
    public static function tr($model, string $field): string
    {
        if (!$model) return '';
        try { $v = $model->getTranslation($field, 'ar', false) ?: $model->getTranslation($field, 'en', false); } catch (\Throwable $e) { $v = $model->{$field} ?? ''; }
        if (!$v) {
            $raw = $model->getAttributes()[$field] ?? '';
            $d = is_string($raw) ? json_decode($raw, true) : null;
            $v = is_array($d) ? (reset($d) ?: '') : (string) $raw;
        }
        return (string) $v;
    }

    /** Same slug the React blog builds for dashboard articles (old URLs still match by the id prefix) */
    public static function articleSlug(Article $a): string
    {
        return $a->id . '-' . preg_replace('/[\s\/\\\\?#%]+/u', '-', trim(self::tr($a, 'title')));
    }

    /** Old booking-page slug ({id}-{title}), kept identical for SEO; the React page matches it by the id prefix */
    public static function voiceSlug(Voice $v): string
    {
        // the clip name only: a title that carries the narrator's name is left out (site rule)
        $actor = $v->voiceOver;
        $clip = \App\Services\NewUi\Library::safeClip(self::tr($v, 'title'), $actor ? \App\Services\NewUi\Accounts::name($actor) : '', '');
        return slugify($v->id . ($clip !== 'عينة صوتية' ? ' ' . $clip : ''));
    }

    public static function articleItem(Article $a): array
    {
        return [
            'id' => (string) $a->id, 'title' => self::tr($a, 'title'), 'shortDescription' => self::tr($a, 'short_description'), 'content' => self::tr($a, 'content'),
            'metaDescription' => self::tr($a, 'meta_description'), 'keywords' => self::tr($a, 'meta_keywords'), 'videoUrl' => (string) $a->video_url,
            'date' => Store::day(Store::created($a)), 'views' => (int) $a->read_count, 'category' => '', 'audience' => '',
            'coverImage' => $a->external_image ? (string) $a->external_image_url : '', 'innerImage' => $a->internal_image ? (string) $a->internal_image_url : '',
            'status' => (int) $a->status === ArticleStatus::PUBLISHED ? 'published' : 'draft',
        ];
    }

    public function articles()
    {
        $items = Article::where('status', ArticleStatus::PUBLISHED)->whereNotIn('id', array_keys(config('seo.duplicate_article_redirects', [])))->latest()->get()->map(fn ($a) => self::articleItem($a))
            ->filter(fn ($i) => $i['title'] !== '' && trim(strip_tags($i['content'])) !== '')->values()->all();
        return response()->json(['items' => $items]);
    }

    public static function guideItem(Guide $g, bool $admin = false): array
    {
        $paid = (int) $g->type === Guide::TYPE_PAID;
        return [
            'id' => (string) $g->id, 'slug' => slugify($g->id . ' ' . self::tr($g, 'name')), 'title' => self::tr($g, 'name'), 'description' => self::tr($g, 'details'),
            'cover' => $g->image ? (string) $g->image_url : '', // the file itself is handed out by guides/{id}/file (sign-in for free guides, purchase for paid ones)
            'file' => $admin && $g->file ? (string) $g->file_url : '', 'hasFile' => (bool) $g->file, 'fileName' => $admin ? (string) $g->file : '',
            'type' => $paid ? 'paid' : 'free', 'price' => (float) $g->unit_price, 'status' => 'published', 'link' => '',
            'likes' => (int) $g->number_of_likes, 'comments' => (int) $g->number_of_comments, 'downloads' => (int) $g->number_of_downloads,
            'createdAt' => Store::iso(Store::created($g, 'created_at')),
        ];
    }

    public function guides()
    {
        return response()->json(['items' => Guide::latest()->get()->map(fn ($g) => self::guideItem($g))->all()]);
    }

    public static function faqItem(Faq $f): array
    {
        return ['id' => (string) $f->id, 'question' => self::tr($f, 'title'), 'answer' => self::tr($f, 'details'),
            'status' => $f->faq_status === null || (int) $f->faq_status === YES ? 'published' : 'draft'];
    }

    public function faqs()
    {
        $items = Faq::orderBy('sort')->orderBy('id')->get()->map(fn ($f) => self::faqItem($f))->filter(fn ($i) => $i['status'] === 'published')->values()->all();
        return response()->json(['items' => $items]);
    }

    public function jobs()
    {
        return response()->json(['items' => Career::where('status', YES)->oldest()->get()->map(fn ($c) => ['id' => (string) $c->id, 'title' => self::tr($c, 'title')])->all()]);
    }

    public function stories()
    {
        $items = array_values(array_filter(Store::list('stories'), fn ($s) => ($s['status'] ?? '') === 'published'));
        foreach ($items as &$s) unset($s['website']); // for the dashboard only: never sent to visitors
        unset($s);
        return response()->json(['items' => $items]);
    }

    public function page(string $key)
    {
        $slug = self::PAGE_KEYS[$key] ?? $key;
        $p = Page::where('slug', $slug)->first();
        // no CMS row (e.g. «من نحن» on a fresh database): the page keeps its built-in text, so this is not an error
        if (!$p) return response()->json(['page' => null]);
        return response()->json(['page' => ['id' => $key, 'slug' => $slug, 'title' => self::tr($p, 'title'), 'intro' => '', 'content' => self::tr($p, 'content'),
            'status' => 'published', 'updatedAt' => Store::iso(Store::created($p, 'updated_at'))]]);
    }

    public function pageTexts()
    {
        return response()->json(['items' => Store::list('pageTexts')]);
    }

    public static function dialectList(): array
    {
        $flags = Store::get('dialectFlags', []) ?: [];
        $out = [];
        foreach (Dialect::orderBy('id')->get() as $d) { $n = self::tr($d, 'name'); if ($n !== '') $out[] = ['key' => $n, 'flag' => (string) ($flags[$n] ?? ''), 'type' => 'لهجة']; }
        foreach (Language::orderBy('id')->get() as $l) { $n = self::tr($l, 'name'); if ($n !== '') $out[] = ['key' => $n, 'flag' => (string) ($flags[$n] ?? ''), 'type' => 'لغة']; }
        return $out;
    }

    public function siteLists()
    {
        $services = array_values(array_filter(Store::list('services'), fn ($s) => empty($s['status']) || $s['status'] === 'active'));
        return response()->json([
            'services' => array_map(fn ($s) => ['title' => $s['title'] ?? '', 'slug' => $s['slug'] ?? ''], $services),
            'dialects' => self::dialectList(),
            'categories' => array_values(array_filter(Category::orderBy('id')->get()->map(fn ($c) => self::tr($c, 'name'))->all(), fn ($n) => $n !== '')),
        ]);
    }

    public function siteStatus()
    {
        return response()->json(['maintenance' => (bool) (Store::settings()['maintenanceMode'] ?? false),
            'commissionPercent' => \App\Services\NewUi\Plans::commissionPercent(),
            // «روّاد قيمة»: credits, plans and TTS open to everyone at this moment (config/rowad.php)
            'publicLaunchAt' => \App\Services\RowadService::at('public_launch_at')->toIso8601String()]);
    }

    public function voiceTemplates()
    {
        $items = array_values(array_filter(Store::list('voiceTemplates'), fn ($t) => ($t['status'] ?? '') === 'published'));
        usort($items, fn ($a, $b) => ((int) ($a['order'] ?? 999)) <=> ((int) ($b['order'] ?? 999)));
        return response()->json(['items' => $items]);
    }

    /** «أصوات المشغّل»: the samples of the home page player, from the dashboard (empty = the site's built-in list) */
    public function playerSamples()
    {
        $items = array_values(array_filter(Store::list('playerSamples'), fn ($t) => ($t['status'] ?? '') === 'published' && !empty($t['audioUrl'])));
        usort($items, fn ($a, $b) => ((int) ($a['order'] ?? 999)) <=> ((int) ($b['order'] ?? 999)));
        return response()->json(['items' => $items]);
    }

    public function humanVoices()
    {
        return response()->json(['commissionPercent' => Plans::commissionPercent(), 'items' => Library::publicItems()]);
    }

    public function voiceReviews(string $id)
    {
        $reviews = [];
        foreach (DB::table('qv_booking_meta')->where('sample_id', $id)->whereNotNull('review')->get() as $m) {
            $r = json_decode($m->review, true);
            if (($r['status'] ?? '') === 'approved') $reviews[] = ['rating' => (int) $r['rating'], 'createdAt' => $r['createdAt']];
        }
        usort($reviews, fn ($a, $b) => strcmp($b['createdAt'], $a['createdAt']));
        $avg = $reviews ? round(array_sum(array_column($reviews, 'rating')) / count($reviews), 1) : 0;
        return response()->json(['reviews' => $reviews, 'average' => $avg, 'count' => count($reviews)]);
    }

    // ---------- forms ----------
    /** A message for the admin team, stored where the old contact form stores them (mail_messages) */
    public static function storeMessage(string $name, string $email, string $subject, string $message, string $phone = ''): string
    {
        $to = '';
        try { $to = (string) (getMailConfig()['from']['address'] ?? ''); } catch (\Throwable $e) {}
        $m = MailMessage::create(['to' => $to, 'from' => $email, 'full_name' => mb_substr($name, 0, 190), 'mobile' => mb_substr($phone, 0, 40),
            'subject' => mb_substr($subject, 0, 190), 'content' => $message, 'qv_status' => 'unread']);
        return 'messages-' . $m->id;
    }

    private const SERVICE_LABELS = ['voice-over' => 'تعليق صوتي', 'ivr' => 'رد آلي IVR', 'dubbing' => 'دوبلاج', 'podcast' => 'بودكاست', 'audiobook' => 'كتب صوتية',
        'demo' => 'طلب عرض توضيحي للشركات', 'project' => 'طلب مشروع صوتي', 'other' => 'أخرى'];

    public function contact(Request $r)
    {
        $t = fn ($k, $max) => mb_substr(trim((string) $r->input($k, '')), 0, $max);
        $name = $t('name', 100); $email = $t('email', 120); $message = $t('message', 3000);
        if (!$name || !preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $email) || mb_strlen($message) < 3) return response()->json(['error' => 'يرجى إدخال الاسم والبريد الإلكتروني والرسالة'], 400);
        $service = $t('serviceType', 40);
        $extra = array_filter([$t('company', 100) ? 'الشركة: ' . $t('company', 100) : '', $t('phone', 40) ? 'الهاتف: ' . $t('phone', 40) : '']);
        $id = self::storeMessage($name, $email, self::SERVICE_LABELS[$service] ?? ($service ?: 'استفسار عام'), $extra ? $message . "\n\n" . implode(' • ', $extra) : $message, $t('phone', 40));
        return response()->json(['success' => true, 'id' => $id]);
    }

    /** «انضم كمعلق صوتي» (/ar/jobs) -> admin «الوظائف» (طلبات التقديم) */
    public function join(Request $r)
    {
        $t = fn ($k, $max) => mb_substr(trim((string) $r->input($k, '')), 0, $max);
        $name = $t('name', 100); $email = $t('email', 120);
        if (!$name || !preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $email)) return response()->json(['error' => 'يرجى إدخال الاسم والبريد الإلكتروني'], 400);
        $item = Store::create('jobs', ['name' => $name, 'email' => $email, 'phone' => $t('phone', 40), 'country' => $t('country', 60), 'jobTitle' => 'انضمام كمعلق صوتي',
            'experienceYears' => (int) $r->input('experienceYears', 0), 'coverLetter' => $t('coverLetter', 3000), 'portfolio' => $t('portfolio', 300),
            'cvUrl' => (string) $r->input('cvUrl', ''), 'cvName' => $t('cvName', 120), 'status' => 'new', 'date' => date('Y-m-d')]);
        return response()->json(['success' => true, 'id' => $item['id']]);
    }

    public function newsletter(Request $r)
    {
        $email = mb_strtolower(mb_substr(trim((string) $r->input('email', '')), 0, 120));
        if (!preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $email)) return response()->json(['error' => 'أدخل بريداً إلكترونياً صحيحاً'], 400);
        // a welcome e-mail goes out once, on the first subscription of the address
        if (!MailingList::where('email', $email)->exists()) {
            MailingList::create(['email' => $email]);
            \App\Services\NewUi\Mailer::trySend($email, 'أهلاً بك في نشرة قيمة فويس',
                "شكراً لاشتراكك في النشرة البريدية لمنصة قيمة فويس.\n\n"
                . "ستصلك أحدث عينات التعليق الصوتي والعروض والمقالات الجديدة.\n\n"
                . "تصفح مكتبة الأصوات: " . url('/ar/voices') . "\n\n"
                . "إذا لم تطلب هذا الاشتراك، يمكنك تجاهل هذه الرسالة أو مراسلتنا على info@qeemavoice.com لإلغائه.\n\nفريق Qeemavoice");
        }
        return response()->json(['success' => true]);
    }
}

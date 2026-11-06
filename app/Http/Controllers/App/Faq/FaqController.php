<?php


namespace App\Http\Controllers\App\Faq;


use App\Http\Controllers\App\CoreController;
use App\Models\Banner;
use App\Models\Faq;

class FaqController extends CoreController
{
    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'faqs';
    }

    public function index($slug = null)
    {
        $canonicalSlug = config('slugroute.slug_faq');

        if ($slug !== $canonicalSlug) {
            return redirect()->to(route_app('faq.index', ['slug' => $canonicalSlug]), 301);
        }

        $pageTitle = trans_app('faqs');
        meta_data(
            $pageTitle,
            null,
            ['' => $pageTitle],
            'إجابات واضحة عن حجز المعلقين الصوتيين، الأسعار، مدة التنفيذ، جودة الملفات، التعديلات وآلية العمل في منصة قيمة فويس.'
        );

        meta('canonical', route_app('faq.index', ['slug' => config('slugroute.slug_faq')]));
        $banner = get_banner(Banner::$FAQs);

        $faqs = Faq::getFaqs();
        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact('pageTitle','faqs','banner')
        );
    }
}

<?php


namespace App\Http\Controllers\App;


use App\Models\Banner;
use App\Models\Faq;

class BookingStepController extends CoreController
{
    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'booking-steps';
    }

    public function index($slug = null)
    {
        $canonicalSlug = config('slugroute.slug_booking_steps');

        if ($slug !== $canonicalSlug) {
            return redirect()->to(route_app('bookingStep.index', ['slug' => $canonicalSlug]), 301);
        }

        meta_data(
            trans_app('book_a_voiceover_for_your_project'),
            trans_app('book_the_sound'),
            ['#' => trans_app('book_the_sound')],
            'تعرف على خطوات حجز معلق صوتي احترافي في قيمة فويس، من اختيار الصوت المناسب وحتى إرسال السيناريو وإتمام الطلب.'
        );

        meta('canonical', route_app('bookingStep.index', ['slug' => config('slugroute.slug_booking_steps')]));
        $banner = get_banner(Banner::$BOOKING_STEPS);
        $faqs = Faq::getFaqs(8);
        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',compact('faqs','banner'));
    }
}

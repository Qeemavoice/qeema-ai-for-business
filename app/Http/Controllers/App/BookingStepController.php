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

    public function index()
    {
        meta_data(trans_app('book_a_voiceover_for_your_project'),trans_app('book_the_sound'),[
            '#' => trans_app('book_the_sound'),
        ]);
        $banner = get_banner(Banner::$BOOKING_STEPS);
        $faqs = Faq::getFaqs(8);
        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',compact('faqs','banner'));
    }
}

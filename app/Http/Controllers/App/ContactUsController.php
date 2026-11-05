<?php


namespace App\Http\Controllers\App;


use App\Http\Requests\App\ContactUs\StoreContactUsRequest;
use App\Models\Banner;
use App\Models\MailMessage;

class ContactUsController extends CoreController
{
    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'contact-us';
    }

    public function index()
    {
        meta_data(trans_app('contact_us_for_the_best_services'),trans_app('contact_us'),[
            '#' => trans_app('contact_us')
        ]);
        $banner = get_banner(Banner::$CONTACT_US);

        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',compact('banner'));
    }

    public function store(StoreContactUsRequest $request)
    {
        return $this->successResponse(MailMessage::create([
            'to' => getMailConfig()['from']['address'],
            'from' => $request->email,
            'full_name' => $request->name,
            'mobile' => $request->mobile,
            'content' => $request->message,
        ]));
    }
}

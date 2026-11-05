<?php


namespace App\Http\Controllers\AdminPanel\BookingStep;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\BookingStep\StoreBookingStepRequest;
use App\Http\Resources\AdminPanel\BookingStep\BookingStepsResource;
use App\Models\BookingStep;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class BookingStepController extends CoreController
{
    use BookingStepTrait;

    public function __construct(BookingStep $model)
    {
        $this->dirView = 'booking-steps';
        $this->asRoute = 'bookingStep';
        $this->route = 'booking-steps';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($model);
    }

    public function index()
    {
        $pageTitle = trans_admin('booking_steps');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_booking_step');

        meta_data(trans_admin('booking_steps'), trans_admin('booking_steps'), [
            $this->routeUrl => trans_admin('booking_steps'),
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create',
            compact('pageTitle', 'asRoute')
        );
    }

    public function edit($id)
    {
        $step = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_booking_step');

        meta_data(trans_admin('booking_steps'), trans_admin('booking_steps'), [
            $this->routeUrl => trans_admin('booking_steps'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create',
            compact('pageTitle', 'step')
        );
    }


    public function data(Request $request)
    {
        $rows = new $this->model();

        $rows = $this->filter($request, $rows);

        $rows = $this->sort($request, $rows);

        $rows = $rows->paginate(ADMIN_PER_PAGE);

        $data = BookingStepsResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta
        ]);
    }

    public function store(StoreBookingStepRequest $request)
    {
        $id = $request->id;

        if ($id) {
            $store = $this->model::find($id);
        } else {
            $store = new $this->model;
        }

        $store->title = $request->title;
        $store->image = $request->image;
        $store->alt = $request->alt;
        $store->save();

        Cache::forget('bookingSteps');

        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        $delete = $this->model::findOrFail($id)->delete();
        Cache::forget('bookingSteps');
        return $this->deleteResponse($delete);
    }
}

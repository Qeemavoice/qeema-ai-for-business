<?php


namespace App\Http\Controllers\AdminPanel\Category;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\Category;

class CategoryDetailsController extends CoreController
{

    public function __construct(Category $category)
    {
        $this->dirView = 'categories';
        $this->asRoute = 'category';
        $this->route = 'categories';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($category);
    }

    public function index()
    {
        $pageTitle = trans_admin('categories');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.details', compact('pageTitle', 'asRoute'));
    }

}

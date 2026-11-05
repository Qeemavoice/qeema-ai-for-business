<?php


namespace App\Http\Controllers\AdminPanel\Dashboard;



use App\Http\Controllers\AdminPanel\CoreController;

class DashboardController extends CoreController
{
    public function __construct()
    {
        $this->dirView = 'dashboard';
        $this->asRoute = 'dashboard';
        $this->route = 'dashboard';
    }

    public function index()
    {
        $pageTitle = trans_admin('dashboard');

        meta_data('', $pageTitle);

        return view('admin_panel.dashboard.index');
    }
}

<?php

namespace App\Console;

use App\Console\Commands\ReleaseHoldPayment;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{

    protected $commands = [
        ReleaseHoldPayment::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('holdPayment:release');
        // «روّاد قيمة»: lapsed TTS credits + expiry reminders (needs the `schedule:run` cron on the server)
        $schedule->job(new \App\Jobs\ExpireTtsCredits)->dailyAt('03:00')->timezone(config('rowad.timezone', 'Africa/Cairo'));
        // $schedule->command('inspire')->hourly();
       // $schedule->command('websockets:clean')->weekly();

    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}

<?php

namespace App\Console\Commands;


use App\Jobs\ReleaseHoldPaymentJob;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;


class ReleaseHoldPayment extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holdPayment:release';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Release Hold Payment from system to Wallet Voice Actor';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {

        Log::info("ReleaseHoldPaymentJob1 is working fine! ...." . Carbon::now()->toDateString());
        ReleaseHoldPaymentJob::dispatch();

        $this->info('release hold profits:release Cummand Run successfully!');
    }
}

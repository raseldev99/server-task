<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ServerService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponse;
    public function __construct(
        public ServerService $serverService
    )
    {

    }

    public function stats()
    {
        $statistics = $this->serverService->getServerStatistics();

        return $this->success(data:$statistics);
    }
}

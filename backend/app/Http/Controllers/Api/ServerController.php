<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Sever\StoreRequest;
use App\Http\Requests\Api\Sever\UpdateRequest;
use App\Http\Resources\ServerResource;
use App\Models\Server;
use App\Services\ServerService;
use App\Traits\ApiResponse;
use Cache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServerController extends Controller
{
    use ApiResponse;
    public function __construct(
        public ServerService $serverService,
    )
    {

    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request)
    {
        $servers = $this->serverService->getServers($request);

        return $this->paginated(ServerResource::collection($servers));
    }

    /**
     * @param StoreRequest $request
     * @return JsonResponse
     */
    public function store(StoreRequest $request)
    {
        $server = $this->serverService->storeServer($request);
        return $this->created(data: ServerResource::make($server));
    }

    /**
     * @param Server $server
     * @return JsonResponse
     */
    public function show(Server $server)
    {
        return $this->success(data: ServerResource::make($server->load('user')));
    }

    /**
     * @param UpdateRequest $request
     * @param Server $server
     * @return JsonResponse
     */
    public function update(UpdateRequest $request, Server $server){
        $server = $this->serverService->updateServer($request, $server);
        return $this->success('Server updated successfully.',ServerResource::make($server));
    }

    /**
     * @param Server $server
     * @return JsonResponse
     */
    public function destroy(Server $server){
        $this->serverService->deleteServer($server);
        return $this->noContent('Server deleted successfully.');
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
        ]);
        $this->serverService->bulkDeleteServer($request->ids);

        return $this->noContent();
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function bulkStatusUpdate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'status' => 'required|string|in:active,inactive,maintenance',
        ]);
        $this->serverService->bulkStatusUpdate($request->ids, $request->status);

        return $this->ok('Servers status updated successfully.');
    }
}

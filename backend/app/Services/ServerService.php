<?php

namespace App\Services;

use App\Http\Requests\Api\Sever\StoreRequest;
use App\Http\Requests\Api\Sever\UpdateRequest;
use App\Models\Server;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;


class ServerService
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        public Server $model,
    )
    {
        //
    }

    public function getServers(Request $request): \Illuminate\Pagination\LengthAwarePaginator|array|\LaravelIdea\Helper\App\Models\_IH_Server_C
    {
        $query = Server::query();

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        // Filter by provider
        if ($request->filled('provider')) {
            $query->where('provider', $request->provider);
        }

        //Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        //filter by min and max value of cpu
        if ($request->filled('min_cpu')) {
            $query->where('cpu_cores', '>=', $request->min_cpu);
        }
        if ($request->filled('max_cpu')) {
            $query->where('cpu_cores', '<=', $request->max_cpu);
        }

        //Filter by min and max value of ram
        if ($request->filled('min_ram')) {
            $query->where('ram_mb', '>=', $request->min_ram);
        }
        if ($request->filled('max_ram')) {
            $query->where('ram_mb', '<=', $request->max_ram);
        }

        //Sorting
        $sortField = $request->get('sort_field', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSorts = ['name', 'provider', 'status', 'cpu_cores', 'ram_mb', 'storage_gb', 'created_at'];
        if (!in_array($sortField, $allowedSorts)) {
            $sortField = 'created_at';
        }
        $query->orderBy($sortField, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 10);
        return $query->paginate($perPage);
    }

    /**
     * @param StoreRequest $request
     * @return Server
     */
    public function storeServer(StoreRequest $request): Server
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        //store server data
        return $this->model->create($data);
    }

    /**
     * @param UpdateRequest $request
     * @param Server $server
     * @return Server
     */
    public function updateServer(UpdateRequest $request, Server $server): Server
    {
        //update server data
        $server->update($request->validated());
        //return updated value
        return $server->refresh();
    }

    /**
     * @param array $ids
     * @return bool
     */
    public function bulkDeleteServer(array $ids): bool
    {
        return $this->model->whereIn('id', $ids)->delete();
    }

    /**
     * @param array $ids
     * @param string $status
     * @return bool
     */
    public function bulkStatusUpdate(array $ids,string $status): bool
    {
        return $this->model->whereIn('id', $ids)->update(['status' => $status]);
    }

    /**
     * Get overall server statistics
     */
    public function getServerStatistics(): array
    {
        $total = Server::count();
        $active = Server::where('status', 'active')->count();
        $inactive = Server::where('status', 'inactive')->count();
        $maintenance = Server::where('status', 'maintenance')->count();

        return [
            'total' => $total,
            'active' => $active,
            'inactive' => $inactive,
            'maintenance' => $maintenance,
            'active_percentage' => $total > 0 ? round(($active / $total) * 100, 2) : 0,
            'inactive_percentage' => $total > 0 ? round(($inactive / $total) * 100, 2) : 0,
            'maintenance_percentage' => $total > 0 ? round(($maintenance / $total) * 100, 2) : 0,
        ];
    }

    public function lastYearOverView(): array
    {
        $lastYear = Carbon::now()->subYear();

        $data = Server::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as total')
        )
            ->where('created_at', '>=', $lastYear)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Prepare full 12 months dataset (fill missing months with 0)
        $months = collect(range(1, 12))->map(function ($m) use ($data) {
            $record = $data->firstWhere('month', $m);
            return [
                'month' => $m,
                'total' => $record ? $record->total : 0,
            ];
        });

        return [
            'labels' => $months->map(fn($m) => Carbon::create()->month($m['month'])->format('M')),
            'data'   => $months->pluck('total'),
        ];
    }
}

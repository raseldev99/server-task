<?php

namespace App\Services;

use App\Http\Requests\Api\Sever\StoreRequest;
use App\Http\Requests\Api\Sever\UpdateRequest;
use App\Models\Server;
use Cache;
use Carbon\Carbon;
use DB;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Throwable;


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

    public function getServers(Request $request): \Illuminate\Pagination\LengthAwarePaginator|array
    {
        $perPage = (int) $request->get('per_page', 10);
        $page = (int) $request->get('page', 1);


        // Generate a unique cache key based on request parameters
        $cacheKey = 'servers_' . md5(json_encode([
                'search'     => $request->get('search'),
                'provider'   => $request->get('provider'),
                'status'     => $request->get('status'),
                'min_cpu'    => $request->get('min_cpu'),
                'max_cpu'    => $request->get('max_cpu'),
                'min_ram'    => $request->get('min_ram'),
                'max_ram'    => $request->get('max_ram'),
                'sort_field' => $request->get('sort_field', 'created_at'),
                'sort_order' => $request->get('sort_order', 'desc'),
                'per_page'   => $perPage,
                'page'       => $page,
            ]));

        // Cache for 60 seconds
        return Cache::remember($cacheKey, 60, function () use ($request, $perPage,$cacheKey) {
            $keys = Cache::get('servers_cache_keys', []);
            if (!in_array($cacheKey, $keys)) {
                $keys[] = $cacheKey;
                Cache::forever('servers_cache_keys', $keys);
            }

            $query = Server::query();

            // Search
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%");
                });
            }

            // Provider filter
            if ($request->filled('provider')) {
                $query->where('provider', $request->provider);
            }

            // Status filter
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // CPU filter
            if ($request->filled('min_cpu')) {
                $query->where('cpu_cores', '>=', $request->min_cpu);
            }
            if ($request->filled('max_cpu')) {
                $query->where('cpu_cores', '<=', $request->max_cpu);
            }

            // RAM filter
            if ($request->filled('min_ram')) {
                $query->where('ram_mb', '>=', $request->min_ram);
            }
            if ($request->filled('max_ram')) {
                $query->where('ram_mb', '<=', $request->max_ram);
            }

            // Sorting
            $sortField = $request->get('sort_field', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $allowedSorts = ['name', 'provider', 'status', 'cpu_cores', 'ram_mb', 'storage_gb', 'created_at'];
            if (!in_array($sortField, $allowedSorts)) {
                $sortField = 'created_at';
            }
            $query->orderBy($sortField, $sortOrder);

            return $query->paginate($perPage);
        });
    }

    /**
     * @param StoreRequest $request
     * @return Server
     * @throws Throwable
     */
    public function storeServer(StoreRequest $request): Server
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        //store server data and prevent Duplicate insert data
       return DB::transaction(function () use ($data) {
            try {
                $server = $this->model->create($data);
                //clear cache
                $this->clearCache();
                return $server;
            } catch (QueryException $e) {
                if ($e->getCode() === '23000') {
                    throw new \Exception("Duplicate IP detected. Please use a unique IP address.");
                }
                throw $e;
            }
        });


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

        //clear cache
        $this->clearCache();
        //return updated value
        return $server->refresh();
    }

    public function deleteServer(Server $server): void
    {
        $server->delete();
        //clear cache
        $this->clearCache();
    }

    /**
     * @param array $ids
     * @return bool
     */
    public function bulkDeleteServer(array $ids): bool
    {
        //clear cache
        $this->clearCache();
        return $this->model->whereIn('id', $ids)->delete();
    }

    /**
     * @param array $ids
     * @param string $status
     * @return bool
     */
    public function bulkStatusUpdate(array $ids,string $status): bool
    {
        //clear cache
        $this->clearCache();
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

    private function clearCache(): void
    {
        $keys = Cache::get('servers_cache_keys', []);
        foreach ($keys as $key) {
            Cache::forget($key);
        }
        Cache::forget('servers_cache_keys');
    }
}

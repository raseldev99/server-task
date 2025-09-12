export const STATUSES = ['active', 'inactive', 'maintenance'];
export const PROVIDERS = ['aws', 'digitalocean', 'vultr', 'other'];

export const DEFAULT_SERVER = {
    name: '',
    ip_address: '',
    provider: '',
    status: 'inactive',
    cpu_cores: 1,
    ram_mb: 512,
    storage_gb: 10
};

export const STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Maintenance', value: 'maintenance' }
];

export const PROVIDER_OPTIONS = [
    { label: 'Amazon Web Services', value: 'aws' },
    { label: 'DigitalOcean', value: 'digitalocean' },
    { label: 'Vultr', value: 'vultr' },
    { label: 'Other', value: 'other' }
];

export const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

export const GLOBAL_FILTER_FIELDS = ['name', 'ip_address', 'cpu_cores', 'provider', 'status'];

export const STATUS_SEVERITY_MAP = {
    active: 'success',
    inactive: 'secondary',
    maintenance: 'warn'
};

export const PROVIDER_SEVERITY_MAP = {
    aws: 'info',
    digitalocean: 'primary',
    vultr: 'secondary',
    other: 'contrast'
};
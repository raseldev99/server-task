import * as yup from 'yup';
import { PROVIDERS, STATUSES } from '@/constants/server';

export const serverValidationSchema = yup.object({
    name: yup.string()
        .required('Server name is required')
        .min(3, 'Server name must be at least 3 characters')
        .max(100, 'Server name must not exceed 100 characters'),

    ip_address: yup.string()
        .required('IP address is required')
        .matches(
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            'Please enter a valid IP address'
        ),

    provider: yup.string()
        .required('Provider is required')
        .oneOf(PROVIDERS, 'Please select a valid provider'),

    status: yup.string()
        .required('Status is required')
        .oneOf(STATUSES, 'Please select a valid status'),

    cpu_cores: yup.number()
        .required('CPU cores is required')
        .integer('CPU cores must be a whole number')
        .min(1, 'Minimum 1 CPU core required')
        .max(128, 'Maximum 128 CPU cores allowed'),

    ram_mb: yup.number()
        .required('RAM is required')
        .integer('RAM must be a whole number')
        .min(512, 'Minimum 512 MB RAM required')
        .max(1048576, 'Maximum 1 TB RAM allowed'),

    storage_gb: yup.number()
        .required('Storage is required')
        .integer('Storage must be a whole number')
        .min(10, 'Minimum 10 GB storage required')
        .max(1048576, 'Maximum 1 PB storage allowed'),
});

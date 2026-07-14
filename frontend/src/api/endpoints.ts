import axiosClient from "./axiosClient";

export const api = {
    auth: {
        login: (data: any) => axiosClient.post('/auth/login', data),
        register: (data: any) => axiosClient.post('/auth/register', data),
        forgotPassword: (email: string) => axiosClient.post('/auth/forgot-password', { email }),
        verifyOtp: (data: {email: string, otp: string}) => axiosClient.post('/auth/verify-otp', data),
        resetPassword: (data: any) => axiosClient.post('/auth/reset-password', data),
    },
    booths: {
        getAll: (params?: any) => axiosClient.get('/booths', { params }),
        getById: (id: string) => axiosClient.get(`/booths/${id}`),
        create: (data: any) => axiosClient.post('/booths', data),
        update: (id: string, data: any) => axiosClient.put(`/booths/${id}`, data),
        changeStatus: (id: string, status: string) => axiosClient.put(`/booths/${id}/status`, { status }),
        delete: (id: string) => axiosClient.delete(`/booths/${id}`),
    },
    requests: {
        getAll: (params?: any) => axiosClient.get('/rental-requests', { params }),
        getMy: () => axiosClient.get('/rental-requests/my'),
        create: (data: any) => axiosClient.post('/rental-requests', data),
        approve: (id: string) => axiosClient.put(`/rental-requests/${id}/approve`),
        reject: (id: string, reason: string) => axiosClient.put(`/rental-requests/${id}/reject`, { reason }),
        cancel: (id: string) => axiosClient.delete(`/rental-requests/${id}`),
    },
    contracts: {
        getAll: (params?: any) => axiosClient.get('/contracts', { params }),
        getMy: () => axiosClient.get('/contracts/my'),
        getById: (id: string) => axiosClient.get(`/contracts/${id}`),
        createFromRequest: (reqId: string, data: any) => axiosClient.post(`/contracts/from-request/${reqId}`, data),
        update: (id: string, data: any) => axiosClient.put(`/contracts/${id}`, data),
        activate: (id: string) => axiosClient.put(`/contracts/${id}/activate`),
        terminate: (id: string, note?: string) => axiosClient.put(`/contracts/${id}/terminate`, { note }),
        cancel: (id: string) => axiosClient.put(`/contracts/${id}/cancel`),
        renew: (id: string, data: any) => axiosClient.post(`/contracts/${id}/renew`, data),
    },
    payments: {
        getAll: (params?: any) => axiosClient.get('/payments', { params }),
        getMy: () => axiosClient.get('/payments/my'),
        getByContract: (contractId: string) => axiosClient.get(`/payments/by-contract/${contractId}`),
        confirm: (id: string, data: any) => axiosClient.put(`/payments/${id}/confirm`, data),
    },
    users: {
        getAll: (params?: any) => axiosClient.get('/users', { params }),
        getProfile: () => axiosClient.get('/users/me'),
        createManager: (data: any) => axiosClient.post('/users/create-manager', data),
        updateProfile: (data: any) => axiosClient.put('/users/me', data),
        changePassword: (data: any) => axiosClient.put('/users/me/password', data),
        activate: (id: string) => axiosClient.put(`/users/${id}/activate`),
        deactivate: (id: string) => axiosClient.put(`/users/${id}/deactivate`),
    },
    dashboard: {
        getSummary: () => axiosClient.get('/dashboard/summary'),
        getRevenueChart: (year: number) => axiosClient.get('/dashboard/revenue-chart', { params: { year } }),
        getRevenueComparison: (year: number) => axiosClient.get('/dashboard/revenue-comparison', { params: { year } }),
    },
    reports: {
        exportFinancial: (year: number, month?: number) =>
            axiosClient.get('/reports/financial-export', {
                params: { year, month },
                responseType: 'blob',
            }),
    },
    configs: {
        getAll: () => axiosClient.get('/configs'),
        update: (key: string, data: any) => axiosClient.put(`/configs/${key}`, data),
    },
    auditLogs: {
        getAll: (page: number = 0, size: number = 50) => axiosClient.get('/audit-logs', { params: { page, size } }),
    }
};

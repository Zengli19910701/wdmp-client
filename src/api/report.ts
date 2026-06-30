import { http, type PageResult } from '../utils/request'

export interface Report { id: number; reportName: string; reportType: number; dataSql: string; configJson: string; remark: string; status: number; createTime: string }

export const getReportPage = (params: object) => http.get<PageResult<Report>>('/reports', params)
export const getReportById = (id: number) => http.get<Report>(`/reports/${id}`)
export const getReportData = (id: number) => http.get<Record<string, unknown>[]>(`/reports/${id}/data`)
export const saveReport = (data: object) => http.post<void>('/reports', data)
export const updateReport = (data: object) => http.put<void>('/reports', data)
export const deleteReport = (id: number) => http.delete<void>(`/reports/${id}`)

import { http, type PageResult } from '../utils/request'

export interface Job { id: number; jobName: string; jobGroup: string; cronExpr: string; beanName: string; methodName: string; params: string; status: number; remark: string; createTime: string }
export interface JobLog { id: number; jobId: number; jobName: string; status: number; message: string; startTime: string; endTime: string; costMs: number }

export const getJobPage = (params: object) => http.get<PageResult<Job>>('/tasks', params)
export const saveJob = (data: object) => http.post<void>('/tasks', data)
export const updateJob = (data: object) => http.put<void>('/tasks', data)
export const deleteJob = (id: number) => http.delete<void>(`/tasks/${id}`)
export const startJob = (id: number) => http.put<void>(`/tasks/${id}/start`)
export const stopJob = (id: number) => http.put<void>(`/tasks/${id}/stop`)
export const triggerJob = (id: number) => http.post<void>(`/tasks/${id}/trigger`)
export const getJobLogs = (params: object) => http.get<PageResult<JobLog>>('/tasks/logs', params)

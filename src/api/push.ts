import { http, type PageResult } from '../utils/request'

export interface PushMsg { id: number; title: string; content: string; msgType: number; targetType: number; targetIds: string; sendUser: number; sendTime: string; status: number }

export const getPushPage = (params: object) => http.get<PageResult<PushMsg>>('/push', params)
export const sendMsg = (data: object) => http.post<void>('/push/send', data)
export const saveDraft = (data: object) => http.post<void>('/push/draft', data)
export const deleteMsg = (id: number) => http.delete<void>(`/push/${id}`)

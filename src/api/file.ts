import { http, type PageResult } from '../utils/request'
import request from '../utils/request'

export interface SysFile {
  id: number; fileName: string; filePath: string
  fileSize: number; fileType: string; uploadTime: string
}

export const uploadFile = (formData: FormData) =>
  request.post<any>('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r: any) => r.data)
export const getFilePage = (params: object) => http.get<PageResult<SysFile>>('/files', params)
export const getDownloadUrl = (id: number) => `http://localhost:8080/api/files/${id}/download`
export const deleteFile = (id: number) => http.delete<void>(`/files/${id}`)

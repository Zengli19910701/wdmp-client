import axios, { type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../store/auth'
import router from '../router'

export interface ApiResult<T = unknown> {
  code: number
  msg: string
  data: T
}

export interface PageResult<T> {
  total: number
  list: T[]
}

const request = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 15000
})

/** 请求拦截器：自动附加 Token */
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

/** 响应拦截器：统一处理错误码 */
request.interceptors.response.use(
  (response: AxiosResponse<ApiResult>) => {
    const res = response.data
    if (res.code === 200) return res as unknown as AxiosResponse
    if (res.code === 401) {
      useAuthStore().logout()
      router.push('/login')
      return Promise.reject(new Error(res.msg || '未登录'))
    }
    ElMessage.error(res.msg || '操作失败')
    return Promise.reject(new Error(res.msg))
  },
  (error) => {
    ElMessage.error(error.response?.data?.msg || error.message || '网络异常')
    return Promise.reject(error)
  }
)

export const http = {
  get<T>(url: string, params?: object): Promise<T> {
    return request.get(url, { params }).then((r: any) => r.data)
  },
  post<T>(url: string, data?: object): Promise<T> {
    return request.post(url, data).then((r: any) => r.data)
  },
  put<T>(url: string, data?: object): Promise<T> {
    return request.put(url, data).then((r: any) => r.data)
  },
  delete<T>(url: string): Promise<T> {
    return request.delete(url).then((r: any) => r.data)
  }
}

export default request

import { http } from '../utils/request'

export interface LoginReq { username: string; password: string }
export interface LoginRes {
  token: string; userId: number; username: string
  realName: string; avatar: string; roles: string[]; perms: string[]
}

export const login = (data: LoginReq) => http.post<LoginRes>('/auth/login', data)
export const getUserInfo = () => http.get<LoginRes>('/auth/info')
export const logout = () => http.post<void>('/auth/logout')

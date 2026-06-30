import { http, type PageResult } from '../utils/request'

export interface User { id: number; deptId: number; username: string; realName: string; phone: string; email: string; status: number; createTime: string }
export interface Role { id: number; roleName: string; roleKey: string; orderNum: number; status: number; remark: string }
export interface MenuItem { id: number; parentId: number; menuName: string; menuType: number; path: string; component: string; perms: string; icon: string; orderNum: number; visible: number; status: number; children?: MenuItem[] }
export interface Dept { id: number; parentId: number; deptName: string; orderNum: number; status: number; children?: Dept[] }
export interface Config { id: number; configName: string; configKey: string; configValue: string; configType: number; remark: string }

export const getUserPage = (params: object) => http.get<PageResult<User>>('/system/users', params)
export const getUserById = (id: number) => http.get<User>(`/system/users/${id}`)
export const saveUser = (data: object) => http.post<void>('/system/users', data)
export const updateUser = (data: object) => http.put<void>('/system/users', data)
export const deleteUser = (id: number) => http.delete<void>(`/system/users/${id}`)

export const getRolePage = (params: object) => http.get<PageResult<Role>>('/system/roles', params)
export const getAllRoles = () => http.get<Role[]>('/system/roles/all')
export const getRoleMenuIds = (id: number) => http.get<number[]>(`/system/roles/${id}/menus`)
export const saveRole = (data: object) => http.post<void>('/system/roles', data)
export const updateRole = (data: object) => http.put<void>('/system/roles', data)
export const assignRoleMenus = (id: number, menuIds: number[]) => http.put<void>(`/system/roles/${id}/menus`, menuIds)
export const deleteRole = (id: number) => http.delete<void>(`/system/roles/${id}`)

export const getMenuTree = () => http.get<MenuItem[]>('/system/menus')
export const getUserMenus = () => http.get<MenuItem[]>('/system/menus/nav')
export const saveMenu = (data: object) => http.post<void>('/system/menus', data)
export const updateMenu = (data: object) => http.put<void>('/system/menus', data)
export const deleteMenu = (id: number) => http.delete<void>(`/system/menus/${id}`)

export const getDeptTree = () => http.get<Dept[]>('/system/depts')
export const saveDept = (data: object) => http.post<void>('/system/depts', data)
export const updateDept = (data: object) => http.put<void>('/system/depts', data)
export const deleteDept = (id: number) => http.delete<void>(`/system/depts/${id}`)

export const getConfigPage = (params: object) => http.get<PageResult<Config>>('/system/configs', params)
export const saveConfig = (data: object) => http.post<void>('/system/configs', data)
export const updateConfig = (data: object) => http.put<void>('/system/configs', data)
export const deleteConfig = (id: number) => http.delete<void>(`/system/configs/${id}`)

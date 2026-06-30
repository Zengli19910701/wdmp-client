import { http } from '../utils/request'

export interface Org { id: number; parentId: number; orgName: string; orgCode: string; orgType: number; orderNum: number; status: number; remark: string; children?: Org[] }

export const getOrgTree = () => http.get<Org[]>('/orgs')
export const saveOrg = (data: object) => http.post<void>('/orgs', data)
export const updateOrg = (data: object) => http.put<void>('/orgs', data)
export const deleteOrg = (id: number) => http.delete<void>(`/orgs/${id}`)

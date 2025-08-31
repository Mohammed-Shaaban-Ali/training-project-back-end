import {ApiResponse} from '../interfaces/api-response.interface'


export const ok = <T>(data: T): ApiResponse<T> => ({ success: true, data });

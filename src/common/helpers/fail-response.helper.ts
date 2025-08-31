import { ApiResponse } from "../interfaces/api-response.interface";

// never here means the data will note be passed in the failure response
export const fail = (message: string): ApiResponse<never> => ({ success: false, message });

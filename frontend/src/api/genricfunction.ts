import api from "./api";
import type { AxiosRequestConfig } from "axios";

type Method = "get" | "post" | "put" | "delete" | "patch";

interface ApiOptions<TRequest> {
  path: string;
  method?: Method;
  data?: TRequest;
  requiresAuth?: boolean;
  config?: AxiosRequestConfig;
}

export const apiRequest = async <
  TResponse,
  TRequest = undefined
>({
  path,
  method = "get",
  data,
  requiresAuth = false,
  config,
}: ApiOptions<TRequest>): Promise<TResponse> => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await api.request<TResponse>({
      url: path,
      method,
      data,
      headers: requiresAuth
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      ...config,
    });

    return response.data;
  } catch (e: any) {
    throw e.response?.data || e.message;
  }
};

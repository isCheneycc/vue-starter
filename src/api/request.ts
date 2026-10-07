import axios, { isAxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";

const SUCCESS_CODE = 200;

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
  success?: boolean;
}

export type RequestConfig = Omit<AxiosRequestConfig, "method" | "url"> & { url: string };

/** 业务失败：后端返回了信封，但 code 不是成功码或 success 为 false。 */
export class ApiError extends Error {
  readonly code: number;
  readonly response: ApiResponse<unknown>;

  constructor(response: ApiResponse<unknown>, options?: ErrorOptions) {
    super(response.msg || `业务请求失败，code=${response.code}`, options);
    this.name = "ApiError";
    this.code = response.code;
    this.response = response;
  }
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15_000,
});

function isApiResponse(body: unknown): body is ApiResponse<unknown> {
  return (
    typeof body === "object" && body !== null && "code" in body && typeof body.code === "number"
  );
}

function isSuccess(body: ApiResponse<unknown>) {
  return body.code === SUCCESS_CODE && body.success !== false;
}

async function request<T extends ApiResponse<unknown>>(config: AxiosRequestConfig): Promise<T> {
  let response: AxiosResponse<unknown>;
  try {
    response = await http.request<unknown>(config);
  } catch (error) {
    // 后端用非 2xx 状态码返回信封时，同样以 ApiError 暴露业务信息
    if (isAxiosError(error) && isApiResponse(error.response?.data)) {
      throw new ApiError(error.response.data, { cause: error });
    }
    throw error;
  }

  const body = response.data;
  if (!isApiResponse(body)) {
    throw new Error(
      `响应体不是 ApiResponse 结构：${config.method} ${config.url}（HTTP ${response.status}）`,
      { cause: response },
    );
  }
  if (!isSuccess(body)) {
    throw new ApiError(body);
  }
  return body as T;
}

export function get<T extends ApiResponse<unknown>>(config: RequestConfig) {
  return request<T>({ ...config, method: "GET" });
}

export function post<T extends ApiResponse<unknown>>(config: RequestConfig) {
  return request<T>({ ...config, method: "POST" });
}

export function put<T extends ApiResponse<unknown>>(config: RequestConfig) {
  return request<T>({ ...config, method: "PUT" });
}

export function del<T extends ApiResponse<unknown>>(config: RequestConfig) {
  return request<T>({ ...config, method: "DELETE" });
}

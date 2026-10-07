import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";
import { describe, expect, it } from "vite-plus/test";

import { ApiError, del, get, post, put, type ApiResponse } from "../request";

function stubAdapter(status: number, data: unknown) {
  const calls: InternalAxiosRequestConfig[] = [];
  const adapter: AxiosAdapter = async (config) => {
    calls.push(config);
    const response = { data, status, statusText: "", headers: {}, config };
    if (status >= 400) {
      throw new AxiosError(
        `Request failed with status code ${status}`,
        status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
        config,
        null,
        response,
      );
    }
    return response;
  };
  return { adapter, calls };
}

const ok = { code: 200, msg: "操作成功", data: { id: 1 } };

describe("request", () => {
  it("get 把 url 和 params 交给 axios，并返回完整信封", async () => {
    const { adapter, calls } = stubAdapter(200, ok);

    const res = await get<ApiResponse<{ id: number }>>({
      url: "/settings",
      params: { tableKey: "orders" },
      adapter,
    });

    expect(res).toEqual(ok);
    expect(calls[0]).toMatchObject({
      method: "get",
      url: "/settings",
      params: { tableKey: "orders" },
    });
  });

  it.each([
    ["post", post],
    ["put", put],
    ["delete", del],
  ] as const)("%s 使用对应的 HTTP 方法并发送 data", async (method, send) => {
    const { adapter, calls } = stubAdapter(200, { code: 200, msg: "操作成功" });

    await send<ApiResponse<void>>({ url: "/settings", data: { visible: true }, adapter });

    expect(calls[0]?.method).toBe(method);
    expect(JSON.parse(calls[0]?.data as string)).toEqual({ visible: true });
  });

  it("code 不是成功码时抛出 ApiError", async () => {
    const body = { code: 500, msg: "保存失败", data: null };
    const { adapter } = stubAdapter(200, body);

    const error = await get({ url: "/settings", adapter }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 500, message: "保存失败", response: body });
  });

  it("code 为 200 但 success 为 false 时抛出 ApiError", async () => {
    const { adapter } = stubAdapter(200, { code: 200, msg: "校验未通过", success: false });

    await expect(get({ url: "/settings", adapter })).rejects.toBeInstanceOf(ApiError);
  });

  it("success 为 true 且 code 为 200 时视为成功", async () => {
    const body = { ...ok, success: true };
    const { adapter } = stubAdapter(200, body);

    await expect(get({ url: "/settings", adapter })).resolves.toEqual(body);
  });

  it("非 2xx 且响应体是信封时抛出 ApiError，并保留原始错误", async () => {
    const { adapter } = stubAdapter(401, { code: 401, msg: "邀请已失效" });

    const error = await get({ url: "/settings", adapter }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 401, message: "邀请已失效" });
    expect((error as ApiError).cause).toBeInstanceOf(AxiosError);
  });

  it("非 2xx 且响应体不是信封时原样抛出 AxiosError", async () => {
    const { adapter } = stubAdapter(502, "<html>Bad Gateway</html>");

    const error = await get({ url: "/settings", adapter }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(AxiosError);
    expect(error).not.toBeInstanceOf(ApiError);
  });

  it("超时等没有响应的错误原样抛出 AxiosError", async () => {
    const adapter: AxiosAdapter = async (config) => {
      throw new AxiosError("timeout of 15000ms exceeded", AxiosError.ECONNABORTED, config);
    };

    const error = await get({ url: "/settings", adapter }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(AxiosError);
    expect(error).not.toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: AxiosError.ECONNABORTED });
  });

  it("2xx 但响应体不是信封时抛错，而不是当作成功返回", async () => {
    const { adapter } = stubAdapter(200, "<html>登录页</html>");

    await expect(get({ url: "/settings", adapter })).rejects.toThrow("响应体不是 ApiResponse 结构");
  });
});

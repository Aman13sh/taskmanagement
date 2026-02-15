import { apiRequest } from "../genricfunction";
import type { RegisterPayload, RegisterResponse, LoginPayload, LoginResponse } from "./resgister.types";

export const registerUser = (data: RegisterPayload) => {
  return apiRequest<RegisterResponse, RegisterPayload>({
    path: "/auth/register",
    method: "post",
    data,
  });
};

export const login = (data: LoginPayload) => {
  return apiRequest<LoginResponse, LoginPayload>({
    path: "/auth/login",
    method: "post",
    data,
  });
};

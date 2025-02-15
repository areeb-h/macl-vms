import { apiRequest } from "@/lib/apiClient";
import { AuthResponse } from "@/lib/types";

export const authAPI = {
  login: async (
    email: string,
    password: string
  ): Promise<AuthResponse | null> => {
    const response = await apiRequest("post", "/api/auth/login", {
      email,
      password,
    });

    return response as AuthResponse;
  },

  logout: async (): Promise<void> => {
    await apiRequest("post", "/api/auth/logout");
  },
};

export default authAPI;

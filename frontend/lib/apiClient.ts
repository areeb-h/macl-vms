import axios, { AxiosError, AxiosRequestConfig, Method } from "axios";
import { showToast, toastMessages } from "@/lib/toast";
import { useAuthStore } from "@/lib/store/auth";
import { LaravelApiResponse } from "@/lib/types"; // The interface from above

// Laravel API Response Interfaces
// "pagination" might be inside "data" or top-level, depending on your backend structure
// export interface LaravelApiResponse<T> {
//     success?: boolean;               // e.g. true
//     message?: string;               // e.g. "Retrieved successfully."
//     data?: T;                       // e.g. an array of visitors, or a single visitor, etc.
//     pagination?: {
//       per_page: number;
//       has_more_pages: boolean;
//       next_cursor: string | null;
//       prev_cursor: string | null;
//     };
//     errors?: Record<string, string[]>;  // for validation, etc.
//   }

interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}

// Create a reusable Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// ----- Request Interceptor -----
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {}; // Ensure headers exist
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----- Error Handling -----
const handleValidationError = (data: ValidationError) => {
  showToast("There are validation errors. Please check your form.", {
    type: "error",
  });
  return Promise.reject(data);
};

const handleLaravelErrorResponse = (
  error: AxiosError<LaravelApiResponse<any>>
) => {
  const status = error.response?.status;
  const data = error.response?.data;
  const message = data?.message || toastMessages.generic.serverError;
  const isLoginPage =
    typeof window !== "undefined" && window.location.pathname === "/login";

  if (!status) {
    showToast(toastMessages.generic.networkError, { type: "error" });
    return Promise.reject(error);
  }

  switch (status) {
    case 401:
      useAuthStore.getState().clearAuth();
      if (!isLoginPage)
        showToast(toastMessages.auth.unauthorized, { type: "error" });
      return Promise.reject(error);
    case 403:
      showToast("Access Denied", { type: "error" });
      break;
    case 422:
      return data?.errors
        ? handleValidationError(data as ValidationError)
        : Promise.reject(error);
    default:
      showToast(message, { type: "error" });
      break;
  }

  return Promise.reject(error);
};

// Apply response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<LaravelApiResponse<any>>) =>
    handleLaravelErrorResponse(error)
);

// ----- Unified API Request Function -----
export async function apiRequest<T>(
  method: Method,
  url: string,
  data?: any,
  config: AxiosRequestConfig = {}
): Promise<LaravelApiResponse<T>> {
  // <--- Notice we return the full object, not T|null
  try {
    const response = await api.request<LaravelApiResponse<T>>({
      method,
      url,
      data,
      ...config,
    });
    const responseData = response.data;

    if (
      responseData &&
      responseData.success !== undefined &&
      responseData.message
    ) {
      if (!url.includes("cursor=")) {
        showToast(responseData.message, {
          type: responseData.success ? "success" : "error",
        });
      }
    }

    return (
      responseData.data ?? {
        success: false,
        message: "Empty response from server",
      }
    );

    // return responseData.data ?? null;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return {
        success: false,
        message: (error as Error).message || "Request failed",
        data: undefined,
      };
    }
    throw error;
  }
}

export async function paginatedApiRequest<T>(
  method: Method,
  url: string,
  data?: any,
  config: AxiosRequestConfig = {}
): Promise<LaravelApiResponse<T>> {
  try {
    const axiosResponse = await api.request<LaravelApiResponse<T>>({
      method,
      url,
      data,
      ...config,
    });

    const responseData = axiosResponse.data;

    return (
      responseData ?? {
        success: false,
        message: "Empty response from server",
      }
    );
  } catch (error) {
    // If it's a 401, we can still *return* a shape
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Clear auth, etc.
      useAuthStore.getState().clearAuth();
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    // For other errors, also return a consistent shape
    return {
      success: false,
      message: (error as Error)?.message || "Request failed",
    };
  }
}

export default api;

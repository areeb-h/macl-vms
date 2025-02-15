import { toast } from "sonner";

export type ToastType = "success" | "error" | "loading" | "warning" | "info";

interface ToastOptions {
  type?: ToastType;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const showToast = (message: string, options: ToastOptions = {}) => {
  const { type = "success", description, duration = 2000, action } = options;

  const toastOptions = {
    duration,
    description,
    action,
  };

  const promise = new Promise((resolve) => setTimeout(resolve, 1000));

  switch (type) {
    case "success":
      return toast.success(message, toastOptions);
    case "error":
      return toast.error(message, toastOptions);
    case "warning":
      return toast.warning(message, toastOptions);
    case "info":
      return toast.info(message, toastOptions);
    case "loading":
      return toast.promise(promise, {
        loading: message,
        success: () => "",
      });
    default:
      return toast(message, toastOptions);
  }
};

export const toastMessages = {
  auth: {
    loginSuccess: "Successfully logged in",
    loginError: "Invalid credentials",
    logoutSuccess: "Successfully logged out",
    unauthorized: "Please log in to continue",
  },
  visitors: {
    createSuccess: "Visitor registered successfully",
    createError: "Failed to register visitor",
    deleteSuccess: "Visitor deleted successfully",
    deleteError: "Failed to delete visitor",
    fetchError: "Failed to fetch visitors",
  },
  logs: {
    fetchError: "Failed to fetch activity logs",
  },
  generic: {
    serverError: "Server error occurred",
    networkError: "Network error occurred",
    success: "Operation successful",
  },
};

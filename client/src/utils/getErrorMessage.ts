import { AxiosError } from "axios";

interface ApiErrorResponse {
  success: false;
  message: string;
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.message) {
      return data.message;
    }
  }
  return fallback;
}

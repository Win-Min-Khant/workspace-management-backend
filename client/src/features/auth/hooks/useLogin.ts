import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { loginUser } from "../api/authApi";
import { tokenStorage } from "@/utils/tokenStorage";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
      toast.success("Login successful!");
      navigate("/select-workspace");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

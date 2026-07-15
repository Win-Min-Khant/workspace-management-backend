import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logoutUser } from "../api/authApi";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function useLogout() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      toast.success("Logout successful!");
      navigate("/");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

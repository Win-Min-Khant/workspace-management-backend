import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { registerUser } from "../api/authApi";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Registration successful!");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

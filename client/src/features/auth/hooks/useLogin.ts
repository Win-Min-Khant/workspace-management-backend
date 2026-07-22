import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { loginUser } from "../api/authApi";
import { tokenStorage } from "@/utils/tokenStorage";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { acceptInvitation } from "@/features/invitation/api/invitationApi";

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
      tokenStorage.setUserId(data.user.id);
      toast.success("Login successful!");

      const pendingToken = localStorage.getItem("pendingInviteToken");

      if (pendingToken) {
        localStorage.removeItem("pendingInviteToken");
        try {
          const result = await acceptInvitation({ token: pendingToken });
          toast.success("Joined the workspace!");
          navigate(`/w/${result.workspaceId}/dashboard`);
          return;
        } catch {
          // invite might have expired/already been used — fall through to normal redirect
        }
      }

      navigate("/redirect");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

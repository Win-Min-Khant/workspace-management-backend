import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { acceptInvitation } from "../api/invitationApi";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { tokenStorage } from "@/utils/tokenStorage";

export function useAcceptInvitation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: acceptInvitation,
    onSuccess: (data) => {
      toast.success("Welcome to the workspace!");

      // if the person wasn't logged in before, they still aren't now —
      // this endpoint doesn't return tokens, only workspaceId/userId
      const isLoggedIn = Boolean(tokenStorage.getAccessToken());

      if (isLoggedIn) {
        tokenStorage.setUserId(data.userId);
        navigate(`/w/${data.workspaceId}/dashboard`);
      } else {
        navigate("/login");
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

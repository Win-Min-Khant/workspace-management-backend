import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { sendInvitation } from "../api/invitationApi";

export function useSendInvitation() {
  return useMutation({
    mutationFn: sendInvitation,
    onSuccess: () => {
      toast.success("Invitation sent!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

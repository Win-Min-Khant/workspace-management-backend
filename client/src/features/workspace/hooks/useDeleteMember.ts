import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { deleteMember } from "../api/workspaceApi";

export function useDeleteMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "members"],
      });
      toast.success("Member removed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

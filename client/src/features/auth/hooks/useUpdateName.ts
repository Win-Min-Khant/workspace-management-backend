import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { updateName } from "../api/authApi";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function useUpdateName() {
  const queryClient = useQueryClient();
  const { workspaceId } = useParams();

  return useMutation({
    mutationFn: updateName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", workspaceId] });
      toast.success("Name is updated successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

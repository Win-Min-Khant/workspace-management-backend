import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { updateAvatar } from "../api/authApi";

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  const { workspaceId } = useParams();

  return useMutation({
    mutationFn: updateAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", workspaceId] });
      toast.success("Updated profile successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

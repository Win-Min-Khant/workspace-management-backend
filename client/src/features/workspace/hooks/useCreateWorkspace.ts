import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { createWorkspace } from "../api/workspaceApi";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { queryClient } from "@/app/queryClient";

export function useCreateWorkspace() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: (data) => {
      localStorage.setItem("lastWorkspaceId", data.workspace._id);
      queryClient.invalidateQueries({ queryKey: ["workspaces", "me"] });
      toast.success("Workspace created!");
      navigate(`/w/${data.workspace._id}/dashboard`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

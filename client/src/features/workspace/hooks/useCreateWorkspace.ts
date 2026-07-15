import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { createWorkspace } from "../api/workspaceApi";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function useCreateWorkspace() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: (data) => {
      localStorage.setItem("lastWorkspaceId", data.workspace._id);
      toast.success("Workspace created!");
      navigate(`/w/${data.workspace._id}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

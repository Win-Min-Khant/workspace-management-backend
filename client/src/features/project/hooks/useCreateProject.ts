import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { createProject } from "../api/projectApi";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function useCreateProject(workspaceId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "projects"],
      });
      toast.success("Project created!");
      navigate(`/w/${workspaceId}/projects/${project._id}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

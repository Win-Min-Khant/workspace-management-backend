import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { updateProject } from "../api/projectApi";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function useUpdateProject(workspaceId: string, projectId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "projects"],
      });
      toast.success("Project updated");
      navigate(`/w/${workspaceId}/projects/${projectId}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

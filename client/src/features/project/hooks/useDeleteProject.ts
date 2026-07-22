import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { deleteProject } from "../api/projectApi";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function useDeleteProject(workspaceId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "projects"],
      });
      toast.success("Project deleted");
      navigate(`/w/${workspaceId}/projects`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

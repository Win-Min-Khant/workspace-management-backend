import { useQuery } from "@tanstack/react-query";
import { verifyInvitation } from "../api/invitationApi";

export function useVerifyInvitation(token: string) {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: () => verifyInvitation(token),
    enabled: Boolean(token),
    retry: false,
  });
}

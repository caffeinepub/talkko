import type { SocialActor } from "../types/social";
import { useActor } from "./useActor";

export function useSocialActor(): {
  actor: SocialActor | null;
  isFetching: boolean;
} {
  const { actor, isFetching } = useActor();
  return {
    actor: actor ? (actor as unknown as SocialActor) : null,
    isFetching,
  };
}

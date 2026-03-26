import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Comment, Notification, Post, Profile } from "../types/social";
import { useSocialActor } from "./useSocialActor";

export function useAllPosts() {
  const { actor, isFetching } = useSocialActor();
  return useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePostsByUser(principal: Principal | null) {
  const { actor, isFetching } = useSocialActor();
  return useQuery<Post[]>({
    queryKey: ["posts", "user", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getPostsByUser(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function usePost(postId: string | null) {
  const { actor, isFetching } = useSocialActor();
  return useQuery<Post | null>({
    queryKey: ["post", postId],
    queryFn: async () => {
      if (!actor || !postId) return null;
      return actor.getPost(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useComments(postId: string | null) {
  const { actor, isFetching } = useSocialActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!actor || !postId) return [];
      return actor.getComments(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useSocialActor();
  return useQuery<Profile | null>({
    queryKey: ["profile", "caller"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProfile(principal: Principal | null) {
  const { actor, isFetching } = useSocialActor();
  return useQuery<Profile | null>({
    queryKey: ["profile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useAllProfiles() {
  const { actor, isFetching } = useSocialActor();
  return useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLikedPostIds() {
  const { actor, isFetching } = useSocialActor();
  return useQuery<string[]>({
    queryKey: ["likedPostIds"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLikedPostIds();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useNotifications() {
  const { actor, isFetching } = useSocialActor();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUnreadNotifCount() {
  const { actor, isFetching } = useSocialActor();
  return useQuery<number>({
    queryKey: ["unreadNotifCount"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getUnreadNotifCount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useFollowing(principal: Principal | null) {
  const { actor, isFetching } = useSocialActor();
  return useQuery<Principal[]>({
    queryKey: ["following", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getFollowing(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useFollowers(principal: Principal | null) {
  const { actor, isFetching } = useSocialActor();
  return useQuery<Principal[]>({
    queryKey: ["followers", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getFollowers(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useIsFollowing(target: Principal | null) {
  const { actor, isFetching } = useSocialActor();
  return useQuery<boolean>({
    queryKey: ["isFollowing", target?.toString()],
    queryFn: async () => {
      if (!actor || !target) return false;
      return actor.isFollowing(target);
    },
    enabled: !!actor && !isFetching && !!target,
  });
}

export function useCreatePost() {
  const { actor } = useSocialActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.createPost(content);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useSocialActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deletePost(postId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useLikePost() {
  const { actor } = useSocialActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.likePost(postId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["likedPostIds"] });
    },
  });
}

export function useAddComment() {
  const { actor } = useSocialActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addComment(postId, content);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["comments", vars.postId] });
    },
  });
}

export function useFollowUser() {
  const { actor } = useSocialActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (target: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.followUser(target);
    },
    onSuccess: (_data, target) => {
      qc.invalidateQueries({ queryKey: ["isFollowing", target.toString()] });
      qc.invalidateQueries({ queryKey: ["following"] });
      qc.invalidateQueries({ queryKey: ["followers"] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useSocialActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (target: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.unfollowUser(target);
    },
    onSuccess: (_data, target) => {
      qc.invalidateQueries({ queryKey: ["isFollowing", target.toString()] });
      qc.invalidateQueries({ queryKey: ["following"] });
      qc.invalidateQueries({ queryKey: ["followers"] });
    },
  });
}

export function useCreateOrUpdateProfile() {
  const { actor } = useSocialActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      username,
      bio,
      avatarKey,
    }: { username: string; bio: string; avatarKey: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createOrUpdateProfile(username, bio, avatarKey);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

export function useMarkNotificationsRead() {
  const { actor } = useSocialActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!actor) throw new Error("Not connected");
      return actor.markNotificationsRead();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unreadNotifCount"] });
    },
  });
}

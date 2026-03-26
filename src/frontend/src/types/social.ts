import type { Principal } from "@icp-sdk/core/principal";

export interface Profile {
  principal: Principal;
  username: string;
  bio: string;
  avatarKey: string;
  createdAt: bigint;
}

export interface Post {
  id: string;
  authorPrincipal: Principal;
  content: string;
  createdAt: bigint;
  likeCount: bigint;
}

export interface Comment {
  id: string;
  postId: string;
  authorPrincipal: Principal;
  content: string;
  createdAt: bigint;
}

export interface Notification {
  id: string;
  recipientPrincipal: Principal;
  senderPrincipal: Principal;
  notifType: string;
  postId: string;
  createdAt: bigint;
  isRead: boolean;
}

export interface SocialActor {
  createOrUpdateProfile(
    username: string,
    bio: string,
    avatarKey: string,
  ): Promise<void>;
  getCallerProfile(): Promise<Profile | null>;
  getProfile(p: Principal): Promise<Profile | null>;
  getAllProfiles(): Promise<Profile[]>;
  createPost(content: string): Promise<string>;
  getAllPosts(): Promise<Post[]>;
  getPostsByUser(p: Principal): Promise<Post[]>;
  getPost(postId: string): Promise<Post | null>;
  deletePost(postId: string): Promise<void>;
  likePost(postId: string): Promise<boolean>;
  isLiked(postId: string): Promise<boolean>;
  getLikedPostIds(): Promise<string[]>;
  addComment(postId: string, content: string): Promise<string>;
  getComments(postId: string): Promise<Comment[]>;
  followUser(target: Principal): Promise<void>;
  unfollowUser(target: Principal): Promise<void>;
  isFollowing(target: Principal): Promise<boolean>;
  getFollowers(p: Principal): Promise<Principal[]>;
  getFollowing(p: Principal): Promise<Principal[]>;
  getNotifications(): Promise<Notification[]>;
  markNotificationsRead(): Promise<void>;
  getUnreadNotifCount(): Promise<number>;
}

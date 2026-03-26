# Talkko

## Current State
New project with no existing application code.

## Requested Changes (Diff)

### Add
- User authentication and profiles (username, avatar, bio, follower/following counts)
- Home feed showing posts from all users, sorted by recency
- Create and publish text posts
- Like posts (toggle)
- Comment on posts
- Follow/unfollow other users
- Notifications page (new likes, comments, follows)
- Explore/discover page to find users and trending posts
- Mobile-friendly responsive design

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- User profiles: create/update profile (username, bio, avatar URL), get profile by principal
- Posts: create post, get all posts (feed), get posts by user, like/unlike post, delete post
- Comments: add comment to post, get comments for post
- Follow system: follow/unfollow user, get followers, get following
- Notifications: generate notifications on like/comment/follow events, get notifications for current user, mark as read

### Frontend (React)
- Layout: bottom navigation bar (mobile) + sidebar (desktop) with Home, Explore, Notifications, Profile links
- Home feed page: infinite scroll list of posts with like/comment actions
- Post card component: avatar, username, timestamp, text, like count, comment count
- Create post modal/sheet
- Post detail page with comments
- Explore page: user search + suggested users + trending posts
- Notifications page: list of notification items grouped by type
- User profile page: avatar, bio, follower/following counts, follow button, post grid/list
- Auth flow: login/register with username and bio setup

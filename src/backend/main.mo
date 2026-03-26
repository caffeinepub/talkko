import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Runtime "mo:core/Runtime";

actor {
  func denyAnonymous(caller : Principal) {
    if (caller.isAnonymous()) { Runtime.trap("Anonymous principal not permitted") };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // ====== TYPES ======

  type Profile = {
    principal : Principal;
    username : Text;
    bio : Text;
    avatarKey : Text;
    createdAt : Int;
  };

  type PostInternal = {
    id : Text;
    authorPrincipal : Principal;
    content : Text;
    createdAt : Int;
    var likeCount : Nat;
  };

  type Post = {
    id : Text;
    authorPrincipal : Principal;
    content : Text;
    createdAt : Int;
    likeCount : Nat;
  };

  type Comment = {
    id : Text;
    postId : Text;
    authorPrincipal : Principal;
    content : Text;
    createdAt : Int;
  };

  type NotificationInternal = {
    id : Text;
    recipientPrincipal : Principal;
    senderPrincipal : Principal;
    notifType : Text;
    postId : Text;
    createdAt : Int;
    var isRead : Bool;
  };

  type Notification = {
    id : Text;
    recipientPrincipal : Principal;
    senderPrincipal : Principal;
    notifType : Text;
    postId : Text;
    createdAt : Int;
    isRead : Bool;
  };

  // ====== STATE ======

  let profiles = Map.empty<Text, Profile>();
  let posts = Map.empty<Text, PostInternal>();
  let comments = Map.empty<Text, Comment>();
  let likes = Map.empty<Text, Bool>();
  let follows = Map.empty<Text, Bool>();
  let notifications = Map.empty<Text, NotificationInternal>();
  var postCounter : Nat = 0;
  var commentCounter : Nat = 0;
  var notifCounter : Nat = 0;

  // ====== HELPERS ======

  func nextPostId() : Text { postCounter += 1; "post_" # postCounter.toText() };
  func nextCommentId() : Text { commentCounter += 1; "comment_" # commentCounter.toText() };
  func nextNotifId() : Text { notifCounter += 1; "notif_" # notifCounter.toText() };

  func toPost(p : PostInternal) : Post = {
    id = p.id; authorPrincipal = p.authorPrincipal; content = p.content;
    createdAt = p.createdAt; likeCount = p.likeCount;
  };

  func toNotification(n : NotificationInternal) : Notification = {
    id = n.id; recipientPrincipal = n.recipientPrincipal; senderPrincipal = n.senderPrincipal;
    notifType = n.notifType; postId = n.postId; createdAt = n.createdAt; isRead = n.isRead;
  };

  func addNotification(recipient : Principal, sender : Principal, notifType : Text, postId : Text) {
    if (recipient == sender) return;
    let id = nextNotifId();
    notifications.add(id, {
      id; recipientPrincipal = recipient; senderPrincipal = sender;
      notifType; postId; createdAt = Time.now(); var isRead = false;
    });
  };

  // ====== PROFILES ======

  public shared ({ caller }) func createOrUpdateProfile(username : Text, bio : Text, avatarKey : Text) : async () {
    denyAnonymous(caller);
    let key = caller.toText();
    let createdAt = switch (profiles.get(key)) {
      case (?p) p.createdAt;
      case null Time.now();
    };
    profiles.add(key, { principal = caller; username; bio; avatarKey; createdAt });
  };

  public query func getProfile(p : Principal) : async ?Profile {
    profiles.get(p.toText());
  };

  public shared query ({ caller }) func getCallerProfile() : async ?Profile {
    profiles.get(caller.toText());
  };

  public query func getAllProfiles() : async [Profile] {
    profiles.values().toArray();
  };

  // ====== POSTS ======

  public shared ({ caller }) func createPost(content : Text) : async Text {
    denyAnonymous(caller);
    let id = nextPostId();
    posts.add(id, { id; authorPrincipal = caller; content; createdAt = Time.now(); var likeCount = 0 });
    id;
  };

  public query func getAllPosts() : async [Post] {
    let arr = posts.values().toArray().map(toPost);
    arr.sort(func(a : Post, b : Post) : { #less; #equal; #greater } {
      if (a.createdAt > b.createdAt) #less else if (a.createdAt < b.createdAt) #greater else #equal
    });
  };

  public query func getPostsByUser(p : Principal) : async [Post] {
    let arr = posts.values().toArray()
      .filter(func(post : PostInternal) : Bool { post.authorPrincipal == p })
      .map(toPost);
    arr.sort(func(a : Post, b : Post) : { #less; #equal; #greater } {
      if (a.createdAt > b.createdAt) #less else if (a.createdAt < b.createdAt) #greater else #equal
    });
  };

  public query func getPost(postId : Text) : async ?Post {
    switch (posts.get(postId)) { case (?p) ?toPost(p); case null null };
  };

  public shared ({ caller }) func deletePost(postId : Text) : async () {
    denyAnonymous(caller);
    switch (posts.get(postId)) {
      case (?post) {
        if (post.authorPrincipal != caller) Runtime.trap("Not authorized");
        posts.remove(postId);
      };
      case null Runtime.trap("Post not found");
    };
  };

  // ====== LIKES ======

  public shared ({ caller }) func likePost(postId : Text) : async Bool {
    denyAnonymous(caller);
    let likeKey = postId # ":" # caller.toText();
    let already = switch (likes.get(likeKey)) { case (?v) v; case null false };
    if (already) {
      likes.add(likeKey, false);
      switch (posts.get(postId)) {
        case (?post) { if (post.likeCount > 0) post.likeCount -= 1 };
        case null {};
      };
      false;
    } else {
      likes.add(likeKey, true);
      switch (posts.get(postId)) {
        case (?post) {
          post.likeCount += 1;
          addNotification(post.authorPrincipal, caller, "like", postId);
        };
        case null {};
      };
      true;
    };
  };

  public query ({ caller }) func isLiked(postId : Text) : async Bool {
    switch (likes.get(postId # ":" # caller.toText())) { case (?v) v; case null false };
  };

  public query ({ caller }) func getLikedPostIds() : async [Text] {
    let suffix = ":" # caller.toText();
    likes.entries()
      .filter(func((k, v) : (Text, Bool)) : Bool { v and k.endsWith(#text suffix) })
      .map(func((k, _) : (Text, Bool)) : Text {
        switch (k.split(#char ':').next()) { case (?id) id; case null "" };
      })
      .toArray();
  };

  // ====== COMMENTS ======

  public shared ({ caller }) func addComment(postId : Text, content : Text) : async Text {
    denyAnonymous(caller);
    let id = nextCommentId();
    comments.add(id, { id; postId; authorPrincipal = caller; content; createdAt = Time.now() });
    switch (posts.get(postId)) {
      case (?post) addNotification(post.authorPrincipal, caller, "comment", postId);
      case null {};
    };
    id;
  };

  public query func getComments(postId : Text) : async [Comment] {
    let arr = comments.values().toArray()
      .filter(func(c : Comment) : Bool { c.postId == postId });
    arr.sort(func(a : Comment, b : Comment) : { #less; #equal; #greater } {
      if (a.createdAt > b.createdAt) #less else if (a.createdAt < b.createdAt) #greater else #equal
    });
  };

  // ====== FOLLOWS ======

  public shared ({ caller }) func followUser(target : Principal) : async () {
    denyAnonymous(caller);
    if (caller == target) Runtime.trap("Cannot follow yourself");
    follows.add(caller.toText() # ":" # target.toText(), true);
    addNotification(target, caller, "follow", "");
  };

  public shared ({ caller }) func unfollowUser(target : Principal) : async () {
    denyAnonymous(caller);
    follows.remove(caller.toText() # ":" # target.toText());
  };

  public query ({ caller }) func isFollowing(target : Principal) : async Bool {
    switch (follows.get(caller.toText() # ":" # target.toText())) { case (?v) v; case null false };
  };

  public query func getFollowers(p : Principal) : async [Principal] {
    let suffix = ":" # p.toText();
    follows.entries()
      .filter(func((k, v) : (Text, Bool)) : Bool { v and k.endsWith(#text suffix) })
      .map(func((k, _) : (Text, Bool)) : Principal {
        Principal.fromText(k.split(#char ':').toArray()[0]);
      })
      .toArray();
  };

  public query func getFollowing(p : Principal) : async [Principal] {
    let prefix = p.toText() # ":";
    follows.entries()
      .filter(func((k, v) : (Text, Bool)) : Bool { v and k.startsWith(#text prefix) })
      .map(func((k, _) : (Text, Bool)) : Principal {
        Principal.fromText(k.split(#char ':').toArray()[1]);
      })
      .toArray();
  };

  // ====== NOTIFICATIONS ======

  public shared query ({ caller }) func getNotifications() : async [Notification] {
    let callerText = caller.toText();
    let arr = notifications.values().toArray()
      .filter(func(n : NotificationInternal) : Bool { n.recipientPrincipal.toText() == callerText })
      .map(toNotification);
    arr.sort(func(a : Notification, b : Notification) : { #less; #equal; #greater } {
      if (a.createdAt > b.createdAt) #less else if (a.createdAt < b.createdAt) #greater else #equal
    });
  };

  public shared ({ caller }) func markNotificationsRead() : async () {
    denyAnonymous(caller);
    let callerText = caller.toText();
    for ((_, notif) in notifications.entries()) {
      if (notif.recipientPrincipal.toText() == callerText) notif.isRead := true;
    };
  };

  public shared query ({ caller }) func getUnreadNotifCount() : async Nat {
    let callerText = caller.toText();
    var count = 0;
    for ((_, notif) in notifications.entries()) {
      if (notif.recipientPrincipal.toText() == callerText and not notif.isRead) count += 1;
    };
    count;
  };
};

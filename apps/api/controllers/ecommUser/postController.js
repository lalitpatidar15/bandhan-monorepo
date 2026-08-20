const Post = require("../../models/shared/Post.js");
const Comment = require("../../models/shared/Comment.js");

// ========= Create Post =========
exports.createPost = async (req, res) => {
  try {
    const { content, image, video } = req.body;

    const post = await Post.create({
      userId: req.user.id,
      content,
      image,
      video
    });

    res.json({
      success: true,
      message: "Post created",
      data: post
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/postController.js:", err);

    res.status(500).json({ error: "Failed to process post request" });
  }
};


// ========= Get Feed =========
exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "fullName profilePic profileImage role")
      .sort({ createdAt: -1 });

    const postIds = posts.map((post) => post._id);
    const comments = await Comment.find({ postId: { $in: postIds } })
      .populate("userId", "fullName")
      .sort({ createdAt: 1 });
    const commentsByPost = new Map();
    comments.forEach((comment) => {
      const key = String(comment.postId);
      const current = commentsByPost.get(key) || [];
      current.push({
        id: String(comment._id),
        user: comment.userId?.fullName || "Member",
        text: comment.text,
        createdAt: comment.createdAt,
      });
      commentsByPost.set(key, current);
    });

    res.json({
      success: true,
      data: posts.map((post) => ({
        id: String(post._id),
        user: post.userId?.fullName || "Bandhan member",
        role: post.userId?.role || "member",
        time: post.createdAt,
        content: post.content || "",
        image: post.image || "",
        video: post.video || "",
        likes: post.likes?.length || 0,
        comments: commentsByPost.get(String(post._id)) || [],
        avatar: post.userId?.profilePic || post.userId?.profileImage || "",
      }))
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/postController.js:", err);

    res.status(500).json({ error: "Failed to process post request" });
  }
};


// ========= Like / Unlike =========
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      likes: post.likes.length
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/postController.js:", err);

    res.status(500).json({ error: "Failed to process post request" });
  }
};


// ========== Share Post =========
exports.sharePost = async (req, res) => {
  try {
    const { postId } = req.body;

    const post = await Post.findById(postId);
    post.shareCount += 1;
    await post.save();

    res.json({
      success: true,
      shareCount: post.shareCount
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/postController.js:", err);

    res.status(500).json({ error: "Failed to process post request" });
  }
};



//=========== Add Comment ==========
exports.addComment = async (req, res) => {
  try {
    const { postId, text } = req.body;

    const comment = await Comment.create({
      postId,
      userId: req.user.id,
      text
    });

    res.json({
      success: true,
      data: comment
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/postController.js:", err);

    res.status(500).json({ error: "Failed to process post request" });
  }
};


// ========= Get Comments ===========
exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId })
      .populate("userId", "name profilePic")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: comments
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/postController.js:", err);

    res.status(500).json({ error: "Failed to process post request" });
  }
};

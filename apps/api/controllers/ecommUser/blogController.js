const Blog = require("../../models/shared/Blog.js");

const publicPublishedFilter = { status: "published", published: true };

exports.getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, published, category, status, q, featured } = req.query;
    const query = {};

    const publishedOnly = published === "true";
    if (publishedOnly) Object.assign(query, publicPublishedFilter);
    if (category) query.category = category;
    if (featured === "true") query.featured = true;
    if (!publishedOnly) {
      if (status) query.status = status;
      else query.status = { $ne: "archived" };
    }

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-comments.userId");
    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: blogs,
      blogs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in controllers/ecommUser/blogController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process blog request" });
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      ...publicPublishedFilter,
    }).select("-comments.userId");
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    await Blog.findByIdAndUpdate(blog._id, { $inc: { viewCount: 1 } });

    res.json({ success: true, data: blog, blog });
  } catch (error) {
    console.error("Error in controllers/ecommUser/blogController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process blog request" });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).select("-comments.userId");
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.json({ success: true, data: blog, blog });
  } catch (error) {
    console.error("Error in controllers/ecommUser/blogController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process blog request" });
  }
};

exports.createBlog = async (req, res) => {
  try {
    if (req.user && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admins can create blogs" });
    }

    const blogData = {
      title: req.body.title,
      content: req.body.content,
      excerpt: req.body.excerpt,
      coverImage: req.body.coverImage,
      category: req.body.category || "general",
      tags: req.body.tags ? (typeof req.body.tags === "string" ? req.body.tags.split(",").map(t => t.trim()) : req.body.tags) : [],
      status: req.body.status || "draft",
      featured: req.body.featured === "true",
      seoTitle: req.body.seoTitle,
      seoDescription: req.body.seoDescription,
    };

    if (req.user) {
      blogData.author = req.user.id;
      blogData.authorName = req.user.name || req.user.username;
    }

    const blog = await Blog.create(blogData);
    res.status(201).json({ success: true, data: blog, message: "Blog created" });
  } catch (error) {
    console.error("Error in controllers/ecommUser/blogController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process blog request" });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    if (req.user && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admins can update blogs" });
    }

    const updateData = { ...req.body };
    if (updateData.tags && typeof updateData.tags === "string") {
      updateData.tags = updateData.tags.split(",").map(t => t.trim());
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.json({ success: true, data: blog, message: "Blog updated" });
  } catch (error) {
    console.error("Error in controllers/ecommUser/blogController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process blog request" });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    if (req.user && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admins can delete blogs" });
    }

    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.json({ success: true, message: "Blog deleted" });
  } catch (error) {
    console.error("Error in controllers/ecommUser/blogController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process blog request" });
  }
};

exports.getBlogCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct("category", publicPublishedFilter);
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error in controllers/ecommUser/blogController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process blog request" });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    const userId = req.user.id;
    const index = blog.likes.indexOf(userId);

    if (index > -1) {
      blog.likes.splice(index, 1);
    } else {
      blog.likes.push(userId);
    }

    await blog.save();

    return res.json({
      success: true,
      data: {
        liked: index === -1,
        likeCount: blog.likeCount,
      },
    });
  } catch (error) {
    console.error("Error in controllers/ecommUser/blogController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process blog request" });
  }
};

exports.addComment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    const comment = {
      userId: req.user.id,
      userName: req.user.name || req.user.username || "Anonymous",
      text: text.trim(),
      createdAt: new Date(),
    };

    blog.comments.push(comment);
    await blog.save();

    const newComment = blog.comments[blog.comments.length - 1];

    return res.status(201).json({
      success: true,
      data: {
        _id: newComment._id,
        userName: newComment.userName,
        text: newComment.text,
        createdAt: newComment.createdAt,
      },
      message: "Comment added",
    });
  } catch (error) {
    console.error("Error in controllers/ecommUser/blogController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process blog request" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    if (comment.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    blog.comments.pull(req.params.commentId);
    await blog.save();

    return res.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    console.error("Error in controllers/ecommUser/blogController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process blog request" });
  }
};

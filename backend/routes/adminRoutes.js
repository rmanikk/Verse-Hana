import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import protect, { adminOnly } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Like from "../models/Like.js";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

const publicUserFields =
  "name email role status createdAt updatedAt";

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeUser = (user) => ({
  ...user,
  status: user.status || "active",
});

const getUserFilter = ({
  search,
  role,
  status,
}) => {
  const filters = [];

  if (search) {
    const expression = new RegExp(
      escapeRegex(search),
      "i"
    );

    filters.push({
      $or: [
        { name: expression },
        { email: expression },
      ],
    });
  }

  if (["user", "admin"].includes(role)) {
    filters.push({ role });
  }

  if (status === "active") {
    filters.push({
      $or: [
        { status: "active" },
        { status: { $exists: false } },
      ],
    });
  }

  if (status === "suspended") {
    filters.push({
      status: "suspended",
    });
  }

  return filters.length
    ? { $and: filters }
    : {};
};

const getPagination = (query) => {
  const requestedPage = Number.parseInt(
    query.page,
    10
  );

  const requestedLimit = Number.parseInt(
    query.limit,
    10
  );

  return {
    page: Number.isNaN(requestedPage)
      ? 1
      : Math.max(requestedPage, 1),

    limit: Number.isNaN(requestedLimit)
      ? 25
      : Math.min(
          Math.max(requestedLimit, 1),
          100
        ),
  };
};

const getActivityQuery = async ({
  page,
  limit,
}) => {
  const [activity, total] =
    await Promise.all([
      AuditLog.find()
        .populate("actor", "name email")
        .populate(
          "targetUser",
          "name email"
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      AuditLog.countDocuments(),
    ]);

  return {
    activity,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(
        Math.ceil(total / limit),
        1
      ),
    },
  };
};

/*
|--------------------------------------------------------------------------
| ACTIVITY ANALYTICS
|--------------------------------------------------------------------------
|
| Returns:
| - totalActions
| - today
| - last7Days
| - last30Days
| - daily graph data for the last 30 days
| - action type breakdown
|
*/

router.get(
  "/activity/analytics",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const now = new Date();

      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      const startOfLast7Days = new Date(
        startOfToday
      );

      startOfLast7Days.setDate(
        startOfLast7Days.getDate() - 6
      );

      const startOfLast30Days = new Date(
        startOfToday
      );

      startOfLast30Days.setDate(
        startOfLast30Days.getDate() - 29
      );

      const [
        totalActions,
        today,
        last7Days,
        last30Days,
        dailyActivity,
        actionBreakdown,
      ] = await Promise.all([
        AuditLog.countDocuments(),

        AuditLog.countDocuments({
          createdAt: {
            $gte: startOfToday,
          },
        }),

        AuditLog.countDocuments({
          createdAt: {
            $gte: startOfLast7Days,
          },
        }),

        AuditLog.countDocuments({
          createdAt: {
            $gte: startOfLast30Days,
          },
        }),

        AuditLog.aggregate([
          {
            $match: {
              createdAt: {
                $gte: startOfLast30Days,
              },
            },
          },

          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },

              count: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              _id: 1,
            },
          },
        ]),

        AuditLog.aggregate([
          {
            $group: {
              _id: "$action",
              count: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              count: -1,
            },
          },
        ]),
      ]);

      /*
       * Build every day in the 30-day range.
       * This ensures the graph doesn't have missing dates.
       */

      const dailyMap = new Map(
        dailyActivity.map((item) => [
          item._id,
          item.count,
        ])
      );

      const daily = [];

      for (
        let index = 0;
        index < 30;
        index += 1
      ) {
        const date = new Date(
          startOfLast30Days
        );

        date.setDate(
          startOfLast30Days.getDate() +
            index
        );

        const key = [
          date.getFullYear(),
          String(
            date.getMonth() + 1
          ).padStart(2, "0"),
          String(
            date.getDate()
          ).padStart(2, "0"),
        ].join("-");

        daily.push({
          date: key,

          label: date.toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
            }
          ),

          count: dailyMap.get(key) || 0,
        });
      }

      return res.json({
        totalActions,
        today,
        last7Days,
        last30Days,

        daily,

        actionBreakdown:
          actionBreakdown.map((item) => ({
            action: item._id,
            count: item.count,
          })),
      });
    } catch (error) {
      console.error(
        "Admin activity analytics error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load activity analytics.",
      });
    }
  }
);

router.get(
  "/dashboard",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const [
        totalUsers,
        adminUsers,
        suspendedUsers,
        totalLikes,
        uniqueTracks,
        recentUsers,
        recentLikes,
        popularTracks,
        recentActivity,
      ] = await Promise.all([
        User.countDocuments(),

        User.countDocuments({
          role: "admin",
        }),

        User.countDocuments({
          status: "suspended",
        }),

        Like.countDocuments(),

        Like.distinct("songId"),

        User.find()
          .select(publicUserFields)
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),

        Like.find()
          .populate(
            "user",
            "name email"
          )
          .select(
            "title artist artwork user createdAt"
          )
          .sort({ createdAt: -1 })
          .limit(6)
          .lean(),

        Like.aggregate([
          {
            $group: {
              _id: "$songId",
              title: {
                $first: "$title",
              },
              artist: {
                $first: "$artist",
              },
              likes: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              likes: -1,
              title: 1,
            },
          },

          {
            $limit: 6,
          },
        ]),

        AuditLog.find()
          .populate(
            "actor",
            "name email"
          )
          .populate(
            "targetUser",
            "name email"
          )
          .sort({ createdAt: -1 })
          .limit(6)
          .lean(),
      ]);

      return res.json({
        admin: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },

        stats: {
          totalUsers,
          adminUsers,
          activeUsers:
            totalUsers - suspendedUsers,
          suspendedUsers,
          totalLikes,
          uniqueTracks:
            uniqueTracks.length,
        },

        recentUsers:
          recentUsers.map(normalizeUser),

        recentLikes,

        popularTracks,

        recentActivity,
      });
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load admin dashboard data.",
      });
    }
  }
);

router.get(
  "/users",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { page, limit } =
        getPagination(req.query);

      const search = String(
        req.query.search || ""
      )
        .trim()
        .slice(0, 80);

      const role = String(
        req.query.role || ""
      );

      const status = String(
        req.query.status || ""
      );

      const filter = getUserFilter({
        search,
        role,
        status,
      });

      const [users, total] =
        await Promise.all([
          User.find(filter)
            .select(publicUserFields)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),

          User.countDocuments(filter),
        ]);

      return res.json({
        users: users.map(normalizeUser),

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(
            Math.ceil(total / limit),
            1
          ),
        },
      });
    } catch (error) {
      console.error(
        "Admin user list error:",
        error
      );

      return res.status(500).json({
        message: "Failed to load users.",
      });
    }
  }
);

router.get(
  "/activity",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { page, limit } =
        getPagination(req.query);

      return res.json(
        await getActivityQuery({
          page,
          limit,
        })
      );
    } catch (error) {
      console.error(
        "Admin activity error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load admin activity.",
      });
    }
  }
);

router.post(
  "/users",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const name = String(
        req.body.name || ""
      ).trim();

      const email = String(
        req.body.email || ""
      )
        .trim()
        .toLowerCase();

      const password = String(
        req.body.password || ""
      );

      const role = [
        "user",
        "admin",
      ].includes(req.body.role)
        ? req.body.role
        : "user";

      const status = [
        "active",
        "suspended",
      ].includes(req.body.status)
        ? req.body.status
        : "active";

      if (!name || !email || !password) {
        return res.status(400).json({
          message:
            "Name, email, and a temporary password are required.",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message:
            "The temporary password must be at least 6 characters.",
        });
      }

      if (await User.exists({ email })) {
        return res.status(409).json({
          message:
            "An account with this email already exists.",
        });
      }

      const user = await User.create({
        name,
        email,
        password: await bcrypt.hash(
          password,
          12
        ),
        role,
        status,
      });

      await AuditLog.create({
        actor: req.user._id,
        action: "user.created",
        entityType: "user",
        targetUser: user._id,
        targetName: user.name,
        nextValue: "created",
      });

      return res.status(201).json({
        user: normalizeUser(
          user.toObject()
        ),
      });
    } catch (error) {
      console.error(
        "Admin user creation error:",
        error
      );

      if (error.code === 11000) {
        return res.status(409).json({
          message:
            "An account with this email already exists.",
        });
      }

      return res.status(500).json({
        message: "Failed to create user.",
      });
    }
  }
);

router.patch(
  "/users/:userId",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      if (
        !mongoose.isValidObjectId(
          req.params.userId
        )
      ) {
        return res.status(400).json({
          message: "Invalid user ID.",
        });
      }

      const updates = {};

      if ("name" in req.body) {
        updates.name = String(
          req.body.name || ""
        ).trim();

        if (!updates.name) {
          return res.status(400).json({
            message: "Name is required.",
          });
        }
      }

      if ("email" in req.body) {
        updates.email = String(
          req.body.email || ""
        )
          .trim()
          .toLowerCase();

        if (!updates.email) {
          return res.status(400).json({
            message: "Email is required.",
          });
        }
      }

      if (
        "password" in req.body &&
        req.body.password
      ) {
        if (
          String(req.body.password)
            .length < 6
        ) {
          return res.status(400).json({
            message:
              "The new password must be at least 6 characters.",
          });
        }

        updates.password =
          await bcrypt.hash(
            String(req.body.password),
            12
          );
      }

      const user =
        await User.findByIdAndUpdate(
          req.params.userId,
          updates,
          {
            new: true,
            runValidators: true,
          }
        ).select(publicUserFields);

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      await AuditLog.create({
        actor: req.user._id,
        action: "user.updated",
        entityType: "user",
        targetUser: user._id,
        targetName: user.name,
        nextValue: "updated",
      });

      return res.json({
        user: normalizeUser(
          user.toObject()
        ),
      });
    } catch (error) {
      console.error(
        "Admin user update error:",
        error
      );

      if (error.code === 11000) {
        return res.status(409).json({
          message:
            "An account with this email already exists.",
        });
      }

      return res.status(500).json({
        message: "Failed to update user.",
      });
    }
  }
);

router.delete(
  "/users/:userId",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      if (
        !mongoose.isValidObjectId(
          req.params.userId
        )
      ) {
        return res.status(400).json({
          message: "Invalid user ID.",
        });
      }

      if (
        String(req.user._id) ===
        req.params.userId
      ) {
        return res.status(400).json({
          message:
            "You cannot delete your own account from the admin console.",
        });
      }

      const user =
        await User.findById(
          req.params.userId
        ).select("name email");

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      await Promise.all([
        User.deleteOne({
          _id: user._id,
        }),

        Like.deleteMany({
          user: user._id,
        }),
      ]);

      await AuditLog.create({
        actor: req.user._id,
        action: "user.deleted",
        entityType: "user",
        targetUser: user._id,
        targetName: user.name,
        previousValue: user.email,
        nextValue: "deleted",
      });

      return res.json({
        message:
          "User and their saved-song records were deleted.",
      });
    } catch (error) {
      console.error(
        "Admin user deletion error:",
        error
      );

      return res.status(500).json({
        message: "Failed to delete user.",
      });
    }
  }
);

const updateUserField = async ({
  req,
  res,
  field,
  allowedValues,
  action,
}) => {
  try {
    const nextValue =
      req.body[field];

    if (
      !allowedValues.includes(
        nextValue
      )
    ) {
      return res.status(400).json({
        message: `Invalid ${field}.`,
      });
    }

    if (
      !mongoose.isValidObjectId(
        req.params.userId
      )
    ) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    if (
      String(req.user._id) ===
      req.params.userId
    ) {
      return res.status(400).json({
        message: `You cannot change your own ${field}.`,
      });
    }

    const existingUser =
      await User.findById(
        req.params.userId
      )
        .select(publicUserFields)
        .lean();

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const previousValue =
      existingUser[field] ||
      (field === "status"
        ? "active"
        : "user");

    if (
      previousValue === nextValue
    ) {
      return res.json({
        message:
          "No changes were needed.",

        user: normalizeUser(
          existingUser
        ),
      });
    }

    const updatedUser =
      await User.findByIdAndUpdate(
        req.params.userId,
        {
          [field]: nextValue,
        },
        {
          new: true,
          runValidators: true,
        }
      ).select(publicUserFields);

    await AuditLog.create({
      actor: req.user._id,
      action,
      entityType: "user",
      targetUser: updatedUser._id,
      targetName: existingUser.name,
      previousValue,
      nextValue,
    });

    return res.json({
      message: "User updated.",

      user: normalizeUser(
        updatedUser.toObject()
      ),
    });
  } catch (error) {
    console.error(
      "Admin user update error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update user.",
    });
  }
};

router.patch(
  "/users/:userId/role",
  protect,
  adminOnly,
  (req, res) =>
    updateUserField({
      req,
      res,
      field: "role",
      allowedValues: [
        "user",
        "admin",
      ],
      action:
        "user.role_changed",
    })
);

router.patch(
  "/users/:userId/status",
  protect,
  adminOnly,
  (req, res) =>
    updateUserField({
      req,
      res,
      field: "status",
      allowedValues: [
        "active",
        "suspended",
      ],
      action:
        "user.status_changed",
    })
);

export default router;
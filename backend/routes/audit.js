import express from "express";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

// Get audit logs with filtering
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, action, entityType, startDate, endDate } = req.query;
    
    const filter = {};
    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AuditLog.countDocuments(filter);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get audit statistics
router.get("/stats", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await AuditLog.aggregate([
      {
        $match: {
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 }
        }
      }
    ]);

    const totalToday = await AuditLog.countDocuments({
      createdAt: { $gte: today }
    });

    // Get top activities
    const topActivities = await AuditLog.aggregate([
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      todayStats: stats,
      totalToday: totalToday,
      topActivities: topActivities
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear audit logs
router.delete("/", async (req, res) => {
  try {
    const { days } = req.query;
    
    let filter = {};
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
      filter.createdAt = { $lt: cutoffDate };
    }

    const result = await AuditLog.deleteMany(filter);

    res.json({
      message: `Successfully cleared ${result.deletedCount} audit log records`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
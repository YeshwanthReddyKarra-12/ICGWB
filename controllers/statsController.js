const db = require('../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    const careerCount = await db.getAsync('SELECT COUNT(*) as count FROM careers');
    const courseCount = await db.getAsync('SELECT COUNT(*) as count FROM courses');
    const studentCount = await db.getAsync('SELECT COUNT(*) as count FROM users WHERE role = "student"');
    const requestCount = await db.getAsync('SELECT COUNT(*) as count FROM guidance_requests');
    const pendingRequests = await db.getAsync('SELECT COUNT(*) as count FROM guidance_requests WHERE status = "Pending"');
    const resolvedRequests = await db.getAsync('SELECT COUNT(*) as count FROM guidance_requests WHERE status = "Resolved"');

    const categoriesWithStats = await db.allAsync(`
      SELECT cat.id, cat.name, cat.icon,
        (SELECT COUNT(*) FROM careers c WHERE c.category_id = cat.id) as career_count,
        (SELECT COUNT(*) FROM courses cr WHERE cr.category_id = cat.id) as course_count
      FROM categories cat
    `);

    const recentRequests = await db.allAsync(`
      SELECT * FROM guidance_requests ORDER BY created_at DESC LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        careers: careerCount.count,
        courses: courseCount.count,
        students: studentCount.count,
        totalRequests: requestCount.count,
        pendingRequests: pendingRequests.count,
        resolvedRequests: resolvedRequests.count
      },
      categories: categoriesWithStats,
      recentRequests
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve stats.' });
  }
};

const db = require('../config/database');

// Toggle favorite (Bookmark or Remove Bookmark)
exports.toggleFavorite = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { item_type, item_id } = req.body;

    if (!item_type || !item_id) {
      return res.status(400).json({ success: false, message: 'Item type and ID are required.' });
    }

    if (!['career', 'course'].includes(item_type)) {
      return res.status(400).json({ success: false, message: 'Invalid item type. Must be career or course.' });
    }

    // Check if already favorited
    const existing = await db.getAsync(
      'SELECT id FROM favorites WHERE user_id = ? AND item_type = ? AND item_id = ?',
      [userId, item_type, item_id]
    );

    if (existing) {
      await db.runAsync('DELETE FROM favorites WHERE id = ?', [existing.id]);
      return res.json({
        success: true,
        favorited: false,
        message: `${item_type === 'career' ? 'Career' : 'Course'} removed from bookmarks.`
      });
    } else {
      await db.runAsync(
        'INSERT INTO favorites (user_id, item_type, item_id) VALUES (?, ?, ?)',
        [userId, item_type, item_id]
      );
      return res.json({
        success: true,
        favorited: true,
        message: `${item_type === 'career' ? 'Career' : 'Course'} saved to your bookmarks!`
      });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ success: false, message: 'Failed to update bookmarks.' });
  }
};

// Get all favorites for the logged-in student
exports.getUserFavorites = async (req, res) => {
  try {
    const userId = req.session.user.id;

    // Fetch favorited careers
    const careers = await db.allAsync(`
      SELECT c.*, cat.name as category_name, cat.icon as category_icon, f.created_at as favorited_at, 1 as is_favorited
      FROM favorites f
      JOIN careers c ON f.item_id = c.id
      JOIN categories cat ON c.category_id = cat.id
      WHERE f.user_id = ? AND f.item_type = 'career'
      ORDER BY f.created_at DESC
    `, [userId]);

    // Fetch favorited courses
    const courses = await db.allAsync(`
      SELECT cr.*, cat.name as category_name, cat.icon as category_icon, c.title as career_title, f.created_at as favorited_at, 1 as is_favorited
      FROM favorites f
      JOIN courses cr ON f.item_id = cr.id
      JOIN categories cat ON cr.category_id = cat.id
      LEFT JOIN careers c ON cr.career_id = c.id
      WHERE f.user_id = ? AND f.item_type = 'course'
      ORDER BY f.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: {
        careers,
        courses,
        totalCount: careers.length + courses.length
      }
    });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve bookmarks.' });
  }
};

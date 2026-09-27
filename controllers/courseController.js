const db = require('../config/database');

// Get all courses with search and filtering
exports.getAllCourses = async (req, res) => {
  try {
    const { search, category_id, degree_level, career_id, sort } = req.query;
    const currentUserId = req.session && req.session.user ? req.session.user.id : null;

    let sql = `
      SELECT cr.*, cat.name as category_name, cat.icon as category_icon, c.title as career_title
      ${currentUserId ? `, (SELECT COUNT(*) FROM favorites f WHERE f.user_id = ? AND f.item_type = 'course' AND f.item_id = cr.id) as is_favorited` : ''}
      FROM courses cr
      JOIN categories cat ON cr.category_id = cat.id
      LEFT JOIN careers c ON cr.career_id = c.id
      WHERE 1=1
    `;

    const params = [];
    if (currentUserId) {
      params.push(currentUserId);
    }

    if (search && search.trim() !== '') {
      sql += ` AND (cr.name LIKE ? OR cr.description LIKE ? OR cr.required_subjects LIKE ? OR cr.top_colleges LIKE ? OR cr.eligibility LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    if (category_id && category_id !== 'all') {
      sql += ` AND cr.category_id = ?`;
      params.push(category_id);
    }

    if (degree_level && degree_level !== 'all') {
      sql += ` AND cr.degree_level LIKE ?`;
      params.push(`%${degree_level.trim()}%`);
    }

    if (career_id && career_id !== 'all') {
      sql += ` AND cr.career_id = ?`;
      params.push(career_id);
    }

    if (sort === 'name_desc') {
      sql += ` ORDER BY cr.name DESC`;
    } else if (sort === 'duration') {
      sql += ` ORDER BY cr.duration ASC`;
    } else {
      sql += ` ORDER BY cr.name ASC`;
    }

    const courses = await db.allAsync(sql, params);
    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve courses.' });
  }
};

// Get single course by ID
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.session && req.session.user ? req.session.user.id : null;

    let sql = `
      SELECT cr.*, cat.name as category_name, cat.icon as category_icon, c.title as career_title, c.overview as career_overview
      ${currentUserId ? `, (SELECT COUNT(*) FROM favorites f WHERE f.user_id = ? AND f.item_type = 'course' AND f.item_id = cr.id) as is_favorited` : ''}
      FROM courses cr
      JOIN categories cat ON cr.category_id = cat.id
      LEFT JOIN careers c ON cr.career_id = c.id
      WHERE cr.id = ?
    `;

    const params = currentUserId ? [currentUserId, id] : [id];
    const course = await db.getAsync(sql, params);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    console.error('Error retrieving course:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve course details.' });
  }
};

// Create new course (Admin)
exports.createCourse = async (req, res) => {
  try {
    const {
      name,
      career_id,
      category_id,
      degree_level,
      duration,
      eligibility,
      required_subjects,
      top_colleges,
      admission_process,
      avg_fee,
      description
    } = req.body;

    if (!name || !category_id || !degree_level || !duration || !eligibility || !required_subjects || !top_colleges) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, degree level, duration, eligibility, required subjects, and top colleges are required.'
      });
    }

    const result = await db.runAsync(
      `INSERT INTO courses (name, career_id, category_id, degree_level, duration, eligibility, required_subjects, top_colleges, admission_process, avg_fee, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        career_id || null,
        category_id,
        degree_level.trim(),
        duration.trim(),
        eligibility.trim(),
        required_subjects.trim(),
        top_colleges.trim(),
        admission_process ? admission_process.trim() : '',
        avg_fee ? avg_fee.trim() : '',
        description ? description.trim() : ''
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Course successfully added!',
      id: result.lastID
    });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ success: false, message: 'Failed to create course.' });
  }
};

// Update course (Admin)
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      career_id,
      category_id,
      degree_level,
      duration,
      eligibility,
      required_subjects,
      top_colleges,
      admission_process,
      avg_fee,
      description
    } = req.body;

    const existing = await db.getAsync('SELECT id FROM courses WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    await db.runAsync(
      `UPDATE courses
       SET name = ?, career_id = ?, category_id = ?, degree_level = ?, duration = ?,
           eligibility = ?, required_subjects = ?, top_colleges = ?, admission_process = ?, avg_fee = ?, description = ?
       WHERE id = ?`,
      [
        name.trim(),
        career_id || null,
        category_id,
        degree_level.trim(),
        duration.trim(),
        eligibility.trim(),
        required_subjects.trim(),
        top_colleges.trim(),
        admission_process ? admission_process.trim() : '',
        avg_fee ? avg_fee.trim() : '',
        description ? description.trim() : '',
        id
      ]
    );

    res.json({ success: true, message: 'Course successfully updated!' });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ success: false, message: 'Failed to update course.' });
  }
};

// Delete course (Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.getAsync('SELECT id FROM courses WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    await db.runAsync('DELETE FROM courses WHERE id = ?', [id]);
    await db.runAsync('DELETE FROM favorites WHERE item_type = "course" AND item_id = ?', [id]);

    res.json({ success: true, message: 'Course successfully deleted.' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, message: 'Failed to delete course.' });
  }
};

// Get distinct degree levels
exports.getDegreeLevels = async (req, res) => {
  try {
    const rows = await db.allAsync('SELECT DISTINCT degree_level FROM courses WHERE degree_level IS NOT NULL');
    const levels = rows.map(r => r.degree_level);
    res.json({ success: true, data: levels });
  } catch (error) {
    console.error('Error fetching degree levels:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve degree levels.' });
  }
};

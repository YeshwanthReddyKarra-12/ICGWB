const db = require('../config/database');

// Get all careers with search and filtering
exports.getAllCareers = async (req, res) => {
  try {
    const { search, category_id, stream, sort } = req.query;
    const currentUserId = req.session && req.session.user ? req.session.user.id : null;

    let sql = `
      SELECT c.*, cat.name as category_name, cat.icon as category_icon
      ${currentUserId ? `, (SELECT COUNT(*) FROM favorites f WHERE f.user_id = ? AND f.item_type = 'career' AND f.item_id = c.id) as is_favorited` : ''}
      FROM careers c
      JOIN categories cat ON c.category_id = cat.id
      WHERE 1=1
    `;

    const params = [];
    if (currentUserId) {
      params.push(currentUserId);
    }

    if (search && search.trim() !== '') {
      sql += ` AND (c.title LIKE ? OR c.overview LIKE ? OR c.required_skills LIKE ? OR c.job_roles LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (category_id && category_id !== 'all') {
      sql += ` AND c.category_id = ?`;
      params.push(category_id);
    }

    if (stream && stream !== 'all') {
      sql += ` AND c.stream LIKE ?`;
      params.push(`%${stream.trim()}%`);
    }

    if (sort === 'title_desc') {
      sql += ` ORDER BY c.title DESC`;
    } else if (sort === 'newest') {
      sql += ` ORDER BY c.id DESC`;
    } else {
      sql += ` ORDER BY c.title ASC`;
    }

    const careers = await db.allAsync(sql, params);
    res.json({ success: true, count: careers.length, data: careers });
  } catch (error) {
    console.error('Error fetching careers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch careers.' });
  }
};

// Get single career by ID with related courses
exports.getCareerById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.session && req.session.user ? req.session.user.id : null;

    let sql = `
      SELECT c.*, cat.name as category_name, cat.icon as category_icon
      ${currentUserId ? `, (SELECT COUNT(*) FROM favorites f WHERE f.user_id = ? AND f.item_type = 'career' AND f.item_id = c.id) as is_favorited` : ''}
      FROM careers c
      JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = ?
    `;

    const params = currentUserId ? [currentUserId, id] : [id];
    const career = await db.getAsync(sql, params);

    if (!career) {
      return res.status(404).json({ success: false, message: 'Career not found.' });
    }

    // Associated courses
    const courses = await db.allAsync(
      `SELECT cr.*, cat.name as category_name
       FROM courses cr
       JOIN categories cat ON cr.category_id = cat.id
       WHERE cr.career_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...career,
        courses
      }
    });
  } catch (error) {
    console.error('Error fetching career detail:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve career details.' });
  }
};

// Create new career (Admin)
exports.createCareer = async (req, res) => {
  try {
    const {
      title,
      category_id,
      stream,
      overview,
      required_skills,
      job_roles,
      salary_range,
      job_growth_outlook,
      education_path,
      image_url
    } = req.body;

    if (!title || !category_id || !stream || !overview) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, stream, and overview are required fields.'
      });
    }

    const defaultImg = image_url && image_url.trim() !== ''
      ? image_url.trim()
      : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=80';

    const result = await db.runAsync(
      `INSERT INTO careers (title, category_id, stream, overview, required_skills, job_roles, salary_range, job_growth_outlook, education_path, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        category_id,
        stream.trim(),
        overview.trim(),
        required_skills ? required_skills.trim() : '',
        job_roles ? job_roles.trim() : '',
        salary_range ? salary_range.trim() : '',
        job_growth_outlook ? job_growth_outlook.trim() : '',
        education_path ? education_path.trim() : '',
        defaultImg
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Career successfully created!',
      id: result.lastID
    });
  } catch (error) {
    console.error('Error creating career:', error);
    res.status(500).json({ success: false, message: 'Failed to create career.' });
  }
};

// Update career (Admin)
exports.updateCareer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category_id,
      stream,
      overview,
      required_skills,
      job_roles,
      salary_range,
      job_growth_outlook,
      education_path,
      image_url
    } = req.body;

    const existing = await db.getAsync('SELECT id FROM careers WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Career not found.' });
    }

    await db.runAsync(
      `UPDATE careers
       SET title = ?, category_id = ?, stream = ?, overview = ?, required_skills = ?,
           job_roles = ?, salary_range = ?, job_growth_outlook = ?, education_path = ?, image_url = ?
       WHERE id = ?`,
      [
        title.trim(),
        category_id,
        stream.trim(),
        overview.trim(),
        required_skills ? required_skills.trim() : '',
        job_roles ? job_roles.trim() : '',
        salary_range ? salary_range.trim() : '',
        job_growth_outlook ? job_growth_outlook.trim() : '',
        education_path ? education_path.trim() : '',
        image_url ? image_url.trim() : '',
        id
      ]
    );

    res.json({ success: true, message: 'Career successfully updated!' });
  } catch (error) {
    console.error('Error updating career:', error);
    res.status(500).json({ success: false, message: 'Failed to update career.' });
  }
};

// Delete career (Admin)
exports.deleteCareer = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.getAsync('SELECT id FROM careers WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Career not found.' });
    }

    await db.runAsync('DELETE FROM careers WHERE id = ?', [id]);
    // Also remove from favorites
    await db.runAsync('DELETE FROM favorites WHERE item_type = "career" AND item_id = ?', [id]);

    res.json({ success: true, message: 'Career successfully deleted.' });
  } catch (error) {
    console.error('Error deleting career:', error);
    res.status(500).json({ success: false, message: 'Failed to delete career.' });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await db.allAsync(`
      SELECT cat.*,
        (SELECT COUNT(*) FROM careers c WHERE c.category_id = cat.id) as career_count,
        (SELECT COUNT(*) FROM courses cr WHERE cr.category_id = cat.id) as course_count
      FROM categories cat
      ORDER BY cat.name ASC
    `);
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

// Get streams
exports.getStreams = async (req, res) => {
  try {
    const rows = await db.allAsync('SELECT DISTINCT stream FROM careers WHERE stream IS NOT NULL AND stream != ""');
    const streams = rows.map(r => r.stream);
    res.json({ success: true, data: streams });
  } catch (error) {
    console.error('Error fetching streams:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch streams.' });
  }
};

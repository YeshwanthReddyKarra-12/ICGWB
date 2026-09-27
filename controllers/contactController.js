const db = require('../config/database');

// Submit guidance request
exports.submitRequest = async (req, res) => {
  try {
    const { student_name, student_email, student_phone, current_education, interested_stream, message } = req.body;

    if (!student_name || !student_email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(student_email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const userId = req.session && req.session.user ? req.session.user.id : null;

    const result = await db.runAsync(
      `INSERT INTO guidance_requests (user_id, student_name, student_email, student_phone, current_education, interested_stream, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        userId,
        student_name.trim(),
        student_email.trim().toLowerCase(),
        student_phone ? student_phone.trim() : '',
        current_education ? current_education.trim() : 'Not Specified',
        interested_stream ? interested_stream.trim() : 'General Guidance',
        message.trim()
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Your guidance request has been submitted successfully! An educational counsellor will review your details and respond soon.',
      id: result.lastID
    });
  } catch (error) {
    console.error('Error submitting guidance request:', error);
    res.status(500).json({ success: false, message: 'Failed to submit guidance request.' });
  }
};

// Get all guidance requests (Admin)
exports.getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM guidance_requests WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';
    const requests = await db.allAsync(sql, params);

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    console.error('Error fetching guidance requests:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve guidance requests.' });
  }
};

// Update request status / add counsellor reply (Admin)
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, counsellor_reply } = req.body;

    const existing = await db.getAsync('SELECT id FROM guidance_requests WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Guidance request not found.' });
    }

    await db.runAsync(
      'UPDATE guidance_requests SET status = ?, counsellor_reply = ? WHERE id = ?',
      [status || 'In Review', counsellor_reply ? counsellor_reply.trim() : null, id]
    );

    res.json({ success: true, message: 'Guidance inquiry updated successfully.' });
  } catch (error) {
    console.error('Error updating guidance request:', error);
    res.status(500).json({ success: false, message: 'Failed to update guidance inquiry.' });
  }
};

// Delete guidance request (Admin)
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await db.runAsync('DELETE FROM guidance_requests WHERE id = ?', [id]);
    res.json({ success: true, message: 'Guidance inquiry deleted.' });
  } catch (error) {
    console.error('Error deleting guidance request:', error);
    res.status(500).json({ success: false, message: 'Failed to delete inquiry.' });
  }
};

// Get guidance requests submitted by the logged in student
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const email = req.session.user.email;

    const requests = await db.allAsync(
      `SELECT * FROM guidance_requests WHERE user_id = ? OR student_email = ? ORDER BY created_at DESC`,
      [userId, email]
    );

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    console.error('Error fetching student requests:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve your inquiries.' });
  }
};

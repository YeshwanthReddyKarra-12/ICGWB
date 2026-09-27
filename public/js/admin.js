// Admin Panel & Content Management Logic
let allCareersData = [];
let allCoursesData = [];
let allInquiriesData = [];
let categoriesList = [];

let careerModalInstance = null;
let courseModalInstance = null;
let inquiryModalInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = await checkAuth();
  if (!user || user.role !== 'admin') {
    document.getElementById('admin-access-denied').classList.remove('d-none');
    document.getElementById('admin-dashboard-container').classList.add('d-none');
    return;
  }

  document.getElementById('admin-user-name').textContent = user.name;
  document.getElementById('admin-access-denied').classList.add('d-none');
  document.getElementById('admin-dashboard-container').classList.remove('d-none');

  // Initialize Bootstrap Modals
  careerModalInstance = new bootstrap.Modal(document.getElementById('careerEditModal'));
  courseModalInstance = new bootstrap.Modal(document.getElementById('courseEditModal'));
  inquiryModalInstance = new bootstrap.Modal(document.getElementById('inquiryReplyModal'));

  // Load Everything
  await loadCategories();
  await Promise.all([
    loadDashboardStats(),
    loadAdminCareers(),
    loadAdminCourses(),
    loadAdminInquiries()
  ]);

  // Search and Filter Listeners
  document.getElementById('admin-career-search').addEventListener('input', renderAdminCareersTable);
  document.getElementById('admin-course-search').addEventListener('input', renderAdminCoursesTable);
  document.getElementById('admin-inquiry-filter').addEventListener('change', loadAdminInquiries);

  // Form Submissions
  document.getElementById('career-form').addEventListener('submit', handleSaveCareer);
  document.getElementById('course-form').addEventListener('submit', handleSaveCourse);
  document.getElementById('inquiry-reply-form').addEventListener('submit', handleSaveInquiryReply);
});

// Load Categories
async function loadCategories() {
  const res = await API.get('/api/careers/categories');
  if (res.success && res.data) {
    categoriesList = res.data;
    
    // Populate Career modal category dropdown
    const careerCatSelect = document.getElementById('career-category');
    careerCatSelect.innerHTML = categoriesList.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    // Populate Course modal category dropdown
    const courseCatSelect = document.getElementById('course-category');
    courseCatSelect.innerHTML = categoriesList.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }
}

// Load Dashboard Metrics
async function loadDashboardStats() {
  const res = await API.get('/api/stats/dashboard');
  if (res.success && res.stats) {
    const s = res.stats;
    document.getElementById('stat-kpi-careers').textContent = s.careers;
    document.getElementById('stat-kpi-courses').textContent = s.courses;
    document.getElementById('stat-kpi-students').textContent = s.students;
    document.getElementById('stat-kpi-inquiries').textContent = s.pendingRequests;
    document.getElementById('badge-pending-count').textContent = s.pendingRequests;
  }
}

// ==================== CAREER MANAGEMENT ====================
async function loadAdminCareers() {
  const res = await API.get('/api/careers?sort=title_asc');
  if (res.success && res.data) {
    allCareersData = res.data;
    renderAdminCareersTable();

    // Populate Course Modal Career Dropdown
    const courseCareerSelect = document.getElementById('course-career');
    courseCareerSelect.innerHTML = '<option value="">-- No Direct Career Linked --</option>' +
      allCareersData.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
  }
}

function renderAdminCareersTable() {
  const tbody = document.getElementById('admin-careers-tbody');
  const term = (document.getElementById('admin-career-search').value || '').toLowerCase().trim();

  const filtered = allCareersData.filter(c => 
    c.title.toLowerCase().includes(term) ||
    c.category_name.toLowerCase().includes(term) ||
    c.stream.toLowerCase().includes(term)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No careers found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(c => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-3">
          <img src="${c.image_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=150&q=80'}" class="rounded-3 shadow-sm" style="width: 44px; height: 44px; object-fit: cover;">
          <div>
            <div class="fw-bold">${c.title}</div>
            <div class="small text-muted text-truncate" style="max-width: 250px;">${c.overview}</div>
          </div>
        </div>
      </td>
      <td><span class="badge bg-light text-dark border">${c.category_name}</span></td>
      <td><span class="badge bg-blue-subtle text-primary border border-primary-subtle">${c.stream}</span></td>
      <td class="small text-dark fw-medium">${c.salary_range ? c.salary_range.split('/')[0] : 'N/A'}</td>
      <td class="small text-success fw-medium">${c.job_growth_outlook || 'Standard'}</td>
      <td class="text-end">
        <button class="btn btn-outline-primary btn-sm rounded-pill px-2.5 py-1 me-1" onclick="openEditCareerModal(${c.id})">
          <i class="bi bi-pencil-square"></i> Edit
        </button>
        <button class="btn btn-outline-danger btn-sm rounded-pill px-2.5 py-1" onclick="deleteCareer(${c.id}, '${c.title.replace(/'/g, "\\'")}')">
          <i class="bi bi-trash3"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function openAddCareerModal() {
  document.getElementById('career-form').reset();
  document.getElementById('edit-career-id').value = '';
  document.getElementById('career-modal-title').textContent = 'Add New Career Pathway';
  careerModalInstance.show();
}

async function openEditCareerModal(careerId) {
  const career = allCareersData.find(c => c.id === careerId);
  if (!career) return;

  document.getElementById('edit-career-id').value = career.id;
  document.getElementById('career-title').value = career.title;
  document.getElementById('career-category').value = career.category_id;
  document.getElementById('career-stream').value = career.stream;
  document.getElementById('career-image').value = career.image_url || '';
  document.getElementById('career-overview').value = career.overview;
  document.getElementById('career-education').value = career.education_path || '';
  document.getElementById('career-skills').value = career.required_skills || '';
  document.getElementById('career-roles').value = career.job_roles || '';
  document.getElementById('career-salary').value = career.salary_range || '';
  document.getElementById('career-growth').value = career.job_growth_outlook || '';

  document.getElementById('career-modal-title').textContent = 'Edit Career: ' + career.title;
  careerModalInstance.show();
}

async function handleSaveCareer(e) {
  e.preventDefault();
  const id = document.getElementById('edit-career-id').value;
  const data = {
    title: document.getElementById('career-title').value.trim(),
    category_id: document.getElementById('career-category').value,
    stream: document.getElementById('career-stream').value.trim(),
    image_url: document.getElementById('career-image').value.trim(),
    overview: document.getElementById('career-overview').value.trim(),
    education_path: document.getElementById('career-education').value.trim(),
    required_skills: document.getElementById('career-skills').value.trim(),
    job_roles: document.getElementById('career-roles').value.trim(),
    salary_range: document.getElementById('career-salary').value.trim(),
    job_growth_outlook: document.getElementById('career-growth').value.trim()
  };

  const btn = document.getElementById('btn-save-career');
  btn.disabled = true;

  let res;
  if (id) {
    res = await API.put(`/api/careers/${id}`, data);
  } else {
    res = await API.post('/api/careers', data);
  }

  btn.disabled = false;

  if (res.success) {
    showToast(res.message, 'success');
    careerModalInstance.hide();
    await loadAdminCareers();
    await loadDashboardStats();
  } else {
    showToast(res.message || 'Operation failed.', 'danger');
  }
}

async function deleteCareer(id, title) {
  if (confirm(`Are you sure you want to delete the career "${title}"? This cannot be undone.`)) {
    const res = await API.delete(`/api/careers/${id}`);
    if (res.success) {
      showToast(res.message, 'success');
      await loadAdminCareers();
      await loadDashboardStats();
    } else {
      showToast(res.message || 'Could not delete career.', 'danger');
    }
  }
}

// ==================== COURSE MANAGEMENT ====================
async function loadAdminCourses() {
  const res = await API.get('/api/courses?sort=name_asc');
  if (res.success && res.data) {
    allCoursesData = res.data;
    renderAdminCoursesTable();
  }
}

function renderAdminCoursesTable() {
  const tbody = document.getElementById('admin-courses-tbody');
  const term = (document.getElementById('admin-course-search').value || '').toLowerCase().trim();

  const filtered = allCoursesData.filter(crs => 
    crs.name.toLowerCase().includes(term) ||
    crs.category_name.toLowerCase().includes(term) ||
    crs.degree_level.toLowerCase().includes(term) ||
    crs.top_colleges.toLowerCase().includes(term)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No courses found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(crs => `
    <tr>
      <td>
        <div class="fw-bold">${crs.name}</div>
        <div class="small text-muted">${crs.career_title ? 'Direct Link: ' + crs.career_title : 'General Academic Program'}</div>
      </td>
      <td><span class="badge bg-light text-dark border">${crs.category_name}</span></td>
      <td><span class="badge bg-secondary-subtle text-dark">${crs.degree_level}</span></td>
      <td><span class="badge bg-primary-subtle text-primary">${crs.duration}</span></td>
      <td class="small text-truncate" style="max-width: 250px;">${crs.top_colleges}</td>
      <td class="text-end">
        <button class="btn btn-outline-primary btn-sm rounded-pill px-2.5 py-1 me-1" onclick="openEditCourseModal(${crs.id})">
          <i class="bi bi-pencil-square"></i> Edit
        </button>
        <button class="btn btn-outline-danger btn-sm rounded-pill px-2.5 py-1" onclick="deleteCourse(${crs.id}, '${crs.name.replace(/'/g, "\\'")}')">
          <i class="bi bi-trash3"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function openAddCourseModal() {
  document.getElementById('course-form').reset();
  document.getElementById('edit-course-id').value = '';
  document.getElementById('course-modal-title').textContent = 'Add Academic Course / Degree';
  courseModalInstance.show();
}

async function openEditCourseModal(courseId) {
  const crs = allCoursesData.find(c => c.id === courseId);
  if (!crs) return;

  document.getElementById('edit-course-id').value = crs.id;
  document.getElementById('course-name').value = crs.name;
  document.getElementById('course-category').value = crs.category_id;
  document.getElementById('course-career').value = crs.career_id || '';
  document.getElementById('course-degree').value = crs.degree_level;
  document.getElementById('course-duration').value = crs.duration;
  document.getElementById('course-eligibility').value = crs.eligibility;
  document.getElementById('course-subjects').value = crs.required_subjects;
  document.getElementById('course-colleges').value = crs.top_colleges;
  document.getElementById('course-admission').value = crs.admission_process || '';
  document.getElementById('course-fee').value = crs.avg_fee || '';
  document.getElementById('course-description').value = crs.description || '';

  document.getElementById('course-modal-title').textContent = 'Edit Course: ' + crs.name;
  courseModalInstance.show();
}

async function handleSaveCourse(e) {
  e.preventDefault();
  const id = document.getElementById('edit-course-id').value;
  const data = {
    name: document.getElementById('course-name').value.trim(),
    category_id: document.getElementById('course-category').value,
    career_id: document.getElementById('course-career').value || null,
    degree_level: document.getElementById('course-degree').value,
    duration: document.getElementById('course-duration').value.trim(),
    eligibility: document.getElementById('course-eligibility').value.trim(),
    required_subjects: document.getElementById('course-subjects').value.trim(),
    top_colleges: document.getElementById('course-colleges').value.trim(),
    admission_process: document.getElementById('course-admission').value.trim(),
    avg_fee: document.getElementById('course-fee').value.trim(),
    description: document.getElementById('course-description').value.trim()
  };

  const btn = document.getElementById('btn-save-course');
  btn.disabled = true;

  let res;
  if (id) {
    res = await API.put(`/api/courses/${id}`, data);
  } else {
    res = await API.post('/api/courses', data);
  }

  btn.disabled = false;

  if (res.success) {
    showToast(res.message, 'success');
    courseModalInstance.hide();
    await loadAdminCourses();
    await loadDashboardStats();
  } else {
    showToast(res.message || 'Operation failed.', 'danger');
  }
}

async function deleteCourse(id, name) {
  if (confirm(`Are you sure you want to delete the course "${name}"?`)) {
    const res = await API.delete(`/api/courses/${id}`);
    if (res.success) {
      showToast(res.message, 'success');
      await loadAdminCourses();
      await loadDashboardStats();
    } else {
      showToast(res.message || 'Could not delete course.', 'danger');
    }
  }
}

// ==================== INQUIRIES MANAGEMENT ====================
async function loadAdminInquiries() {
  const statusFilter = document.getElementById('admin-inquiry-filter').value;
  const res = await API.get(`/api/contact?status=${statusFilter}`);

  if (res.success && res.data) {
    allInquiriesData = res.data;
    renderAdminInquiriesTable();
  }
}

function renderAdminInquiriesTable() {
  const tbody = document.getElementById('admin-inquiries-tbody');

  if (allInquiriesData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No student guidance inquiries found.</td></tr>';
    return;
  }

  tbody.innerHTML = allInquiriesData.map(inq => {
    const badgeClass = inq.status === 'Resolved' ? 'status-Resolved'
      : inq.status === 'In Review' ? 'status-In-Review'
      : 'status-Pending';

    const dateStr = new Date(inq.created_at).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return `
      <tr>
        <td>
          <div class="fw-bold">${inq.student_name}</div>
          <div class="small text-muted"><i class="bi bi-envelope me-1"></i>${inq.student_email}</div>
          ${inq.student_phone ? `<div class="small text-muted"><i class="bi bi-telephone me-1"></i>${inq.student_phone}</div>` : ''}
        </td>
        <td>
          <div class="badge bg-light text-dark border mb-1">${inq.current_education || 'N/A'}</div>
          <div class="small text-primary fw-medium">${inq.interested_stream || 'General'}</div>
        </td>
        <td>
          <div class="small text-secondary text-truncate" style="max-width: 280px;" title="${inq.message}">
            ${inq.message}
          </div>
          ${inq.counsellor_reply ? `
            <div class="small text-success mt-1"><i class="bi bi-check2-all me-1"></i>Replied: ${inq.counsellor_reply.substring(0, 50)}...</div>
          ` : ''}
        </td>
        <td><span class="badge ${badgeClass} status-badge">${inq.status}</span></td>
        <td class="small text-muted">${dateStr}</td>
        <td class="text-end">
          <button class="btn btn-outline-primary btn-sm rounded-pill px-2.5 py-1 me-1" onclick="openReplyInquiryModal(${inq.id})">
            <i class="bi bi-reply"></i> Respond
          </button>
          <button class="btn btn-outline-danger btn-sm rounded-pill px-2.5 py-1" onclick="deleteInquiry(${inq.id})">
            <i class="bi bi-trash3"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openReplyInquiryModal(inquiryId) {
  const inq = allInquiriesData.find(i => i.id === inquiryId);
  if (!inq) return;

  document.getElementById('reply-inquiry-id').value = inq.id;
  document.getElementById('reply-student-name').textContent = inq.student_name;
  document.getElementById('reply-student-email').textContent = inq.student_email;
  document.getElementById('reply-student-phone').textContent = inq.student_phone || 'None';
  document.getElementById('reply-student-education').textContent = inq.current_education || 'N/A';
  document.getElementById('reply-student-stream').textContent = inq.interested_stream || 'General';
  document.getElementById('reply-student-message').textContent = inq.message;

  document.getElementById('reply-status').value = inq.status === 'Pending' ? 'In Review' : inq.status;
  document.getElementById('reply-counsellor-text').value = inq.counsellor_reply || '';

  inquiryModalInstance.show();
}

async function handleSaveInquiryReply(e) {
  e.preventDefault();
  const id = document.getElementById('reply-inquiry-id').value;
  const status = document.getElementById('reply-status').value;
  const counsellor_reply = document.getElementById('reply-counsellor-text').value.trim();

  const btn = document.getElementById('btn-save-reply');
  btn.disabled = true;

  const res = await API.put(`/api/contact/${id}`, { status, counsellor_reply });
  btn.disabled = false;

  if (res.success) {
    showToast('Guidance response recorded successfully!', 'success');
    inquiryModalInstance.hide();
    await loadAdminInquiries();
    await loadDashboardStats();
  } else {
    showToast(res.message || 'Could not update inquiry.', 'danger');
  }
}

async function deleteInquiry(id) {
  if (confirm('Delete this inquiry?')) {
    const res = await API.delete(`/api/contact/${id}`);
    if (res.success) {
      showToast(res.message, 'success');
      await loadAdminInquiries();
      await loadDashboardStats();
    }
  }
}

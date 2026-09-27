// Courses Catalog Page Logic
let debounceCourseTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadCourseCategoriesFilter(), loadCourseLevelsFilter()]);
  parseCourseUrlParams();
  loadCourses();

  // Attach Listeners
  document.getElementById('filter-course-search').addEventListener('input', () => {
    clearTimeout(debounceCourseTimer);
    debounceCourseTimer = setTimeout(loadCourses, 300);
  });

  document.getElementById('filter-course-category').addEventListener('change', loadCourses);
  document.getElementById('filter-course-level').addEventListener('change', loadCourses);
  document.getElementById('filter-course-sort').addEventListener('change', loadCourses);
});

function parseCourseUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  const catParam = urlParams.get('category_id');

  if (searchParam) {
    document.getElementById('filter-course-search').value = searchParam;
  }
  if (catParam) {
    const catSelect = document.getElementById('filter-course-category');
    catSelect.value = catParam;
  }
}

async function loadCourseCategoriesFilter() {
  const select = document.getElementById('filter-course-category');
  if (!select) return;

  const res = await API.get('/api/careers/categories');
  if (res.success && res.data) {
    res.data.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = `${cat.name} (${cat.course_count || 0})`;
      select.appendChild(opt);
    });
  }
}

async function loadCourseLevelsFilter() {
  const select = document.getElementById('filter-course-level');
  if (!select) return;

  const res = await API.get('/api/courses/degree-levels');
  if (res.success && res.data) {
    res.data.forEach(lvl => {
      const opt = document.createElement('option');
      opt.value = lvl;
      opt.textContent = lvl;
      select.appendChild(opt);
    });
  }
}

async function loadCourses() {
  const grid = document.getElementById('courses-grid');
  const countBadge = document.getElementById('course-count-badge');
  if (!grid) return;

  const search = document.getElementById('filter-course-search').value.trim();
  const category_id = document.getElementById('filter-course-category').value;
  const degree_level = document.getElementById('filter-course-level').value;
  const sort = document.getElementById('filter-course-sort').value;

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category_id && category_id !== 'all') params.append('category_id', category_id);
  if (degree_level && degree_level !== 'all') params.append('degree_level', degree_level);
  if (sort) params.append('sort', sort);

  grid.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2">Searching academic programs...</p>
    </div>
  `;

  const res = await API.get(`/api/courses?${params.toString()}`);

  if (!res.success || !res.data) {
    grid.innerHTML = '<div class="col-12 text-center text-danger py-4">Failed to load courses. Please try again.</div>';
    if (countBadge) countBadge.textContent = '0 Courses';
    return;
  }

  const courses = res.data;
  if (countBadge) countBadge.textContent = `${courses.length} Course${courses.length === 1 ? '' : 's'}`;

  if (courses.length === 0) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <div class="empty-state-icon"><i class="bi bi-mortarboard"></i></div>
          <h4 class="fw-bold mb-2">No Courses Matched Your Criteria</h4>
          <p class="text-muted mb-3">Try different search terms or clear your active filters.</p>
          <button class="btn btn-outline-primary btn-sm rounded-pill px-4" onclick="resetCourseFilters()">
            Clear Filters
          </button>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = courses.map(course => {
    const isFav = course.is_favorited > 0;
    const colleges = course.top_colleges
      ? course.top_colleges.split(',').slice(0, 3).map(c => `<span class="badge bg-light text-dark border me-1 mb-1">${c.trim()}</span>`).join('')
      : '';

    return `
      <div class="col-lg-6">
        <div class="card h-100 border-0 shadow-sm rounded-4 p-4 position-relative">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="d-flex flex-wrap gap-2">
              <span class="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1">
                <i class="bi bi-clock me-1"></i> ${course.duration}
              </span>
              <span class="badge bg-secondary-subtle text-dark rounded-pill px-2.5 py-1">
                ${course.degree_level}
              </span>
            </div>
            <button class="btn btn-light rounded-circle shadow-none bookmark-btn-course-${course.id} ${isFav ? 'text-danger' : 'text-secondary'}"
                    style="width: 36px; height: 36px; display:inline-flex; align-items:center; justify-content:center;"
                    onclick="toggleBookmark('course', ${course.id}, event)"
                    title="${isFav ? 'Remove bookmark' : 'Bookmark this course'}">
              <i class="bi bi-bookmark${isFav ? '-fill' : ''} fs-6"></i>
            </button>
          </div>

          <h5 class="fw-bold text-dark mb-2">${course.name}</h5>
          
          <div class="small text-muted mb-3">
            <i class="bi ${course.category_icon || 'bi-tag'} text-primary me-1"></i>
            <span>${course.category_name}</span>
            ${course.career_title ? `<span class="ms-2">&bull; Leads to: <strong>${course.career_title}</strong></span>` : ''}
          </div>

          <p class="text-secondary small mb-3 flex-grow-1">${course.description || 'Comprehensive curriculum preparing students for industry.'}</p>

          <div class="bg-light p-3 rounded-3 mb-3 small">
            <div class="mb-1"><strong><i class="bi bi-check2-circle text-success me-1"></i> Eligibility:</strong> ${course.eligibility}</div>
            <div><strong><i class="bi bi-journal-text text-primary me-1"></i> Key Subjects:</strong> ${course.required_subjects}</div>
          </div>

          <div class="mb-3">
            <div class="small fw-semibold text-secondary mb-1">Top Colleges Offering:</div>
            <div class="d-flex flex-wrap">${colleges}</div>
          </div>

          <div class="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
            <div class="small text-muted">
              <i class="bi bi-currency-rupee text-success fw-bold me-1"></i>
              <span class="fw-medium">${course.avg_fee || 'Govt Subsidized / Standard Fees'}</span>
            </div>
            <button class="btn btn-outline-primary btn-sm rounded-pill px-3" onclick="openCourseModal(${course.id})">
              Admission Details <i class="bi bi-arrow-up-right small"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function resetCourseFilters() {
  document.getElementById('filter-course-search').value = '';
  document.getElementById('filter-course-category').value = 'all';
  document.getElementById('filter-course-level').value = 'all';
  document.getElementById('filter-course-sort').value = 'name_asc';
  loadCourses();
}

// Open Course Detail Modal
async function openCourseModal(courseId) {
  const modalEl = document.getElementById('courseDetailModal');
  const modalContent = document.getElementById('courseModalContent');
  if (!modalEl || !modalContent) return;

  const bsModal = new bootstrap.Modal(modalEl);
  modalContent.innerHTML = `
    <div class="p-5 text-center">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Fetching course information...</p>
    </div>
  `;
  bsModal.show();

  const res = await API.get(`/api/courses/${courseId}`);
  if (!res.success || !res.data) {
    modalContent.innerHTML = `
      <div class="p-4 text-center">
        <p class="text-danger">Unable to load course details.</p>
        <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
      </div>
    `;
    return;
  }

  const crs = res.data;
  const isFav = crs.is_favorited > 0;

  modalContent.innerHTML = `
    <div class="modal-header">
      <div>
        <span class="badge bg-primary text-white rounded-pill px-3 py-1 me-2">${crs.degree_level}</span>
        <span class="badge bg-secondary-subtle text-dark rounded-pill px-2.5 py-1"><i class="bi bi-clock me-1"></i>${crs.duration}</span>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <h3 class="fw-bold mb-2">${crs.name}</h3>
      <div class="text-muted small mb-3">
        <i class="bi ${crs.category_icon || 'bi-tag'} text-primary me-1"></i> Discipline: ${crs.category_name}
        ${crs.career_title ? ` | Direct Career Pathway: <strong>${crs.career_title}</strong>` : ''}
      </div>

      <p class="text-secondary mb-4">${crs.description || 'In-depth program curriculum preparing students for industry.'}</p>

      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="p-3 bg-light rounded-3 h-100 border">
            <h6 class="fw-bold text-primary mb-2"><i class="bi bi-check-circle me-1"></i> Eligibility Benchmarks</h6>
            <p class="small mb-0">${crs.eligibility}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="p-3 bg-light rounded-3 h-100 border">
            <h6 class="fw-bold text-primary mb-2"><i class="bi bi-journal-code me-1"></i> Required Subjects (10+2 / Pre-Degree)</h6>
            <p class="small mb-0">${crs.required_subjects}</p>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <h6 class="fw-bold border-bottom pb-2 mb-2"><i class="bi bi-clipboard2-check text-primary me-2"></i>Admission & Entrance Exam Process</h6>
        <div class="p-3 bg-light rounded-3 border">
          <p class="small mb-0">${crs.admission_process || 'Merit-based admission or centralized entrance examination as per University criteria.'}</p>
        </div>
      </div>

      <div class="mb-4">
        <h6 class="fw-bold border-bottom pb-2 mb-2"><i class="bi bi-buildings text-primary me-2"></i>Premier Universities & Colleges Offering This Degree</h6>
        <div class="p-3 bg-light rounded-3 border">
          <p class="small mb-0">${crs.top_colleges}</p>
        </div>
      </div>

      <div>
        <h6 class="fw-bold border-bottom pb-2 mb-2"><i class="bi bi-cash-coin text-primary me-2"></i>Estimated Tuition & Expenses</h6>
        <div class="p-3 bg-light rounded-3 border">
          <p class="small mb-0 text-success fw-semibold">${crs.avg_fee || 'Varies widely based on government vs private institutions.'}</p>
        </div>
      </div>
    </div>
    <div class="modal-footer justify-content-between">
      <button class="btn btn-outline-danger btn-sm rounded-pill px-3 bookmark-btn-course-${crs.id} ${isFav ? 'active' : ''}" onclick="toggleBookmark('course', ${crs.id}, event)">
        <i class="bi bi-bookmark${isFav ? '-fill' : ''} me-1"></i> ${isFav ? 'Bookmarked' : 'Save to Bookmarks'}
      </button>
      <div class="d-flex gap-2">
        <a href="/contact.html?course=${encodeURIComponent(crs.name)}" class="btn btn-primary btn-sm rounded-pill px-3">
          <i class="bi bi-headset me-1"></i> Ask Guidance for this Course
        </a>
        <button type="button" class="btn btn-secondary btn-sm rounded-pill px-3" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  `;
}

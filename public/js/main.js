// Main Page Interactions & Catalog Loaders for Indian Higher Education
document.addEventListener('DOMContentLoaded', () => {
  initHeroSearch();
  loadHomeCategories();
  loadFeaturedCareers();
});

// Helper for Indian Currency / LPA Formatting
function formatIndianSalary(salaryStr) {
  if (!salaryStr) return '<span class="rupee-pill"><i class="bi bi-currency-rupee"></i> Competitive</span>';
  let clean = salaryStr;
  const parenIdx = salaryStr.indexOf('(');
  if (parenIdx !== -1) {
    clean = salaryStr.substring(0, parenIdx).trim();
  }
  if (!clean.includes('₹') && clean.toLowerCase().includes('level')) {
    return `<span class="rupee-pill"><i class="bi bi-award-fill"></i> ${clean}</span>`;
  }
  return `<span class="rupee-pill"><i class="bi bi-currency-rupee"></i> ${clean}</span>`;
}

// Setup Hero Search
function initHeroSearch() {
  const form = document.getElementById('hero-search-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('hero-search-input').value.trim();
    const type = document.getElementById('hero-type-select').value;

    if (type === 'courses') {
      window.location.href = `/courses.html?search=${encodeURIComponent(query)}`;
    } else {
      window.location.href = `/careers.html?search=${encodeURIComponent(query)}`;
    }
  });
}

// Load Categories
async function loadHomeCategories() {
  const grid = document.getElementById('categories-grid');
  if (!grid) return;

  const res = await API.get('/api/careers/categories');
  if (!res.success || !res.data) {
    grid.innerHTML = '<div class="col-12 text-center text-muted">Failed to load categories.</div>';
    return;
  }

  // Update stats if elements exist
  const catCareersTotal = res.data.reduce((acc, c) => acc + (c.career_count || 0), 0);
  const catCoursesTotal = res.data.reduce((acc, c) => acc + (c.course_count || 0), 0);
  const statCareersEl = document.getElementById('stat-careers');
  const statCoursesEl = document.getElementById('stat-courses');
  if (statCareersEl && catCareersTotal) statCareersEl.textContent = `${catCareersTotal}+`;
  if (statCoursesEl && catCoursesTotal) statCoursesEl.textContent = `${catCoursesTotal}+`;

  grid.innerHTML = res.data.map(cat => `
    <div class="col-lg-4 col-md-6">
      <div class="category-card" onclick="window.location.href='/careers.html?category_id=${cat.id}'">
        <div class="category-card-icon">
          <i class="bi ${cat.icon || 'bi-mortarboard'}"></i>
        </div>
        <h5 class="fw-bold mb-2">${cat.name}</h5>
        <p class="text-muted small mb-3 flex-grow-1">${cat.description || 'Explore careers and courses in this stream.'}</p>
        <div class="d-flex justify-content-between align-items-center pt-2 border-top">
          <span class="badge bg-primary-subtle text-primary fw-medium rounded-pill px-2.5 py-1">
            ${cat.career_count || 0} Pathways
          </span>
          <span class="badge bg-secondary-subtle text-secondary fw-medium rounded-pill px-2.5 py-1">
            ${cat.course_count || 0} Degree Programs
          </span>
        </div>
      </div>
    </div>
  `).join('');
}

// Load Featured Careers
async function loadFeaturedCareers() {
  const grid = document.getElementById('featured-careers-grid');
  if (!grid) return;

  const res = await API.get('/api/careers');
  if (!res.success || !res.data || res.data.length === 0) {
    grid.innerHTML = '<div class="col-12 text-center text-muted">No careers found.</div>';
    return;
  }

  // Pick top 6 careers
  const featured = res.data.slice(0, 6);

  grid.innerHTML = featured.map(career => {
    const isFav = career.is_favorited > 0;
    const skills = career.required_skills
      ? career.required_skills.split(',').slice(0, 3).map(s => `<span class="skill-tag">${s.trim()}</span>`).join('')
      : '';

    const salaryBadge = formatIndianSalary(career.salary_range);

    return `
      <div class="col-lg-4 col-md-6">
        <div class="custom-card">
          <div class="card-img-wrap">
            <img src="${career.image_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=80'}" alt="${career.title}" loading="lazy">
            <span class="card-badge-top"><i class="bi ${career.category_icon || 'bi-tag'} me-1"></i> ${career.category_name}</span>
            <button class="card-bookmark-btn bookmark-btn-career-${career.id} ${isFav ? 'active' : ''}"
                    onclick="toggleBookmark('career', ${career.id}, event)"
                    title="${isFav ? 'Remove bookmark' : 'Bookmark this career'}">
              <i class="bi bi-bookmark${isFav ? '-fill' : ''}"></i>
            </button>
          </div>
          <div class="p-4 d-flex flex-column flex-grow-1">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="stream-pill">
                <i class="bi bi-mortarboard-fill me-1"></i> ${career.stream}
              </span>
            </div>
            <h5 class="fw-bold mb-2 text-dark">${career.title}</h5>
            <p class="text-secondary small mb-3 flex-grow-1 line-clamp-2">
              ${career.overview}
            </p>
            
            <div class="mb-3">
              <div class="small fw-semibold text-secondary mb-1">Key Competencies:</div>
              <div class="d-flex flex-wrap">${skills}</div>
            </div>

            <div class="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
              <div>
                ${salaryBadge}
              </div>
              <button class="btn btn-outline-primary btn-sm rounded-pill px-3 fw-medium" onclick="openCareerModal(${career.id})">
                Roadmap <i class="bi bi-arrow-up-right small"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Open Career Detail Modal
async function openCareerModal(careerId) {
  const modalEl = document.getElementById('careerDetailModal');
  const modalContent = document.getElementById('careerModalContent');
  if (!modalEl || !modalContent) return;

  const bsModal = new bootstrap.Modal(modalEl);
  modalContent.innerHTML = `
    <div class="p-5 text-center">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Loading Indian career roadmap & eligibility...</p>
    </div>
  `;
  bsModal.show();

  const res = await API.get(`/api/careers/${careerId}`);
  if (!res.success || !res.data) {
    modalContent.innerHTML = `
      <div class="p-4 text-center">
        <p class="text-danger">Unable to load career details.</p>
        <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
      </div>
    `;
    return;
  }

  const c = res.data;
  const isFav = c.is_favorited > 0;

  const coursesList = c.courses && c.courses.length > 0
    ? c.courses.map(course => `
        <div class="col-md-6">
          <div class="p-3 border rounded-3 bg-light h-100">
            <div class="d-flex justify-content-between align-items-start">
              <h6 class="fw-bold mb-1">${course.name}</h6>
              <span class="badge bg-primary-subtle text-primary rounded-pill">${course.duration}</span>
            </div>
            <p class="small text-muted mb-2">${course.degree_level}</p>
            <div class="small mb-1"><strong>Eligibility:</strong> ${course.eligibility}</div>
            <div class="small text-secondary mb-1"><strong>Top Colleges:</strong> ${course.top_colleges}</div>
            <div class="small text-success fw-medium"><strong>Fee:</strong> ${course.avg_fee || 'Affordable Govt / Private fees'}</div>
          </div>
        </div>
      `).join('')
    : '<div class="col-12 text-muted small">No specific degrees linked yet. Browse Courses & Colleges tab.</div>';

  modalContent.innerHTML = `
    <div class="modal-header">
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-primary text-white rounded-pill px-3 py-1.5"><i class="bi ${c.category_icon || 'bi-briefcase'} me-1"></i> ${c.category_name}</span>
        <span class="badge bg-secondary-subtle text-dark rounded-pill px-2.5 py-1.5">${c.stream}</span>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <div class="row g-4 align-items-center mb-4">
        <div class="col-md-4">
          <img src="${c.image_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=80'}" class="img-fluid rounded-3 shadow-sm w-100" style="max-height: 200px; object-fit: cover;" alt="${c.title}">
        </div>
        <div class="col-md-8">
          <h3 class="fw-bold mb-2">${c.title}</h3>
          <p class="text-secondary mb-3">${c.overview}</p>
          <div class="d-flex flex-wrap gap-3 small">
            <div><i class="bi bi-currency-rupee text-success fs-6 me-1"></i><strong>Expected Compensation:</strong> ${c.salary_range || 'Competitive'}</div>
            <div><i class="bi bi-graph-up-arrow text-primary me-1"></i><strong>Market Outlook:</strong> ${c.job_growth_outlook || 'High Demand'}</div>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <h5 class="fw-bold border-bottom pb-2 mb-3"><i class="bi bi-mortarboard text-primary me-2"></i>Recommended Indian Education Pathway</h5>
        <div class="p-3 bg-light rounded-3 border">
          <p class="mb-0 text-dark">${c.education_path || 'Standard 10+2 stream followed by recognized undergraduate graduation and national entrance exams.'}</p>
        </div>
      </div>

      <div class="row g-4 mb-4">
        <div class="col-md-6">
          <h5 class="fw-bold border-bottom pb-2 mb-3"><i class="bi bi-tools text-primary me-2"></i>Key Skills & Competencies</h5>
          <div class="d-flex flex-wrap gap-1">
            ${c.required_skills ? c.required_skills.split(',').map(s => `<span class="skill-tag">${s.trim()}</span>`).join('') : '<span class="text-muted">Not specified</span>'}
          </div>
        </div>
        <div class="col-md-6">
          <h5 class="fw-bold border-bottom pb-2 mb-3"><i class="bi bi-diagram-3 text-primary me-2"></i>Typical Job Roles</h5>
          <p class="text-muted small">${c.job_roles || 'Executive and specialist positions'}</p>
        </div>
      </div>

      <div>
        <h5 class="fw-bold border-bottom pb-2 mb-3"><i class="bi bi-book text-primary me-2"></i>Associated Indian Degrees & Programs</h5>
        <div class="row g-3">
          ${coursesList}
        </div>
      </div>
    </div>
    <div class="modal-footer justify-content-between">
      <button class="btn btn-outline-danger btn-sm rounded-pill px-3 bookmark-btn-career-${c.id} ${isFav ? 'active' : ''}" onclick="toggleBookmark('career', ${c.id}, event)">
        <i class="bi bi-bookmark${isFav ? '-fill' : ''} me-1"></i> ${isFav ? 'Bookmarked' : 'Save to Bookmarks'}
      </button>
      <div class="d-flex gap-2">
        <a href="/contact.html?stream=${encodeURIComponent(c.category_name)}&career=${encodeURIComponent(c.title)}" class="btn btn-primary btn-sm rounded-pill px-3">
          <i class="bi bi-headset me-1"></i> Ask Counsellor About This
        </a>
        <button type="button" class="btn btn-secondary btn-sm rounded-pill px-3" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  `;
}

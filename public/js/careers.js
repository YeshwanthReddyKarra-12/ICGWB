// Careers Catalog Page Logic - Indian Education System
let debounceTimer = null;

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

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadCategoriesFilter(), loadStreamsFilter()]);
  parseUrlParams();
  loadCareers();

  // Attach Filter Listeners
  document.getElementById('filter-search').addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadCareers, 300);
  });

  document.getElementById('filter-category').addEventListener('change', loadCareers);
  document.getElementById('filter-stream').addEventListener('change', loadCareers);
  document.getElementById('filter-sort').addEventListener('change', loadCareers);
});

function parseUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  const catParam = urlParams.get('category_id');

  if (searchParam) {
    document.getElementById('filter-search').value = searchParam;
  }
  if (catParam) {
    const catSelect = document.getElementById('filter-category');
    catSelect.value = catParam;
  }
}

async function loadCategoriesFilter() {
  const select = document.getElementById('filter-category');
  if (!select) return;

  const res = await API.get('/api/careers/categories');
  if (res.success && res.data) {
    res.data.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = `${cat.name} (${cat.career_count || 0})`;
      select.appendChild(opt);
    });
  }
}

async function loadStreamsFilter() {
  const select = document.getElementById('filter-stream');
  if (!select) return;

  const res = await API.get('/api/careers/streams');
  if (res.success && res.data) {
    res.data.forEach(stream => {
      const opt = document.createElement('option');
      opt.value = stream;
      opt.textContent = stream;
      select.appendChild(opt);
    });
  }
}

async function loadCareers() {
  const grid = document.getElementById('careers-grid');
  const countBadge = document.getElementById('career-count-badge');
  if (!grid) return;

  const search = document.getElementById('filter-search').value.trim();
  const category_id = document.getElementById('filter-category').value;
  const stream = document.getElementById('filter-stream').value;
  const sort = document.getElementById('filter-sort').value;

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category_id && category_id !== 'all') params.append('category_id', category_id);
  if (stream && stream !== 'all') params.append('stream', stream);
  if (sort) params.append('sort', sort);

  grid.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2">Searching Indian career pathways...</p>
    </div>
  `;

  const res = await API.get(`/api/careers?${params.toString()}`);

  if (!res.success || !res.data) {
    grid.innerHTML = '<div class="col-12 text-center text-danger py-4">Failed to load careers. Please try again.</div>';
    if (countBadge) countBadge.textContent = '0 Careers';
    return;
  }

  const careers = res.data;
  if (countBadge) countBadge.textContent = `${careers.length} Pathway${careers.length === 1 ? '' : 's'}`;

  if (careers.length === 0) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <div class="empty-state-icon"><i class="bi bi-search"></i></div>
          <h4 class="fw-bold mb-2">No Matching Pathways Found</h4>
          <p class="text-muted mb-3">Try adjusting your keywords or clearing selected stream filters.</p>
          <button class="btn btn-outline-primary btn-sm rounded-pill px-4" onclick="resetFilters()">
            Clear Filters
          </button>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = careers.map(career => {
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
                Full Roadmap <i class="bi bi-arrow-up-right small"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function resetFilters() {
  document.getElementById('filter-search').value = '';
  document.getElementById('filter-category').value = 'all';
  document.getElementById('filter-stream').value = 'all';
  document.getElementById('filter-sort').value = 'title_asc';
  loadCareers();
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
    : '<div class="col-12 text-muted small">No specific courses directly linked yet. Check Courses & Colleges tab.</div>';

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
            <div><i class="bi bi-graph-up-arrow text-primary me-1"></i><strong>Market Outlook:</strong> ${c.job_growth_outlook || 'Positive'}</div>
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
          <p class="text-muted small">${c.job_roles || 'Executive and specialist roles'}</p>
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

// Saved Bookmarks Page Logic - Indian Education System
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
  const user = await checkAuth();
  if (!user) {
    document.getElementById('login-required-panel').classList.remove('d-none');
    document.getElementById('authenticated-favorites-panel').classList.add('d-none');
    return;
  }

  document.getElementById('login-required-panel').classList.add('d-none');
  document.getElementById('authenticated-favorites-panel').classList.remove('d-none');
  document.getElementById('favorites-total-badge').classList.remove('d-none');

  loadFavorites();
});

async function loadFavorites() {
  const careersGrid = document.getElementById('fav-careers-grid');
  const coursesGrid = document.getElementById('fav-courses-grid');
  const favCountEl = document.getElementById('fav-count');
  const countCareersEl = document.getElementById('count-careers');
  const countCoursesEl = document.getElementById('count-courses');

  const res = await API.get('/api/favorites');
  if (!res.success || !res.data) {
    careersGrid.innerHTML = '<div class="col-12 text-center text-danger">Failed to load bookmarks.</div>';
    coursesGrid.innerHTML = '<div class="col-12 text-center text-danger">Failed to load bookmarks.</div>';
    return;
  }

  const { careers, courses, totalCount } = res.data;

  favCountEl.textContent = totalCount;
  countCareersEl.textContent = careers.length;
  countCoursesEl.textContent = courses.length;

  // Render Careers
  if (careers.length === 0) {
    careersGrid.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <div class="empty-state-icon"><i class="bi bi-briefcase"></i></div>
          <h5 class="fw-bold mb-2">No Pathways Bookmarked Yet</h5>
          <p class="text-muted mb-3">Browse our Indian career catalog and click the bookmark icon on any pathway.</p>
          <a href="/careers.html" class="btn btn-outline-primary btn-sm rounded-pill px-4">
            Explore Indian Careers
          </a>
        </div>
      </div>
    `;
  } else {
    careersGrid.innerHTML = careers.map(c => `
      <div class="col-lg-4 col-md-6">
        <div class="custom-card">
          <div class="card-img-wrap">
            <img src="${c.image_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=80'}" alt="${c.title}">
            <span class="card-badge-top"><i class="bi ${c.category_icon || 'bi-tag'} me-1"></i> ${c.category_name}</span>
            <button class="card-bookmark-btn active"
                    onclick="toggleBookmark('career', ${c.id}, event)"
                    title="Remove bookmark">
              <i class="bi bi-trash3 text-danger"></i>
            </button>
          </div>
          <div class="p-4 d-flex flex-column flex-grow-1">
            <span class="stream-pill mb-2 align-self-start">
              <i class="bi bi-mortarboard-fill me-1"></i> ${c.stream}
            </span>
            <h5 class="fw-bold mb-2 text-dark">${c.title}</h5>
            <p class="text-secondary small mb-3 flex-grow-1 line-clamp-2">${c.overview}</p>
            <div class="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
              <div>
                ${formatIndianSalary(c.salary_range)}
              </div>
              <button class="btn btn-primary btn-sm rounded-pill px-3" onclick="openCareerModal(${c.id})">
                Roadmap
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Render Courses
  if (courses.length === 0) {
    coursesGrid.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <div class="empty-state-icon"><i class="bi bi-mortarboard"></i></div>
          <h5 class="fw-bold mb-2">No Degree Programs Bookmarked Yet</h5>
          <p class="text-muted mb-3">Browse Indian degrees, IIT/NIT/AIIMS colleges, and entrance exam requirements to bookmark top choices.</p>
          <a href="/courses.html" class="btn btn-outline-primary btn-sm rounded-pill px-4">
            Explore Courses
          </a>
        </div>
      </div>
    `;
  } else {
    coursesGrid.innerHTML = courses.map(crs => `
      <div class="col-lg-6">
        <div class="card h-100 border-0 shadow-sm rounded-4 p-4 position-relative">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="d-flex gap-2">
              <span class="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1">
                <i class="bi bi-clock me-1"></i> ${crs.duration}
              </span>
              <span class="badge bg-secondary-subtle text-dark rounded-pill px-2.5 py-1">
                ${crs.degree_level}
              </span>
            </div>
            <button class="btn btn-outline-danger btn-sm rounded-circle shadow-none"
                    style="width: 34px; height: 34px; display:inline-flex; align-items:center; justify-content:center;"
                    onclick="toggleBookmark('course', ${crs.id}, event)"
                    title="Remove bookmark">
              <i class="bi bi-trash3 fs-6"></i>
            </button>
          </div>

          <h5 class="fw-bold text-dark mb-1">${crs.name}</h5>
          <div class="small text-muted mb-2">
            <i class="bi ${crs.category_icon || 'bi-tag'} text-primary me-1"></i> ${crs.category_name}
            ${crs.career_title ? ` &bull; Direct Pathway: <strong>${crs.career_title}</strong>` : ''}
          </div>

          <p class="text-secondary small mb-3 flex-grow-1">${crs.description || 'Academic curriculum'}</p>

          <div class="bg-light p-3 rounded-3 mb-3 small">
            <div><strong><i class="bi bi-check2-circle text-success me-1"></i> Board Eligibility:</strong> ${crs.eligibility}</div>
          </div>

          <div class="d-flex justify-content-between align-items-center pt-2 border-top mt-auto">
            <div class="small text-muted">
              <i class="bi bi-buildings text-primary me-1"></i>
              <span class="fw-medium">${crs.top_colleges.split(',')[0]}</span>
            </div>
            <button class="btn btn-outline-primary btn-sm rounded-pill px-3" onclick="openCourseModal(${crs.id})">
              Details
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

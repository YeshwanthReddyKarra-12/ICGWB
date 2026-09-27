// Authentication & Navigation State Management
let currentUser = null;

async function checkAuth() {
  const res = await API.get('/api/auth/me');
  if (res.success && res.user) {
    currentUser = res.user;
    window.currentUser = currentUser;
  } else {
    currentUser = null;
    window.currentUser = null;
  }
  updateNavbarAuth();
  return currentUser;
}

function updateNavbarAuth() {
  const authNavContainer = document.getElementById('navbar-auth-container');
  if (!authNavContainer) return;

  if (currentUser) {
    if (currentUser.role === 'admin') {
      authNavContainer.innerHTML = `
        <li class="nav-item">
          <a class="nav-link btn btn-sm btn-outline-warning text-dark px-3 py-1 me-2 fw-semibold" href="/admin.html">
            <i class="bi bi-speedometer2 me-1"></i> Admin Panel
          </a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" role="button" data-bs-toggle="dropdown">
            <span class="badge bg-danger rounded-pill">Admin</span>
            <span>${currentUser.name}</span>
          </a>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm">
            <li><a class="dropdown-item" href="/admin.html"><i class="bi bi-gear me-2"></i> Manage Content</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="handleLogout()"><i class="bi bi-box-arrow-right me-2"></i> Logout</a></li>
          </ul>
        </li>
      `;
    } else {
      // Student
      authNavContainer.innerHTML = `
        <li class="nav-item">
          <a class="nav-link d-flex align-items-center gap-1 me-2" href="/favorites.html">
            <i class="bi bi-bookmark-heart text-danger fs-5"></i>
            <span>Bookmarks</span>
          </a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" role="button" data-bs-toggle="dropdown">
            <div class="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style="width:28px; height:28px; font-size:0.8rem;">
              ${currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span>${currentUser.name}</span>
          </a>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm">
            <li><span class="dropdown-item-text text-muted small"><i class="bi bi-envelope me-2"></i>${currentUser.email}</span></li>
            <li><a class="dropdown-item" href="/favorites.html"><i class="bi bi-bookmark-check me-2"></i> My Saved Items</a></li>
            <li><a class="dropdown-item" href="/contact.html#my-inquiries"><i class="bi bi-chat-left-dots me-2"></i> My Counsellor Inquiries</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="handleLogout()"><i class="bi bi-box-arrow-right me-2"></i> Logout</a></li>
          </ul>
        </li>
      `;
    }
  } else {
    // Unauthenticated
    authNavContainer.innerHTML = `
      <li class="nav-item me-2">
        <a class="btn btn-outline-primary btn-sm px-3 rounded-pill" href="/login.html">
          <i class="bi bi-box-arrow-in-right me-1"></i> Log In
        </a>
      </li>
      <li class="nav-item">
        <a class="btn btn-primary btn-sm px-3 rounded-pill text-white" href="/register.html">
          <i class="bi bi-person-plus me-1"></i> Student Register
        </a>
      </li>
    `;
  }
}

async function handleLogout() {
  if (confirm('Are you sure you want to log out?')) {
    const res = await API.post('/api/auth/logout', {});
    if (res.success) {
      showToast('You have been logged out.', 'info');
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 700);
    }
  }
}

// Automatically check auth on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

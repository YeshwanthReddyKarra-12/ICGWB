// API Client & Utility Functions
const API = {
  async get(endpoint) {
    try {
      const response = await fetch(endpoint, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      return await response.json();
    } catch (err) {
      console.error(`GET ${endpoint} failed:`, err);
      return { success: false, message: 'Network error or server unreachable.' };
    }
  },

  async post(endpoint, data) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (err) {
      console.error(`POST ${endpoint} failed:`, err);
      return { success: false, message: 'Network error or server unreachable.' };
    }
  },

  async put(endpoint, data) {
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (err) {
      console.error(`PUT ${endpoint} failed:`, err);
      return { success: false, message: 'Network error or server unreachable.' };
    }
  },

  async delete(endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      return await response.json();
    } catch (err) {
      console.error(`DELETE ${endpoint} failed:`, err);
      return { success: false, message: 'Network error or server unreachable.' };
    }
  }
};

// UI Toast Notification
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const bgClass = type === 'success' ? 'bg-success text-white'
    : type === 'danger' || type === 'error' ? 'bg-danger text-white'
    : type === 'warning' ? 'bg-warning text-dark'
    : 'bg-primary text-white';

  const icon = type === 'success' ? 'bi-check-circle-fill'
    : type === 'danger' || type === 'error' ? 'bi-exclamation-triangle-fill'
    : type === 'warning' ? 'bi-exclamation-circle-fill'
    : 'bi-info-circle-fill';

  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center ${bgClass} border-0 shadow-lg show mb-2`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body d-flex align-items-center gap-2">
        <i class="bi ${icon} fs-5"></i>
        <span>${message}</span>
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.appendChild(toastEl);

  setTimeout(() => {
    toastEl.classList.remove('show');
    setTimeout(() => toastEl.remove(), 400);
  }, 4000);
}

// Global Bookmark Toggle Function
async function toggleBookmark(itemType, itemId, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  const res = await API.post('/api/favorites/toggle', { item_type: itemType, item_id: itemId });

  if (res.status === 401 || (!res.success && res.message && res.message.includes('Authentication required'))) {
    showToast('Please log in as a student to bookmark items.', 'warning');
    setTimeout(() => {
      window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
    }, 1200);
    return;
  }

  if (res.success) {
    showToast(res.message, res.favorited ? 'success' : 'info');
    // Update button icons on page
    const btns = document.querySelectorAll(`.bookmark-btn-${itemType}-${itemId}`);
    btns.forEach(btn => {
      if (res.favorited) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="bi bi-bookmark-fill"></i>';
        btn.setAttribute('title', 'Remove bookmark');
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="bi bi-bookmark"></i>';
        btn.setAttribute('title', 'Save to bookmarks');
      }
    });

    // If on favorites page and unfavorited, reload favorites list
    if (window.location.pathname.includes('favorites.html') && typeof loadFavorites === 'function') {
      loadFavorites();
    }
  } else {
    showToast(res.message || 'Could not update bookmark.', 'danger');
  }
}

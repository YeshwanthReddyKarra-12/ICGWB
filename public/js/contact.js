// Counsellor Guidance Page Logic
document.addEventListener('DOMContentLoaded', async () => {
  const user = await checkAuth();
  prefillFromUserAndUrl(user);
  if (user) {
    loadMyInquiries();
  }

  // Handle Form Submission
  const form = document.getElementById('guidance-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
});

function prefillFromUserAndUrl(user) {
  if (user) {
    const nameInput = document.getElementById('student_name');
    const emailInput = document.getElementById('student_email');
    if (nameInput && !nameInput.value) nameInput.value = user.name;
    if (emailInput && !emailInput.value) emailInput.value = user.email;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const streamParam = urlParams.get('stream');
  const careerParam = urlParams.get('career');
  const courseParam = urlParams.get('course');

  const streamInput = document.getElementById('interested_stream');
  const messageInput = document.getElementById('message');

  if (streamParam && streamInput) {
    streamInput.value = streamParam;
  }

  if (careerParam && messageInput && !messageInput.value) {
    messageInput.value = `I am interested in pursuing a career as a ${careerParam}. Could you please guide me on the most suitable entrance tests and eligibility criteria?`;
  } else if (courseParam && messageInput && !messageInput.value) {
    messageInput.value = `I am looking into enrolling in ${courseParam}. What are the cutoff marks and preparation strategies recommended?`;
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('btn-submit-inquiry');
  const originalHtml = submitBtn.innerHTML;

  const data = {
    student_name: document.getElementById('student_name').value.trim(),
    student_email: document.getElementById('student_email').value.trim(),
    student_phone: document.getElementById('student_phone').value.trim(),
    current_education: document.getElementById('current_education').value,
    interested_stream: document.getElementById('interested_stream').value.trim(),
    message: document.getElementById('message').value.trim()
  };

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Submitting...';

  const res = await API.post('/api/contact', data);

  submitBtn.disabled = false;
  submitBtn.innerHTML = originalHtml;

  if (res.success) {
    showToast(res.message, 'success');
    document.getElementById('message').value = '';
    
    // Refresh student inquiries list
    if (window.currentUser) {
      loadMyInquiries();
    }
  } else {
    showToast(res.message || 'Failed to submit inquiry.', 'danger');
  }
}

async function loadMyInquiries() {
  const container = document.getElementById('my-inquiries-container');
  if (!container) return;

  const res = await API.get('/api/contact/my');
  if (!res.success || !res.data || res.data.length === 0) {
    container.innerHTML = `
      <div class="p-4 text-center bg-white rounded-4 border">
        <i class="bi bi-inbox fs-3 text-muted mb-2 d-block"></i>
        <h6 class="fw-semibold">No inquiries submitted yet.</h6>
        <p class="text-muted small mb-0">Fill out the form above if you need guidance on your career choices.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="row g-3">
      ${res.data.map(req => {
        const badgeClass = req.status === 'Resolved' ? 'status-Resolved'
          : req.status === 'In Review' ? 'status-In-Review'
          : 'status-Pending';

        const createdDate = new Date(req.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        return `
          <div class="col-12">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span class="badge ${badgeClass} status-badge me-2">${req.status}</span>
                  <span class="text-muted small">${createdDate}</span>
                </div>
                <span class="badge bg-light text-dark border small">${req.current_education || 'General'}</span>
              </div>

              <div class="mb-3">
                <div class="fw-semibold text-dark mb-1">Topic: <span class="text-primary">${req.interested_stream || 'Career Guidance'}</span></div>
                <p class="text-secondary small mb-0">${req.message}</p>
              </div>

              ${req.counsellor_reply ? `
                <div class="p-3 bg-light rounded-3 border-start border-4 border-success mt-2">
                  <div class="d-flex align-items-center gap-2 mb-1">
                    <i class="bi bi-patch-check-fill text-success"></i>
                    <strong class="small text-dark">Counsellor Response:</strong>
                  </div>
                  <p class="small text-secondary mb-0">${req.counsellor_reply}</p>
                </div>
              ` : `
                <div class="small text-muted fst-italic">
                  <i class="bi bi-hourglass-split me-1 text-warning"></i> Counsellor review in progress. You will see answers here once processed.
                </div>
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

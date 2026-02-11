const API_URL = '/api';
const PLACEHOLDER_IMG = '/assets/book-placeholder.svg';

let token = localStorage.getItem('token');
let role = localStorage.getItem('role');

const bookId = (() => {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[0] === 'books' ? parts[1] : null;
})();

// Auth UI (shared patterns with index page)
function checkAuth() {
  token = localStorage.getItem('token');
  role = localStorage.getItem('role');

  const showAuthBtn = document.getElementById('showAuthBtn');
  const userInfo = document.getElementById('userInfo');
  const logoutBtn = document.getElementById('logoutBtn');
  const authModal = document.getElementById('authModal');

  if (token) {
    showAuthBtn.style.display = 'none';
    userInfo.style.display = 'inline';
    logoutBtn.style.display = 'inline-block';
    authModal.style.display = 'none';
    userInfo.innerText = role === 'admin' ? 'Signed in: Admin' : 'Signed in: User';
  } else {
    showAuthBtn.style.display = 'inline-block';
    userInfo.style.display = 'none';
    logoutBtn.style.display = 'none';
    authModal.style.display = 'none';
  }
}

document.getElementById('showAuthBtn').onclick = () => {
  document.getElementById('authModal').style.display = 'flex';
};

let isLogin = true;
document.getElementById('toggleAuthText').onclick = () => {
  isLogin = !isLogin;
  document.getElementById('authTitle').innerText = isLogin ? 'Sign in' : 'Create account';
  document.getElementById('authSubmit').innerText = isLogin ? 'Sign in' : 'Create';
};

document.getElementById('authForm').onsubmit = async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const roleVal = document.getElementById('roleSelect').value;

  const path = isLogin ? '/auth/login' : '/auth/register';
  const res = await fetch(API_URL + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role: roleVal })
  });

  const data = await res.json();
  if (res.ok) {
    if (isLogin) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      checkAuth();
      // Show review form immediately after login
      hydrateReviewUI();
      document.getElementById('authModal').style.display = 'none';
    } else {
      alert('Account created! Now sign in.');
      isLogin = true;
      document.getElementById('authTitle').innerText = 'Sign in';
      document.getElementById('authSubmit').innerText = 'Sign in';
    }
  } else {
    alert(data.message || data.error || 'Auth failed');
  }
};

document.getElementById('logoutBtn').onclick = () => {
  localStorage.clear();
  checkAuth();
  hydrateReviewUI();
};

function setImgWithFallback(imgEl, url) {
  imgEl.src = url || PLACEHOLDER_IMG;
  imgEl.onerror = () => {
    imgEl.onerror = null;
    imgEl.src = PLACEHOLDER_IMG;
  };
}

function money(n) {
  const num = Number(n ?? 0);
  return `$${num.toFixed(2)}`;
}

async function loadBook() {
  if (!bookId) {
    document.getElementById('detailsName').innerText = 'Book not found';
    return;
  }

  const res = await fetch(`${API_URL}/books/${bookId}`);
  const book = await res.json().catch(() => ({}));
  if (!res.ok) {
    document.getElementById('detailsName').innerText = book.message || book.error || 'Book not found';
    return;
  }

  document.title = `${book.name} — Library Store`;
  document.getElementById('detailsName').innerText = book.name;
  document.getElementById('detailsAuthor').innerText = `Author: ${book.author}`;
  document.getElementById('detailsPrice').innerText = money(book.cost);
  document.getElementById('detailsDescription').innerText = book.description || 'No description yet.';
  setImgWithFallback(document.getElementById('detailsImage'), book.image);

  // Admin actions (delete only, edit happens on home page)
  const actions = document.getElementById('detailsAdminActions');
  if (role === 'admin' && token) {
    actions.style.display = 'flex';
    actions.innerHTML = `
      <button class="btn btn-danger" id="deleteBookBtn">Delete book</button>
    `;
    document.getElementById('deleteBookBtn').onclick = async () => {
      if (!confirm('Delete this book?')) return;
      const delRes = await fetch(`${API_URL}/books/${bookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!delRes.ok) {
        const err = await delRes.json().catch(() => ({}));
        alert(err.message || err.error || 'Failed to delete');
        return;
      }
      window.location.href = '/';
    };
  } else {
    actions.style.display = 'none';
  }
}

function hydrateReviewUI() {
  const wrap = document.getElementById('reviewFormWrap');
  const hint = document.getElementById('reviewAuthHint');
  if (token) {
    wrap.style.display = 'block';
    hint.style.display = 'none';
  } else {
    wrap.style.display = 'none';
    hint.style.display = 'block';
  }
}

function renderReviews(reviews) {
  const list = document.getElementById('reviewsList');
  if (!Array.isArray(reviews) || reviews.length === 0) {
    list.innerHTML = `<div class="empty">No reviews yet.</div>`;
    document.getElementById('reviewsCount').innerText = '';
    return;
  }

  document.getElementById('reviewsCount').innerText = `${reviews.length} review${reviews.length === 1 ? '' : 's'}`;
  list.innerHTML = reviews
    .map(r => {
      const escapeHtml = (value) =>
        String(value ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');

      const username = escapeHtml(r.user?.username || 'User');
      const rating = escapeHtml(r.rating ?? '-');
      const text = escapeHtml(r.text || '');
      return `
        <div class="review-item">
          <div class="review-head">
            <strong>${username}</strong>
            <span class="stars">Rating: ${rating}/5</span>
          </div>
          <div class="review-body">${text}</div>
        </div>
      `;
    })
    .join('');
}

async function loadReviews() {
  if (!bookId) return;
  const res = await fetch(`${API_URL}/books/${bookId}/reviews`);
  const reviews = await res.json().catch(() => []);
  renderReviews(reviews);
}

async function submitReview() {
  const text = document.getElementById('reviewText').value.trim();
  const rating = Number(document.getElementById('reviewRating').value);
  if (!text) {
    alert('Please write a review.');
    return;
  }

  const res = await fetch(`${API_URL}/books/${bookId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ text, rating })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.message || err.error || 'Failed to submit review');
    return;
  }

  document.getElementById('reviewText').value = '';
  await loadReviews();
}

document.addEventListener('DOMContentLoaded', async () => {
  checkAuth();
  hydrateReviewUI();

  document.getElementById('submitReviewBtn').onclick = submitReview;

  await loadBook();
  await loadReviews();
});


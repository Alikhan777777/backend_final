const API_URL = '/api';
const PLACEHOLDER_IMG = '/assets/book-placeholder.svg';
let token = localStorage.getItem('token');
let role = localStorage.getItem('role');

const state = {
    search: '',
    sort: 'newest',
    page: 1,
    limit: 9
};

// При загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    wireToolbar();
    loadBooks();
});

// Проверка авторизации и отображение интерфейса в зависимости от роли
function checkAuth() {
    // Обновим токен и роль из localStorage на случай изменений
    token = localStorage.getItem('token');
    role = localStorage.getItem('role');

    const showAuthBtn   = document.getElementById('showAuthBtn');
    const userInfo      = document.getElementById('userInfo');
    const logoutBtn     = document.getElementById('logoutBtn');
    const adminSection  = document.getElementById('adminSection');
    const authModal     = document.getElementById('authModal');
    const mainContent   = document.querySelector('.main-content');

    if (token) {
        // Пользователь залогинен
        showAuthBtn.style.display  = 'none';
        userInfo.style.display     = 'inline';
        logoutBtn.style.display    = 'inline-block';
        authModal.style.display    = 'none';

        // Текст для разных ролей
        if (role === 'admin') {
            userInfo.innerText = 'Signed in: Admin';
            adminSection.style.display = 'block';   // Админ видит форму добавления книг и т.п.
            mainContent?.classList.remove('no-admin');
        } else {
            userInfo.innerText = 'Signed in: User';
            adminSection.style.display = 'none';    // Обычный пользователь не видит админ‑форму
            mainContent?.classList.add('no-admin');
        }
    } else {
        // Не авторизован — обычный гость: просто показываем кнопку "Войти / Регистрация"
        // Сами книги остаются видимыми для всех.
        showAuthBtn.style.display  = 'inline-block';
        userInfo.style.display     = 'none';
        logoutBtn.style.display    = 'none';
        adminSection.style.display = 'none';
        mainContent?.classList.add('no-admin');
        // Модалка по умолчанию скрыта и открывается только по кнопке
        authModal.style.display    = 'none';
    }
}
// Показать модалку входа
document.getElementById('showAuthBtn').onclick = () => document.getElementById('authModal').style.display = 'flex';

// Логин / Регистрация
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
            document.getElementById('authModal').style.display = 'none';
        } else {
            alert('Account created! Now sign in.');
            isLogin = true;
            document.getElementById('authTitle').innerText = 'Sign in';
            document.getElementById('authSubmit').innerText = 'Sign in';
        }
    } else { alert(data.message || data.error || 'Auth failed'); }
};

// Выход
document.getElementById('logoutBtn').onclick = () => {
    localStorage.clear();
    checkAuth();
};

// Форма добавления/редактирования книг (доступна только администратору)
const bookForm = document.getElementById('bookForm');
if (bookForm) {
    bookForm.onsubmit = async (e) => {
        e.preventDefault();

        const id    = document.getElementById('bookId').value;
        const name  = document.getElementById('name').value;
        const author= document.getElementById('author').value;
        const cost  = Number(document.getElementById('cost').value);
        const image = document.getElementById('image')?.value?.trim() || '';
        const description = document.getElementById('description')?.value?.trim() || '';

        // Определяем метод и URL: если есть id — обновление, иначе создание
        const method = id ? 'PUT' : 'POST';
        const url    = id ? `${API_URL}/books/${id}` : `${API_URL}/books`;

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // токен администратора
            },
            body: JSON.stringify({ name, author, cost, image, description })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            alert(data.message || data.error || 'Ошибка при сохранении книги');
            return;
        }

        // Очистить форму и перезагрузить список книг
        document.getElementById('bookId').value = '';
        bookForm.reset();
        const formTitle = document.getElementById('formTitle');
        if (formTitle) formTitle.innerText = 'Add book';
        state.page = 1;
        loadBooks();
    };
}

function money(n) {
    const num = Number(n ?? 0);
    return `$${num.toFixed(2)}`;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function truncate(text, max = 120) {
    const s = String(text || '');
    if (s.length <= max) return s;
    return s.slice(0, max).trimEnd() + '…';
}

function setImgWithFallback(imgEl, url) {
    imgEl.src = url || PLACEHOLDER_IMG;
    imgEl.onerror = () => {
        imgEl.onerror = null;
        imgEl.src = PLACEHOLDER_IMG;
    };
}

function wireToolbar() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    let t = null;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(t);
            t = setTimeout(() => {
                state.search = searchInput.value.trim();
                state.page = 1;
                loadBooks();
            }, 250);
        });
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            state.sort = sortSelect.value;
            state.page = 1;
            loadBooks();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (state.page > 1) {
                state.page -= 1;
                loadBooks();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            state.page += 1;
            loadBooks();
        });
    }
}

// Загрузка книг
async function loadBooks() {
    const qs = new URLSearchParams({
        search: state.search || '',
        sort: state.sort || 'newest',
        page: String(state.page),
        limit: String(state.limit)
    });

    const res = await fetch(`${API_URL}/books?${qs.toString()}`);
    const payload = await res.json().catch(() => ({}));
    const books = Array.isArray(payload) ? payload : payload.items || [];
    const pagination = Array.isArray(payload) ? null : payload.pagination || null;

    const list = document.getElementById('booksList');
    list.innerHTML = '';

    if (!books.length) {
        list.innerHTML = `<div class="empty">No books found.</div>`;
    } else {
        books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';

            const safeName = escapeHtml(book.name);
            const safeAuthor = escapeHtml(book.author);
            const safeDesc = escapeHtml(truncate(book.description || '', 120));

            card.innerHTML = `
                <div class="book-cover-wrap">
                    <img class="book-cover" alt="Book cover" />
                </div>
                <div class="book-body">
                    <h3 class="book-title">${safeName}</h3>
                    <div class="book-meta">by <span class="book-author">${safeAuthor}</span></div>
                    <div class="book-price">${money(book.cost)}</div>
                    <p class="book-desc">${safeDesc || 'No description yet.'}</p>
                    <div class="book-actions">
                        <a class="btn btn-primary btn-sm" href="/books/${book._id}">View details</a>
                        ${token && role === 'admin' ? `<button class="btn btn-sm" data-edit="${book._id}">Edit</button>` : ''}
                        ${token && role === 'admin' ? `<button class="btn btn-danger btn-sm" data-del="${book._id}">Delete</button>` : ''}
                    </div>
                </div>
            `;

            const img = card.querySelector('img.book-cover');
            if (img) setImgWithFallback(img, book.image);

            const editBtn = card.querySelector('[data-edit]');
            if (editBtn) {
                editBtn.addEventListener('click', () => startEditBook(book));
            }
            const delBtn = card.querySelector('[data-del]');
            if (delBtn) {
                delBtn.addEventListener('click', () => deleteBook(delBtn.getAttribute('data-del')));
            }

            list.appendChild(card);
        });
    }

    // Pagination UI
    const paginationWrap = document.getElementById('pagination');
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    if (paginationWrap && pagination) {
        paginationWrap.style.display = 'flex';
        if (pageInfo) {
            pageInfo.innerText = `Page ${pagination.page} of ${pagination.totalPages} • ${pagination.total} total`;
        }
        if (prevBtn) prevBtn.disabled = pagination.page <= 1;
        if (nextBtn) nextBtn.disabled = pagination.page >= pagination.totalPages;
        state.page = pagination.page; // keep in sync if backend clamps
    } else if (paginationWrap) {
        paginationWrap.style.display = 'none';
    }
}

// Заполнить форму администратора данными книги для редактирования
async function startEditBook(bookOrId) {
    const idInput     = document.getElementById('bookId');
    const nameInput   = document.getElementById('name');
    const authorInput = document.getElementById('author');
    const costInput   = document.getElementById('cost');
    const imageInput  = document.getElementById('image');
    const descInput   = document.getElementById('description');
    const formTitle   = document.getElementById('formTitle');

    if (!idInput || !nameInput || !authorInput || !costInput) return;

    let book = bookOrId;
    // If only an id was passed, fetch the book (fallback)
    if (typeof bookOrId === 'string') {
        const res = await fetch(`${API_URL}/books/${bookOrId}`);
        book = await res.json().catch(() => ({}));
        if (!res.ok) {
            alert(book.message || book.error || 'Failed to load book');
            return;
        }
    }

    idInput.value       = book._id;
    nameInput.value     = book.name || '';
    authorInput.value   = book.author || '';
    costInput.value     = Number(book.cost ?? 0);
    if (imageInput) imageInput.value = book.image || '';
    if (descInput) descInput.value = book.description || '';

    if (formTitle) {
        formTitle.innerText = 'Edit book';
    }

    // Прокрутить к форме, чтобы администратор сразу увидел её
    document.getElementById('adminSection')?.scrollIntoView({ behavior: 'smooth' });
}

// Удаление (Admin)
async function deleteBook(id) {
    if (!confirm('Delete this book?')) return;
    await fetch(`${API_URL}/books/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (state.page > 1) state.page = 1;
    loadBooks();
}


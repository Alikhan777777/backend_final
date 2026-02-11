## Book Library – Assignment 4

Role‑based online library / mini bookstore built with **Node.js, Express, MongoDB, and a vanilla JS frontend**.  
Admins manage the catalog, while regular users browse books, open a dedicated details page, and leave reviews.

### Features

- **Authentication & Roles**
  - JWT‑based login / registration.
  - Roles: `admin` and `user`, stored on the `User` model.
  - UI adapts to role (admin panel vs. regular user view).

- **Books**
  - Public endpoints to list all books and fetch a single book by id.
  - Admin‑only endpoints to create, update, and delete books.
  - Extended book model with:
    - `image` (cover URL, with placeholder if empty or broken).
    - `description` (long text).
  - Grid “gallery” layout of book cards with:
    - Cover image, title, author, price, and short description preview.
    - “View details” button linking to `/books/:id`.

- **Book Details Page**
  - Route: `/books/:id`.
  - Big cover image, full title, author, price, and full description.
  - Reviews list and add‑review form (for logged‑in users).

- **Reviews**
  - Authenticated users can add **detailed text reviews** with a **1–5 rating**.
  - Reviews are linked to a specific book and user and shown under that book.

- **Search, Sort, Pagination**
  - Search by book name.
  - Sorting options (newest, title, author, price).
  - Simple page‑based pagination on the book list.

### Tech Stack

- Backend: **Node.js**, **Express**
- Database: **MongoDB** with **Mongoose**
- Auth: **JWT** with role‑based access control
- Frontend: Static **HTML/CSS/JS** (served from `frontend/` by Express)

### Getting Started

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

Create a `.env` file in the project root:

```bash
MONGODB_URI=mongodb://localhost:27017/assignment4
JWT_SECRET=supersecretkey
PORT=3000
```

Adjust `MONGODB_URI` and `PORT` as needed for your environment.

3. **Run the server**

```bash
node server.js
```

This delegates to `backend/server.js`.  
The app will start on `http://localhost:3000` (or your configured `PORT`).

4. **Open the UI**

- Go to `http://localhost:3000` in your browser.
- Use the **“Sign in”** button in the header to create:
  - An **admin** account (select role “Admin”).
  - A **user** account (select role “User”).

### Usage Overview

- **Admin**
  - After logging in as admin, you see the **admin section** on the left.
  - Add or edit books (name, author, price, image URL, description).
  - Delete books via the **Delete** button on each card or on the details page.

- **User / Guest**
  - Can browse the grid of book cards without logging in.
  - Use search, sort, and pagination controls above the gallery.
  - Click **“View details”** on any card to open the dedicated book page.
  - After logging in as a regular user, you can:
    - Leave a **detailed review** and choose a **rating 1–5**.
    - See all reviews with username and rating under each book.

### Project Structure (key files)

- `server.js` – Thin entrypoint that boots `backend/server.js`.

- `backend/`
  - `backend/server.js` – Express app, static frontend hosting, and API route mounting.
  - `backend/config/db.js` – MongoDB connection logic.
  - `backend/models/` – `User`, `Book`, `Review` Mongoose models.
  - `backend/controllers/` – Business logic for auth, books, and reviews.
  - `backend/router/` – Express routers for `/auth`, `/books`, and nested `/books/:bookId/reviews`.
  - `backend/middleware/authMiddleware.js` – JWT auth and admin authorization.

- `frontend/`
  - `frontend/index.html` – Main catalog page (auth modal + book gallery).
  - `frontend/book.html` – Book details + reviews page.
  - `frontend/style.css` – Shared styling (dark, card‑based UI).
  - `frontend/script.js` – Catalog logic (auth UI, search/sort/pagination, admin CRUD).
  - `frontend/book.js` – Details page logic (book info + reviews).
  - `frontend/assets/book-placeholder.svg` – Default cover image when no URL is provided.

### Notes

- Reviews support ratings **1–5** (validated at schema level).
- Make sure MongoDB is reachable (and `MONGODB_URI` is correct) before starting the server.

# backend_final

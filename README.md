# 🌐 NexaCloud – Cloud Server Management (Full-stack)

## 📌 Track Chosen
**Track C — Full-stack (Backend + Frontend )**

This project implements a **Cloud Server Management prototype** where users can:
- Manage cloud servers with full CRUD operations
- Search, filter, sort, and paginate servers
- Authenticate via a simple login system
- Perform bulk actions 
- Handle debugging challenges such as query optimization and validation race conditions

---

## ⚡ Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/raseldev99/server-task.git
cd server-task
```

### 2. Backend Setup (Laravel 12)
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
**Runs at:** http://localhost:8000

### 3. Frontend Setup (Vue 3 + Vite + TailwindCSS)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
**Runs at:** http://localhost:3000


# 🐳 Docker Setup

## Prerequisites

Make sure you have Docker and Docker Compose installed on your system.

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/raseldev99/server-task.git
cd server-task
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
cd ..
```

### 3. Start Docker Containers

```bash
docker-compose up -d
```

### 4. Setup Backend

```bash
docker exec -it nexacloud_backend bash
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
exit
```

## Access URLs

- **Frontend**: 👉 http://localhost:3000
- **Backend API**: 👉 http://localhost:8000


### 4. Login Credentials
Seeded default user:
- **Email:** test@example.com
- **Password:** 12345678

---

## 📑 API Documentation

## 🔗 Postman Collection
For detailed examples and testing, check the Postman documentation:  
[View Postman Docs](https://documenter.getpostman.com/view/38296105/2sB3HhrMb6)

---

## 🔐 Authentication

- **POST** `/api/login`  
  Login with email & password → returns API token

- **POST** `/api/register`  
  Register a new user

- **GET** `/api/me`  
  Get authenticated user details

- **PATCH** `/api/profile-update`  
  Update user profile

- **PUT** `/api/change-password`  
  Change account password

- **POST** `/api/logout`  
  Logout user


## 🖥️ Server Management

- **GET** `/api/servers`  
  Get all servers (supports search, filter, sort, pagination)

- **POST** `/api/servers`  
  Create a new server

- **PATCH** `/api/servers/{id}`  
  Update server details

- **GET** `/api/servers/{id}`  
  View server details

- **GET** `/api/servers/dashboard-stats`  
  Get server dashboard statistics

- **GET** `/api/servers/last-year-stats`  
  Get last year’s server statistics


### Validation Rules
- `name` → unique per provider
- `ip_address` → valid IPv4 & globally unique
- `cpu_cores` → 1–128
- `ram_mb` → 512–1048576
- `storage_gb` → 10–1048576

---
## Example of API Response Output

### Successful Login Response
```json
{
  "success": true,
  "message": "Login Successful",
  "status_code": 200,
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "name": "Test User"
    },
    "token": {
      "token_type": "Bearer",
      "access_token": "5|Y9zNNCTpKZHyNCZzIr05Wo5xhpFap3QSZfqzh3gg6545baf8"
    }
  },
  "timestamp": "2025-09-13T14:31:15.362266Z"
}
```

### Validation Error Response
```json
{
    "success": false,
    "message": "The email field is required. (and 1 more error)",
    "status_code": 422,
    "error_code": "VALIDATION_ERROR",
    "errors": {
        "email": [
            "The email field is required."
        ],
        "password": [
            "The password field is required."
        ]
    },
    "timestamp": "2025-08-29T17:18:44.017877Z"
}
```

### Wrong Credentials
```json
{
    "success": false,
    "message": "These credentials do not match our records.",
    "status_code": 401,
    "error_code": "UNAUTHORIZED",
    "timestamp": "2025-08-29T17:19:52.222472Z"
}
```

### Server list with pagination response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "status_code": 200,
  "data": [
    {
      "id": 1105,
      "name": "Qui qui expedita.",
      "ip_address": "255.135.212.133",
      "provider": "other",
      "cpu_cores": 9,
      "ram_mb": 15313,
      "storage_gb": 964403,
      "status": "active"
    },
    {
      "id": 1208,
      "name": "Est ut.",
      "ip_address": "25.139.171.183",
      "provider": "vultr",
      "cpu_cores": 9,
      "ram_mb": 25788,
      "storage_gb": 106636,
      "status": "active"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 20,
    "total": 2,
    "from": 1,
    "to": 2,
    "has_more_pages": false
  },
  "links": {
    "first": "https://nexacloud-backend.reportdorkar.com/api/servers?page=1",
    "last": "https://nexacloud-backend.reportdorkar.com/api/servers?page=1",
    "prev": null,
    "next": null
  },
  "timestamp": "2025-09-13T14:45:42.073532Z"
}
```

---

## 🤖 AI Collaboration Process

### Tools Used
This project was built with the assistance of AI tools to improve efficiency, maintain best practices, and ensure a clean architecture.
 
**ChatGPT & Claude AI** → used collaboratively for:
    - Generating boilerplate code (Docker setup, validation snippets, configs)
    - Reviewing and optimizing project structure
    - Following best practices and suggesting improvements
    - Refactoring code for readability and performance
    - Providing debugging hints and troubleshooting support
    - Enhancing code comments and documentation
    - Assisting with README scaffolding and project guidelines

### What I Asked & Why
- Asked for **optimized project structure** → to ensure scalability and clean separation of concerns
- Asked for **boilerplate code** → to save time on setup
- Asked for **debugging hints** → when queries were slow or validation was failing under concurrency
- Asked for **refactoring tips** → to improve readability, maintainability, and follow best practices

### ✅ Accepted vs. Rewritten

While collaborating with AI tools, not all generated code was used as-is.  
The workflow followed this process:

1. **Preview & Understanding** → I carefully reviewed AI-suggested code to fully understand its purpose.
2. **Accepted Code** → If the code aligned with project requirements and best practices, I directly integrated it.
3. **Rewritten Code** → In cases where the AI output was not optimal, I refactored or rewrote the code while keeping the core logic in mind.
4. **Bug Fixes** → After implementing AI-generated or refactored code, if any issues or bugs occurred during testing, I debugged and fixed them manually.

This ensured that the final implementation was both **AI-assisted** and **developer-verified**, resulting in reliable and production-ready code.

---

## 🐛 Debugging Journey

I focused on two debugging challenges:

### 1. Slow Query (5k+ records)
**Issue:** Server list API was slow for large datasets

**Fixes:**
- Added DB indexes (`name`, `provider`,`status`, `created_at`)
- Implemented caching layer for frequent queries

**Result:** Query time reduced drastically

### 2. Validation Edge Case (Duplicate IPs)
**Issue:** Concurrent requests could create duplicate `ip_address`

**Fixes:**
- Added unique DB constraint on `ip_address`
- Used transactions for safe concurrent writes

---

## 🛠️ Tech Decisions & Trade-offs

### Choices
- **Laravel 12 + Sanctum** → Rapid backend prototyping with secure API tokens
- **Vue 3 + TailwindCSS + PrimeVue** → Modern, lightweight UI
- **MySQL** → Relational DB with strong indexing & constraint support
- **Docker** → Optional but ensures consistent environment

## ⏱️ Time Spent
- **Backend (CRUD, Auth, Validation):** 5 hrs
- **Frontend (UI, Forms, State Mgmt):** 12 hrs
- **Debugging Challenges:** 1.5 hrs
- **Documentation & Cleanup:** 1 hr
- **Total:** ~19.5 hrs (slightly above the 8h timebox)

---

---

## ✅ Notes for Reviewers
- Full-stack implementation with working backend, frontend, and auth
- Debugging challenges solved (query optimization + concurrency validation)
- AI used responsibly with corrections & documentation
- Project scalable to 5k+ records

---

## 🚀 Getting Started
1. Follow the setup instructions above
2. Access the frontend at https://nexacloud.reportdorkar.com
3. Login with the provided credentials
4. Start managing your cloud servers!

## 🤝 Contributing
Feel free to submit issues and enhancement requests!

## 📄 License
This project is licensed under the MIT License.
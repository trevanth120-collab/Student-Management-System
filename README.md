
# Student Management System

A web-based Student Management System developed to manage student records efficiently.

This project allows an administrator to securely log in and perform student record management operations through a simple web interface.

## Project Overview

The application connects a frontend built with HTML, CSS and JavaScript to a Python FastAPI backend, with MySQL used for database storage.

It demonstrates frontend-backend communication, REST API development, database connectivity and authentication.


## Features

- Secure admin login and authentication using JWT.
- Register new students.
- View all student records.
- Search for students.
- Update student information.
- Delete student records.
- Manage student departments using predefined options.
- Export student records as CSV.
- Department analytics dashboard.
- MySQL database integration.
- Backend API validation and error handling.


## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Python
- FastAPI
- Uvicorn
- Pydantic
- JWT Authentication

### Database
- MySQL
- MySQL Connector for Python

### Development Tools
- Visual Studio Code
- MySQL Workbench
- Git
- GitHub


## Project Structure

```text
studentmanagementsystem/
│
├── backend/
│   ├── main.py
│   └── database.py
│
├── index.html
├── login.html
├── login.js
├── script.js
├── style.css
├── create_admin.py
├── test.py
├── README.md
└── .gitignore
```


## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/trevanth120-collab/Student-Management-System.git
```

### 2. Open the Project Folder

```bash
cd Student-Management-System
```

### 3. Install Python Dependencies

```bash
python -m pip install fastapi uvicorn mysql-connector-python pydantic python-dotenv "pwdlib[argon2]" PyJWT python-multipart
```

### 4. Configure Environment Variables

Create a `.env` file in the project root and configure:

```env
SECRET_KEY=your_secret_key
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=student_management
```

Never upload your `.env` file to GitHub.

### 5. Start the Backend

```bash
python -m uvicorn backend.main:app --reload
```

### 6. Open the Frontend

Use VS Code Live Server to open `login.html`.

### 7. Access API Documentation

Open:

http://127.0.0.1:8000/docs


## Project Objectives

- Develop a web-based student management application.
- Understand frontend and backend integration.
- Build REST APIs using FastAPI.
- Connect Python applications with MySQL.
- Implement secure authentication using JWT.
- Perform CRUD operations on student records.

## Learning Outcomes

Through this project, I gained practical experience in:

- HTML, CSS and JavaScript.
- Python backend development.
- REST API development.
- MySQL database connectivity.
- Authentication and authorization.
- Git and GitHub version control.

## Author

Developed as a learning project to gain practical experience in full-stack web development.

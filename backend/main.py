from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from backend.database import get_db_connection
from mysql.connector import IntegrityError
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pwdlib import PasswordHash
import jwt
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()
# Authentication settings

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is not set")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

password_hasher = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
def get_current_admin(token: str = Depends(oauth2_scheme)):

    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        username = payload.get("sub")

        if username is None:
            raise credentials_exception

    except jwt.InvalidTokenError:
        raise credentials_exception

    return {"username": username}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Student data structure
from typing import Literal

class Student(BaseModel):
    name: str
    roll: str
    email: str
    department: Literal["IT", "CSE", "ECE", "EEE", "MECH", "CIVIL"]


# Homepage
@app.get("/")
def home():
    return {
        "message": "Student Management System Backend is Running!"
    }


# Register student
@app.post("/students")
def register_student(
    student: Student,
    admin: dict = Depends(get_current_admin)
):

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        query = """
        INSERT INTO students (name, roll, email, department)
        VALUES (%s, %s, %s, %s)
        """

        values = (
            student.name,
            student.roll,
            student.email,
            student.department
        )

        cursor.execute(query, values)
        connection.commit()

        return {
            "message": "Student registered successfully!",
            "student_id": cursor.lastrowid,
            "student": student
        }

    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Roll number or email already exists!"
        )

    finally:
        cursor.close()
        connection.close()
# Get all registered students
@app.get("/students")
def get_students(admin: dict = Depends(get_current_admin)):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM students")
        students = cursor.fetchall()

        return students

    finally:
        cursor.close()
        connection.close()

        # Update student
@app.put("/students/{student_id}")
def update_student(
    student_id: int,
    student: Student,
    admin: dict = Depends(get_current_admin)
):

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        query = """
        UPDATE students
        SET name = %s, roll = %s, email = %s, department = %s
        WHERE id = %s
        """

        values = (
            student.name,
            student.roll,
            student.email,
            student.department,
            student_id
        )

        cursor.execute(query, values)
        connection.commit()

        if cursor.rowcount == 0:
            return {"message": "Student not found"}

        return {
            "message": "Student updated successfully!"
        }

    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Roll number or email already exists!"
        )

    finally:
        cursor.close()
        connection.close()

        # Delete student
@app.delete("/students/{student_id}")
def delete_student(
    student_id: int,
    admin: dict = Depends(get_current_admin)
):

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        query = "DELETE FROM students WHERE id = %s"

        cursor.execute(query, (student_id,))
        connection.commit()

        if cursor.rowcount == 0:
            return {"message": "Student not found"}

        return {
            "message": "Student deleted successfully!"
        }

    finally:
        cursor.close()
        connection.close()

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT * FROM admin_users WHERE username = %s",
            (form_data.username,)
        )

        admin = cursor.fetchone()

        if not admin or not password_hasher.verify(
            form_data.password,
            admin["password_hash"]
        ):
            raise HTTPException(
                status_code=401,
                detail="Incorrect username or password"
            )

        access_token = create_access_token(
            {"sub": admin["username"]}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    finally:
        cursor.close()
        connection.close()
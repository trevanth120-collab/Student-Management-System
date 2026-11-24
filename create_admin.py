from getpass import getpass
from pwdlib import PasswordHash
from backend.database import get_db_connection

# Create password hashing tool
password_hasher = PasswordHash.recommended()

# Get admin details
username = input("Enter admin username: ").strip()
password = getpass("Enter admin password: ")
confirm_password = getpass("Confirm admin password: ")

# Validate details
if not username or not password:
    print("Username and password cannot be empty.")
    raise SystemExit

if password != confirm_password:
    print("Passwords do not match.")
    raise SystemExit

# Convert password into a secure hash
password_hash = password_hasher.hash(password)

# Save admin account in MySQL
connection = get_db_connection()
cursor = connection.cursor()

try:
    cursor.execute(
        "INSERT INTO admin_users (username, password_hash) VALUES (%s, %s)",
        (username, password_hash)
    )

    connection.commit()
    print("Admin account created successfully!")

except Exception as error:
    connection.rollback()
    print("Could not create admin account:", error)

finally:
    cursor.close()
    connection.close()
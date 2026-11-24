// Check whether admin is logged in

const token = localStorage.getItem("access_token");

if (!token) {
    window.location.href = "login.html";
}

console.log("JavaScript is working");

// Get HTML elements
const form = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
// Dashboard elements
const totalStudents = document.getElementById("totalStudents");
const totalDepartments = document.getElementById("totalDepartments");
// Display current date
document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
// Edit form elements
const editFormContainer = document.getElementById("editFormContainer");
const editStudentForm = document.getElementById("editStudentForm");
const cancelEdit = document.getElementById("cancelEdit");
const searchInput = document.getElementById("studentSearch");
const departmentFilter = document.getElementById("departmentFilter");
// FastAPI URL
const API_URL = "http://127.0.0.1:8000/students";

// Send authentication token with API requests
async function apiFetch(url, options = {}) {

    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "login.html";
        throw new Error("Not authenticated");
    }

    const headers = {
        ...options.headers,
        "Authorization": `Bearer ${token}`
    };

    const response = await fetch(url, {
        ...options,
        headers: headers
    });

    // Check whether the token has expired or is invalid
    if (response.status === 401) {

        localStorage.removeItem("access_token");

        alert("Session expired! Please login again.");

        window.location.href = "login.html";

        throw new Error("Session expired");
    }

    return response;
}
// Store the department chart
let departmentChart = null;
// Display students from MySQL
async function displayStudents() {

    try {
        const response = await apiFetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to fetch students");
        }

        const students = await response.json();
        // Calculate dashboard statistics
totalStudents.textContent = students.length;

const departments = new Set(
    students.map(function(student) {
        return student.department.trim().toLowerCase();
    })
);

totalDepartments.textContent = departments.size;
// Count students in each department
const departmentCounts = {};

students.forEach(function(student) {

    const department = student.department.trim();

    if (departmentCounts[department]) {
        departmentCounts[department]++;
    } else {
        departmentCounts[department] = 1;
    }

});

console.log(departmentCounts);

// Display department summary
const departmentSummary = document.getElementById("departmentSummary");

departmentSummary.innerHTML = "";

Object.entries(departmentCounts).forEach(function([department, count]) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${department}</td>
        <td>${count}</td>
    `;

    departmentSummary.appendChild(row);
});

// Prepare chart labels and values
const departmentLabels = Object.keys(departmentCounts);
const departmentValues = Object.values(departmentCounts);

// Remove previous chart before creating a new one
if (departmentChart) {
    departmentChart.destroy();
}

// Create department chart
const ctx = document.getElementById("departmentChart");

departmentChart = new Chart(ctx, {
    type: "bar",

    data: {
        labels: departmentLabels,

        datasets: [{
            label: "Number of Students",
            data: departmentValues,
            backgroundColor: "#2563eb",
            borderRadius: 6
        }]
    },

    options: {
        responsive: true,

        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    }
});

        // Search and Department Filter
const searchTerm = searchInput.value.toLowerCase().trim();

const selectedDepartment = departmentFilter.value.toLowerCase();

const filteredStudents = students.filter(function(student) {

    const matchesSearch =
        student.name.toLowerCase().includes(searchTerm) ||
        String(student.roll).toLowerCase().includes(searchTerm);

    const matchesDepartment =
        selectedDepartment === "" ||
        student.department.toLowerCase() === selectedDepartment;

    return matchesSearch && matchesDepartment;
});

        studentList.innerHTML = "";

        filteredStudents.forEach(function(student) {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td></td>
                <td></td>
                <td></td>
                <td></td>
<td>
    <button type="button" class="editBtn">Edit</button>
    <button type="button" class="deleteBtn">Delete</button>
</td>
            `;

            row.cells[0].textContent = student.name;
            row.cells[1].textContent = student.roll;
            row.cells[2].textContent = student.email;
            row.cells[3].textContent = student.department;
            row.querySelector(".editBtn").addEventListener("click", function() {

    // Show the edit form
    editFormContainer.style.display = "block";

    // Fill existing student details
    document.getElementById("editStudentId").value = student.id;
    document.getElementById("editName").value = student.name;
    document.getElementById("editRoll").value = student.roll;
    document.getElementById("editEmail").value = student.email;
    document.getElementById("editDepartment").value = student.department;

    // Scroll to the edit form
    editFormContainer.scrollIntoView({ behavior: "smooth" });

});

// Delete student
row.querySelector(".deleteBtn").addEventListener("click", async function() {

    const confirmDelete = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await apiFetch(`${API_URL}/${student.id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Delete failed");
        }

        alert("Student deleted successfully!");

        displayStudents();

    } catch (error) {
        alert(error.message);
    }

});

            studentList.appendChild(row);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

// Register student
form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const roll = document.getElementById("roll").value.trim();
    const email = document.getElementById("email").value.trim();
    const department = document.getElementById("department").value.trim();

    if (!name || !roll || !email || !department) {
        alert("Please fill all fields!");
        return;
    }

    const newStudent = {
        name: name,
        roll: roll,
        email: email,
        department: department
    };

    try {

        const response = await apiFetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(newStudent)
});

        if (!response.ok) {
            const error = await response.json();
            throw new Error(JSON.stringify(error.detail || error));
        }

        alert("Student registered successfully!");

        form.reset();

        // Refresh student list from MySQL
        displayStudents();

    } catch (error) {
        console.error("Registration error:", error);
        alert("Registration failed: " + error.message);
    }
});
// Update student details
editStudentForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const studentId = document.getElementById("editStudentId").value;

    const updatedStudent = {
        name: document.getElementById("editName").value.trim(),
        roll: document.getElementById("editRoll").value.trim(),
        email: document.getElementById("editEmail").value.trim(),
        department: document.getElementById("editDepartment").value.trim()
    };

    if (!updatedStudent.name || !updatedStudent.roll ||
        !updatedStudent.email || !updatedStudent.department) {
        alert("Please fill all fields!");
        return;
    }

    try {
        const response = await apiFetch(`${API_URL}/${studentId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedStudent)
        });

        if (!response.ok) {
            throw new Error("Update failed");
        }

        alert("Student updated successfully!");

        editFormContainer.style.display = "none";

        displayStudents();

    } catch (error) {
        alert(error.message);
    }
});

// Cancel editing
cancelEdit.addEventListener("click", function() {
    editFormContainer.style.display = "none";
});
// search
searchInput.addEventListener("input", function() {
    displayStudents();
});
// Department Filter
departmentFilter.addEventListener("change", function() {
    displayStudents();
});
// Sidebar active navigation
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(function(link) {

    link.addEventListener("click", function() {

        // Remove active class from all links
        navLinks.forEach(function(item) {
            item.classList.remove("active");
        });

        // Add active class to clicked link
        link.classList.add("active");

    });

});
// Export students to CSV
const exportBtn = document.getElementById("exportBtn");

exportBtn.addEventListener("click", async function() {

    try {
        const response = await apiFetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to fetch student records");
        }

        const students = await response.json();

        if (students.length === 0) {
            alert("No student records to export!");
            return;
        }

        const headers = ["Name", "Roll Number", "Email", "Department"];

        const rows = students.map(function(student) {
            return [
                student.name,
                student.roll,
                student.email,
                student.department
            ];
        });

        const csvContent = [headers, ...rows]
            .map(row => row.map(value =>
                `"${String(value).replace(/"/g, '""')}"`
            ).join(","))
            .join("\n");

        const blob = new Blob(
            ["\uFEFF" + csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "student_records.csv";
        link.click();

        URL.revokeObjectURL(url);

        alert("Student records exported successfully!");

    } catch (error) {
        alert("Export failed: " + error.message);
    }
});
// Load students when page opens
displayStudents();
// Logout functionality

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", function() {

    localStorage.removeItem("access_token");

    alert("Logged out successfully!");

    window.location.href = "login.html";

});
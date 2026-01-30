async function login(username, password) {
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'COntent-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem('authToken', data.token);
            showDashboard(data.user);
        } else {
            alert('Login failed: ' + data.error);
        }
    } catch (err) {
        alert('Network error');
    }
}

function getAuthHeader() {
    const token = sessionStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function loadAdminDashboard() {
    const res = await fetch('http://localhost:3000/api/admin/dashboard', {
        headers: getAuthHeader()
    });
    if (res.ok) {
        const data = await res.json();
        document.getElementById('content').innerText = data.message;
    } else {
        document.getElementById('content').innerText = 'Access denied!';
    }
}



let isLoggedIn = false;
let role = null;
let currentUser = null;

const users = [
    {
        email: "admin@example.com",
        password: "admin123",
        role: "admin"
    },
    {
        email: "user@example.com",
        password: "user123",
        role: "user"
    }
];

function showSection(id) {
    document.querySelectorAll("main section").forEach(sec => {
        sec.classList.add("d-none");
    });
    document.getElementById(id).classList.remove("d-none");
}

// authentiation

function register(e) {
    e.preventDefault();

    // register = USER only
    alert("Registration successful! You can now log in.");

    showSection("login");
}

function login(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const user = users.find(
        u => u.email === email && u.password === password
    );

    if (!user) {
        alert("Invalid email or password");
        return;
    }

    isLoggedIn = true;
    role = user.role;
    currentUser = { email: user.email, role: user.role, id: user.email }; // Store full user info for security checks

    updateNav();
    showSection("home");
}

function logout() {
    isLoggedIn = false;
    role = null;
    currentUser = null;

    updateNav();
    showSection("home");
}


function updateNav() {
    document.getElementById("nav-guest").classList.toggle("d-none", isLoggedIn);
    document.getElementById("nav-user").classList.toggle("d-none", !isLoggedIn);

    document.querySelectorAll(".role-admin").forEach(el => {
        el.style.display = role === "admin" ? "block" : "none";
    });

    document.getElementById("username").textContent =
        role === "admin" ? "Admin" : "User";
}

// employee ui

function showEmployeeForm() {
    document.getElementById("employeeTable").classList.add("d-none");
    document.getElementById("employeeForm").classList.remove("d-none");
    document.getElementById("employeesTitle").textContent = "Add / Edit Employee";
    document.getElementById("addEmployeeBtn").classList.add("d-none");
}

function cancelEmployeeForm() {
    document.getElementById("employeeForm").classList.add("d-none");
    document.getElementById("employeeTable").classList.remove("d-none");
    document.getElementById("employeesTitle").textContent = "Employees";
    document.getElementById("addEmployeeBtn").classList.remove("d-none");
}

// departments ui

function showDepartmentForm() {
    document.getElementById("departmentTable").classList.add("d-none");
    document.getElementById("departmentForm").classList.remove("d-none");
    document.getElementById("departmentsTitle").textContent = "Add / Edit Department";
    document.getElementById("addDepartmentBtn").classList.add("d-none");
}

function cancelDepartmentForm() {
    document.getElementById("departmentForm").classList.add("d-none");
    document.getElementById("departmentTable").classList.remove("d-none");
    document.getElementById("departmentsTitle").textContent = "Departments";
    document.getElementById("addDepartmentBtn").classList.remove("d-none");
}

// accounts ui
let accounts = users.map(u => ({
    id: u.email, // Use email as unique identifier
    firstName: u.email.split("@")[0],
    lastName: "",
    email: u.email,
    password: u.password,
    role: u.role,
    verified: true
}));

function showAccountForm(editIndex = null) {
    document.getElementById("accountTable").classList.add("d-none");
    document.getElementById("accountForm").classList.remove("d-none");
    document.getElementById("accountsTitle").textContent = editIndex === null ? "Add Account" : "Edit Account";
    document.getElementById("addAccountBtn").classList.add("d-none");

    const form = document.getElementById("accountFormElement");

    if (editIndex !== null) {
        const acc = accounts[editIndex];
        document.getElementById("accountFirstName").value = acc.firstName;
        document.getElementById("accountLastName").value = acc.lastName;
        document.getElementById("accountEmail").value = acc.email;
        document.getElementById("accountPassword").value = acc.password;
        document.getElementById("accountRole").value = acc.role;
        document.getElementById("accountVerified").checked = acc.verified;

        form.onsubmit = function(e) { 
            e.preventDefault(); 
            saveAccount(editIndex); 
        };
    } else {
        form.reset();
        form.onsubmit = function(e) { 
            e.preventDefault(); 
            saveAccount(); 
        };
    }
}

// Cancel Add/Edit
function cancelAccountForm() {
    document.getElementById("accountForm").classList.add("d-none");
    document.getElementById("accountTable").classList.remove("d-none");
    document.getElementById("accountsTitle").textContent = "Accounts";
    document.getElementById("addAccountBtn").classList.remove("d-none");
}

// Save new or edited account
function saveAccount(editIndex = null) {
    const email = document.getElementById("accountEmail").value;
    const acc = {
        id: email, // Use email as unique identifier
        firstName: document.getElementById("accountFirstName").value,
        lastName: document.getElementById("accountLastName").value,
        email: email,
        password: document.getElementById("accountPassword").value,
        role: document.getElementById("accountRole").value,
        verified: document.getElementById("accountVerified").checked
    };

    if (editIndex !== null) accounts[editIndex] = acc;
    else accounts.push(acc);

    cancelAccountForm();
    renderAccountsTable();
}

// Render accounts table
function renderAccountsTable() {
    const tbody = document.getElementById("accountTableBody");
    tbody.innerHTML = "";

    if (accounts.length === 0) {
        tbody.innerHTML = `<tr class="table-secondary text-center"><td colspan="5">No accounts.</td></tr>`;
        return;
    }

    accounts.forEach((acc, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${acc.firstName} ${acc.lastName}</td>
            <td>${acc.email}</td>
            <td>${acc.role}</td>
            <td class="text-center">${acc.verified ? "✅" : "❌"}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="showAccountForm(${i})">Edit</button>
                <button class="btn btn-sm btn-warning me-1" onclick="resetPassword(${i})">Reset Password</button>
                <button class="btn btn-sm btn-danger" onclick="deleteAccount(${i})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Reset password
function resetPassword(i) {
    const newPass = prompt("Enter new password:", accounts[i].password);
    if (newPass) { 
        accounts[i].password = newPass; 
        alert("Password updated!"); 
    }
}

// Delete account
function deleteAccount(i) {
    const accountToDelete = accounts[i];
    
    // Security check: Prevent self-deletion by comparing id
    if (currentUser && currentUser.id === accountToDelete.id) {
        alert("Error: You cannot delete your own account.");
        return;
    }
    
    // Security check: Prevent deletion of last admin
    if (currentUser && currentUser.role === 'admin' && accountToDelete.role === 'admin') {
        const adminCount = accounts.filter(acc => acc.role === 'admin').length;
        if (adminCount <= 1) {
            alert("Error: Cannot delete the last admin account. At least one admin must remain.");
            return;
        }
    }
    
    // Show Bootstrap modal for confirmation
    const modalEl = document.getElementById('deleteAccountModal');
    const modal = new bootstrap.Modal(modalEl);
    
    // Set the email in the modal message
    document.getElementById('deleteAccountEmail').textContent = accountToDelete.email;
    
    // Store the index to delete when confirmed
    modalEl.dataset.deleteIndex = i;
    
    modal.show();
}

// Confirm account deletion (called from modal)
function confirmDeleteAccount() {
    const modalEl = document.getElementById('deleteAccountModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    const index = parseInt(modalEl.dataset.deleteIndex);
    
    if (index !== undefined && index !== null) {
        accounts.splice(index, 1);
        renderAccountsTable();
    }
    
    modal.hide();
}
window.addEventListener("DOMContentLoaded", () => {
    renderAccountsTable();
});

// my requests

let requests = [];

function openRequestModal() {
    const modalEl = document.getElementById('requestModal');
    const modal = new bootstrap.Modal(modalEl);
    
    modalEl.querySelector('input[type="text"]').value = '';
    modalEl.querySelector('input[type="number"]').value = 1;

    const container = document.getElementById('itemsContainer');
    container.innerHTML = `
        <label class="form-label">Items</label>
        <div class="d-flex mb-2 item-row">
            <input type="text" class="form-control me-2" placeholder="Item name">
            <input type="number" class="form-control me-2" placeholder="Qty" min="1">
            <button type="button" class="btn btn-success btn-add-item">+</button>
        </div>
    `;

    modal.show();

    container.querySelectorAll('.btn-add-item').forEach(btn => {
        btn.onclick = () => addItemRow(btn);
    });
}

function addItemRow(btn) {
    btn.textContent = 'X';
    btn.classList.remove('btn-success');
    btn.classList.add('btn-danger');
    btn.onclick = () => {
        btn.parentElement.remove();
    };

    const container = document.getElementById('itemsContainer');
    const newRow = document.createElement('div');
    newRow.className = 'd-flex mb-2 item-row';
    newRow.innerHTML = `
        <input type="text" class="form-control me-2" placeholder="Item name">
        <input type="number" class="form-control me-2" placeholder="Qty" min="1">
        <button type="button" class="btn btn-success btn-add-item">+</button>
    `;
    container.appendChild(newRow);
    newRow.querySelector('.btn-add-item').onclick = (e) => addItemRow(e.target);
}

//create request
function createRequest() {
    const modalEl = document.getElementById('requestModal');
    const modal = bootstrap.Modal.getInstance(modalEl);

    const type = modalEl.querySelector('input[type="text"]').value.trim();
    if (!type) return alert("Please enter request type.");

    const items = [];
    modalEl.querySelectorAll('.item-row').forEach(row => {
        const name = row.querySelector('input[type="text"]').value.trim();
        const qty = row.querySelector('input[type="number"]').value;
        if (name) items.push({name, qty});
    });

    if (items.length === 0) return alert("Please add at least one item.");

    requests.push({ type, items, date: new Date().toLocaleString() });

    modal.hide();
    renderRequests();
}

//request list
function renderRequests() {
    const container = document.getElementById('requestsList');
    if (requests.length === 0) {
        container.innerHTML = `<p class="text-muted">You have no request yet.</p>`;
        return;
    }

    container.innerHTML = '';
    requests.forEach((req, i) => {
        const div = document.createElement('div');
        div.className = 'card mb-2 p-2';
        div.innerHTML = `
            <strong>Type:</strong> ${req.type} <br>
            <strong>Date:</strong> ${req.date} <br>
            <strong>Items:</strong>
            <ul>
                ${req.items.map(it => `<li>${it.name} - ${it.qty}</li>`).join('')}
            </ul>
        `;
        container.appendChild(div);
    });
}

updateNav();
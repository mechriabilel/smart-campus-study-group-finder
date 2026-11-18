// Smart Campus Study Group Finder - Local Data & State Management

const defaultGroups = [
    {
        id: 1,
        courseCode: "27000",
        topic: "Agile Practices & BDD Review",
        location: "Bozen Main Library - Floor 2",
        time: "2026-11-20T14:30",
        creator: "Mechria Bilel (27229)",
        category: "Exam Prep",
        description: "Reviewing User Stories, INVEST criteria, and BDD scenarios for the upcoming Agile exam.",
        maxMembers: 5,
        currentMembers: 3
    },
    {
        id: 2,
        courseCode: "27005",
        topic: "Software Engineering Lab Work",
        location: "NOI Techpark - Room A1.02",
        time: "2026-11-21T16:00",
        creator: "Elena Rossi (UniBz Student)",
        category: "Lab Work & Coding",
        description: "Hands-on coding session for GitHub workflow and unit testing setup.",
        maxMembers: 4,
        currentMembers: 2
    },
    {
        id: 3,
        courseCode: "27012",
        topic: "Database Systems & SQL Queries",
        location: "Brixen Campus - Study Room B",
        time: "2026-11-22T10:00",
        creator: "Marco Bianchi (UniBz Student)",
        category: "Homework Review",
        description: "Solving complex relational algebra and SQL join queries from Lab 4.",
        maxMembers: 6,
        currentMembers: 5
    }
];

function getGroupsFromStorage() {
    const stored = localStorage.getItem("unibz_study_groups");
    if (!stored) {
        localStorage.setItem("unibz_study_groups", JSON.stringify(defaultGroups));
        return defaultGroups;
    }
    return JSON.parse(stored);
}

function saveGroupsToStorage(groups) {
    localStorage.setItem("unibz_study_groups", JSON.stringify(groups));
}

function getCurrentUser() {
    const user = localStorage.getItem("unibz_user");
    return user ? JSON.parse(user) : null;
}

document.addEventListener("DOMContentLoaded", () => {
    updateUserNavStatus();
    if (document.getElementById("groupsGrid")) {
        renderGroups();
    }
});

function updateUserNavStatus() {
    const user = getCurrentUser();
    const navLogin = document.getElementById("nav-login");
    const userStatusPill = document.getElementById("currentUsername");

    if (user) {
        if (navLogin) navLogin.innerHTML = `<i class="fa-solid fa-user"></i> ${user.name.split(' ')[0]}`;
        if (userStatusPill) userStatusPill.innerText = `${user.name} (${user.id})`;
    } else {
        if (navLogin) navLogin.innerHTML = `<i class="fa-solid fa-user-check"></i> Login`;
        if (userStatusPill) userStatusPill.innerText = "Guest (Not logged in)";
    }
}

function handleLogin(event) {
    event.preventDefault();
    const name = document.getElementById("studentName").value;
    const email = document.getElementById("studentEmail").value;
    const id = document.getElementById("studentId").value;

    const userObj = { name, email, id, loggedInAt: new Date().toISOString() };
    localStorage.setItem("unibz_user", JSON.stringify(userObj));

    const alertBox = document.getElementById("loginAlert");
    alertBox.classList.remove("hidden");

    setTimeout(() => {
        window.location.href = "index.html";
    }, 1200);
}

function handleCreateGroup(event) {
    event.preventDefault();
    const user = getCurrentUser();

    if (!user) {
        alert("Please log in first with your UniBz account (US1) before creating a group!");
        window.location.href = "login.html";
        return;
    }

    const courseCode = document.getElementById("courseCode").value;
    const topic = document.getElementById("groupTopic").value;
    const location = document.getElementById("location").value;
    const time = document.getElementById("sessionTime").value;
    const maxMembers = parseInt(document.getElementById("maxMembers").value);
    const category = document.getElementById("groupCategory").value;
    const description = document.getElementById("groupDescription").value;

    const newGroup = {
        id: Date.now(),
        courseCode,
        topic,
        location,
        time,
        creator: `${user.name} (${user.id})`,
        category,
        description,
        maxMembers,
        currentMembers: 1
    };

    const groups = getGroupsFromStorage();
    groups.unshift(newGroup);
    saveGroupsToStorage(groups);

    const alertBox = document.getElementById("createAlert");
    alertBox.classList.remove("hidden");

    setTimeout(() => {
        window.location.href = "index.html";
    }, 1200);
}

function renderGroups(filteredList = null) {
    const grid = document.getElementById("groupsGrid");
    const countBadge = document.getElementById("groupCountBadge");
    if (!grid) return;

    const groups = filteredList || getGroupsFromStorage();
    countBadge.innerText = groups.length;

    if (groups.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 8px;">
                <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; color: #9ca3af; margin-bottom: 10px;"></i>
                <p style="color: #6b7280; font-weight: 500;">No study groups found matching your criteria.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = groups.map(g => {
        const formattedDate = new Date(g.time).toLocaleString('en-GB', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });

        return `
            <div class="group-card">
                <div>
                    <div class="card-top">
                        <span class="course-code-badge">[Course ${g.courseCode}]</span>
                        <span class="category-tag">${g.category}</span>
                    </div>
                    <h3 class="card-title">${g.topic}</h3>
                    <p class="card-desc">${g.description || 'No additional details provided.'}</p>
                    <ul class="card-info-list">
                        <li><i class="fa-solid fa-location-dot"></i> ${g.location}</li>
                        <li><i class="fa-solid fa-calendar-days"></i> ${formattedDate}</li>
                        <li><i class="fa-solid fa-user-pen"></i> Host: ${g.creator}</li>
                    </ul>
                </div>
                <div class="card-footer">
                    <span class="members-count">
                        <i class="fa-solid fa-users"></i> ${g.currentMembers} / ${g.maxMembers} Members
                    </span>
                    <button class="btn btn-primary btn-sm" onclick="joinGroup(${g.id})">
                        <i class="fa-solid fa-right-to-bracket"></i> Join
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function filterGroups() {
    const query = document.getElementById("searchInput").value.toLowerCase().trim();
    const campus = document.getElementById("campusFilter").value;
    const groups = getGroupsFromStorage();

    const filtered = groups.filter(g => {
        const matchesQuery = g.courseCode.toLowerCase().includes(query) ||
                            g.topic.toLowerCase().includes(query) ||
                            g.category.toLowerCase().includes(query);
        const matchesCampus = (campus === "ALL") || g.location.includes(campus);

        return matchesQuery && matchesCampus;
    });

    renderGroups(filtered);
}

function joinGroup(groupId) {
    const user = getCurrentUser();
    if (!user) {
        alert("Please log in first with your UniBz account (US1) to join this group!");
        window.location.href = "login.html";
        return;
    }

    const groups = getGroupsFromStorage();
    const group = groups.find(g => g.id === groupId);

    if (group) {
        if (group.currentMembers >= group.maxMembers) {
            alert("Sorry, this study group has reached its maximum capacity!");
            return;
        }
        group.currentMembers += 1;
        saveGroupsToStorage(groups);
        alert(`Awesome! You have joined "${group.topic}".`);
        renderGroups();
    }
}
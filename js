/**
 * ACCOUNTS MANAGEMENT SYSTEM - FRONTEND APP ENGINE
 */

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    showDashboardUI();
    loadDashboardData();
  } else {
    showLoginUI();
  }
});

function showLoginUI() {
  document.getElementById('loginSection').classList.remove('hidden');
  document.getElementById('appSection').classList.add('hidden');
}

function showDashboardUI() {
  document.getElementById('loginSection').classList.add('hidden');
  document.getElementById('appSection').classList.remove('hidden');

  const user = JSON.parse(localStorage.getItem('user_data') || '{}');
  document.getElementById('userName').innerText = user.name || 'User';
  document.getElementById('userRole').innerText = user.role || 'ROLE';
  document.getElementById('userAvatar').innerText = (user.name || 'U').charAt(0).toUpperCase();
  document.getElementById('branchBadge').innerText = `Branch: ${user.branch_id || 'HEAD_OFFICE'}`;
}

async function handleLogin(event) {
  // Prevent Page Refresh / Re-loading
  if (event) event.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');
  const alert = document.getElementById('loginAlert');

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-xs"></i><span>Authenticating...</span>`;

  try {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        email: email,
        password: password
      })
    });

    const data = await response.json();

    if (data.status === 'success') {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      showDashboardUI();
      loadDashboardData();
    } else {
      alert.className = "mb-4 p-3 rounded-lg text-sm font-medium bg-rose-50 text-rose-600 border border-rose-200";
      alert.innerText = data.message || 'Invalid Credentials';
      alert.classList.remove('hidden');
    }
  } catch (err) {
    alert.className = "mb-4 p-3 rounded-lg text-sm font-medium bg-rose-50 text-rose-600 border border-rose-200";
    alert.innerText = "Connection failed. Verify API URL in config.js";
    alert.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>Sign In</span><i class="fa-solid fa-arrow-right text-xs"></i>`;
  }
}

function handleLogout() {
  localStorage.clear();
  showLoginUI();
}

async function loadDashboardData() {
  const token = localStorage.getItem('auth_token');
  try {
    const res = await fetch(`${CONFIG.API_URL}?action=getDashboardData&token=${token}`);
    const result = await res.json();

    if (result.status === 'success') {
      document.getElementById('dashIncome').innerText = `৳ ${result.data.totalIncome.toLocaleString()}`;
      document.getElementById('dashExpense').innerText = `৳ ${result.data.totalExpense.toLocaleString()}`;
      document.getElementById('dashNet').innerText = `৳ ${result.data.netBalance.toLocaleString()}`;
    }
  } catch (err) {
    console.error("Dashboard fetch error:", err);
  }
}

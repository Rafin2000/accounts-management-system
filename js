/**
 * ACCOUNTS MANAGEMENT SYSTEM - FRONTEND APP ENGINE
 */

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    showDashboardUI();
    loadDashboardData();
  } else {
    showLoginUI();
  }
  
  // Set default date for voucher form
  const vDateInput = document.getElementById('vDate');
  if (vDateInput) {
    vDateInput.value = new Date().toISOString().split('T')[0];
  }
});

// UI View Switchers
function showLoginUI() {
  document.getElementById('loginSection').classList.remove('hidden');
  document.getElementById('appSection').classList.add('hidden');
}

function showDashboardUI() {
  document.getElementById('loginSection').classList.add('hidden');
  document.getElementById('appSection').classList.remove('hidden');

  // Populate User info in UI
  const user = JSON.parse(localStorage.getItem('user_data') || '{}');
  document.getElementById('userName').innerText = user.name || 'User';
  document.getElementById('userRole').innerText = user.role || 'ROLE';
  document.getElementById('userAvatar').innerText = (user.name || 'U').charAt(0).toUpperCase();
  document.getElementById('branchBadge').innerText = `Branch: ${user.branch_id || 'HEAD_OFFICE'}`;
}

// Handle Authentication
async function handleLogin(event) {
  event.preventDefault();
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

// Fetch Dashboard Metrics
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

// Tab Switcher
function switchTab(tabName) {
  const tabs = ['dashboard', 'vouchers', 'approvals', 'ledgers'];
  tabs.forEach(t => {
    const view = document.getElementById(`${t}View`);
    if (view) view.classList.add('hidden');
  });

  const selectedView = document.getElementById(`${tabName}View`);
  if (selectedView) selectedView.classList.remove('hidden');

  if (tabName === 'dashboard') loadDashboardData();
}

// Create Voucher
async function handleVoucherSubmit(event) {
  event.preventDefault();
  const token = localStorage.getItem('auth_token');
  
  const payload = {
    type: document.getElementById('vType').value,
    account_head: document.getElementById('vAccount').value,
    amount: document.getElementById('vAmount').value,
    date: document.getElementById('vDate').value,
    narration: document.getElementById('vNarration').value
  };

  try {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'createVoucher',
        token: token,
        payload: payload
      })
    });

    const result = await response.json();
    if (result.status === 'success') {
      alert(`Voucher Created Successfully! ID: ${result.voucherId}`);
      event.target.reset();
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (err) {
    alert("Failed to create voucher.");
  }
}

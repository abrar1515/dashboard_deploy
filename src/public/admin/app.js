const state = {
  token: localStorage.getItem('admin_token'),
  user: localStorage.getItem('admin_user')
    ? JSON.parse(localStorage.getItem('admin_user'))
    : null,
  categories: [],
  products: [],
  orders: [],
  users: [],
};

const ORDER_STATUS = [
  { value: 0, label: 'Pending' },
  { value: 1, label: 'Processing' },
  { value: 2, label: 'Shipped' },
  { value: 3, label: 'Delivered' },
  { value: 4, label: 'Cancelled' },
];

const selectors = {
  loginPanel: document.getElementById('login-panel'),
  adminPanel: document.getElementById('admin-panel'),
  loginForm: document.getElementById('login-form'),
  logoutBtn: document.getElementById('logout-btn'),
  adminUser: document.getElementById('admin-user'),
  sidebarUser: document.getElementById('sidebar-user'),
  toast: document.getElementById('toast'),
  statProducts: document.getElementById('stat-products'),
  statCategories: document.getElementById('stat-categories'),
  statOrders: document.getElementById('stat-orders'),
  statUsers: document.getElementById('stat-users'),
  productForm: document.getElementById('product-form'),
  productCancel: document.getElementById('product-cancel'),
  productList: document.getElementById('products-list'),
  productCategories: document.getElementById('product-categories'),
  categoryForm: document.getElementById('category-form'),
  categoryCancel: document.getElementById('category-cancel'),
  categoriesList: document.getElementById('categories-list'),
  ordersList: document.getElementById('orders-list'),
  usersList: document.getElementById('users-list'),
};

const showToast = (message, type = 'info') => {
  selectors.toast.textContent = message;
  selectors.toast.classList.remove('hidden');
  selectors.toast.style.background = type === 'error' ? '#b53a3a' : '#1c1c1f';
  setTimeout(() => selectors.toast.classList.add('hidden'), 3000);
};

const request = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
  };

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  const isAuthRequest = url.includes('/admin/auth/sign-in');

  if ((response.status === 401 || response.status === 403) && !isAuthRequest) {
    handleLogout();
    throw new Error('Session expired. Please sign in again.');
  }

  if (!response.ok) {
    const message = data.message || data.error || 'Request failed.';
    throw new Error(message);
  }

  return data;
};

const setLoggedIn = (loggedIn) => {
  selectors.loginPanel.classList.toggle('hidden', loggedIn);
  selectors.adminPanel.classList.toggle('hidden', !loggedIn);
  selectors.logoutBtn.classList.toggle('hidden', !loggedIn);
  const userEmail = loggedIn && state.user ? state.user.email : '';
  selectors.adminUser.textContent = userEmail;
  if (selectors.sidebarUser) {
    selectors.sidebarUser.textContent = userEmail || '—';
  }
};

const handleLogin = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = Object.fromEntries(formData.entries());

  try {
    const result = await request('/admin/auth/sign-in', {
      method: 'POST',
      body: payload,
    });

    state.token = result.token;
    state.user = result.user;
    localStorage.setItem('admin_token', state.token);
    localStorage.setItem('admin_user', JSON.stringify(state.user));

    setLoggedIn(true);
    await refreshAll();
    showToast('Welcome back!');
  } catch (error) {
    showToast(error.message, 'error');
  }
};

const handleLogout = () => {
  state.token = null;
  state.user = null;
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  setLoggedIn(false);
};

const parseLines = (value) =>
  value
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean);

const parsePriceTags = (value) => {
  const lines = parseLines(value);
  return lines
    .map((line) => {
      const [name, priceRaw] = line.split(':');
      const price = Number(priceRaw);
      if (!name || Number.isNaN(price)) {
        return null;
      }
      return { name: name.trim(), price };
    })
    .filter(Boolean);
};

const loadSummary = async () => {
  const summary = await request('/admin/summary');
  selectors.statProducts.textContent = summary.products ?? 0;
  selectors.statCategories.textContent = summary.categories ?? 0;
  selectors.statOrders.textContent = summary.orders ?? 0;
  selectors.statUsers.textContent = summary.users ?? 0;
};

const loadCategories = async () => {
  const result = await request('/admin/categories');
  state.categories = result.data ?? [];
  renderCategories();
  renderCategoryOptions();
};

const loadProducts = async () => {
  const result = await request('/admin/products');
  state.products = result.data ?? [];
  renderProducts();
};

const loadOrders = async () => {
  const result = await request('/admin/orders');
  state.orders = result.data ?? [];
  renderOrders();
};

const loadUsers = async () => {
  const result = await request('/admin/users');
  state.users = result.data ?? [];
  renderUsers();
};

const refreshAll = async () => {
  await loadSummary();
  await loadCategories();
  await loadProducts();
  await loadOrders();
  await loadUsers();
};

const renderCategoryOptions = () => {
  selectors.productCategories.innerHTML = '';
  state.categories.forEach((category) => {
    const chip = document.createElement('label');
    chip.className = 'chip';
    chip.innerHTML = `
      <input type="checkbox" value="${category._id}" />
      ${category.name}
    `;
    selectors.productCategories.appendChild(chip);
  });
};

const renderProducts = () => {
  selectors.productList.innerHTML = '';
  if (state.products.length === 0) {
    selectors.productList.innerHTML = '<div class="muted">No products found.</div>';
    return;
  }

  state.products.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'list-item';
    const categories = (product.categories || []).map((cat) => cat.name).join(', ');
    const priceTags = (product.priceTags || [])
      .map((tag) => `${tag.name}: ${tag.price}`)
      .join(', ');

    card.innerHTML = `
      <h3>${product.name}</h3>
      <div class="muted">${product.description}</div>
      <div class="badge">${categories || 'No categories'}</div>
      <div class="muted">${priceTags || 'No price tags'}</div>
      <div class="list-actions">
        <button class="btn ghost" data-action="edit">Edit</button>
        <button class="btn ghost" data-action="delete">Delete</button>
      </div>
    `;

    card.querySelector('[data-action="edit"]').addEventListener('click', () =>
      populateProductForm(product),
    );
    card.querySelector('[data-action="delete"]').addEventListener('click', () =>
      deleteProduct(product._id),
    );

    selectors.productList.appendChild(card);
  });
};

const renderCategories = () => {
  selectors.categoriesList.innerHTML = '';
  if (state.categories.length === 0) {
    selectors.categoriesList.innerHTML = '<div class="muted">No categories found.</div>';
    return;
  }

  state.categories.forEach((category) => {
    const card = document.createElement('div');
    card.className = 'list-item';
    card.innerHTML = `
      <h3>${category.name}</h3>
      <div class="muted">${category.image}</div>
      <div class="list-actions">
        <button class="btn ghost" data-action="edit">Edit</button>
        <button class="btn ghost" data-action="delete">Delete</button>
      </div>
    `;

    card.querySelector('[data-action="edit"]').addEventListener('click', () =>
      populateCategoryForm(category),
    );
    card.querySelector('[data-action="delete"]').addEventListener('click', () =>
      deleteCategory(category._id),
    );

    selectors.categoriesList.appendChild(card);
  });
};

const renderOrders = () => {
  selectors.ordersList.innerHTML = '';
  if (state.orders.length === 0) {
    selectors.ordersList.innerHTML = '<div class="muted">No orders found.</div>';
    return;
  }

  state.orders.forEach((order) => {
    const card = document.createElement('div');
    card.className = 'list-item';
    const itemCount = order.orderItems ? order.orderItems.length : 0;
    const userEmail = order.user ? order.user.email : 'Unknown';
    const statusOptions = ORDER_STATUS.map(
      (status) =>
        `<option value="${status.value}" ${status.value === order.orderStatus ? 'selected' : ''}>${status.label}</option>`,
    ).join('');

    card.innerHTML = `
      <h3>Order ${order._id}</h3>
      <div class="muted">${userEmail} • ${itemCount} items</div>
      <div class="list-actions">
        <select data-role="status">${statusOptions}</select>
        <button class="btn ghost" data-action="update">Update status</button>
      </div>
    `;

    card.querySelector('[data-action="update"]').addEventListener('click', () =>
      updateOrderStatus(order._id, card.querySelector('[data-role="status"]').value),
    );

    selectors.ordersList.appendChild(card);
  });
};

const renderUsers = () => {
  selectors.usersList.innerHTML = '';
  if (state.users.length === 0) {
    selectors.usersList.innerHTML = '<div class="muted">No users found.</div>';
    return;
  }

  state.users.forEach((user) => {
    const card = document.createElement('div');
    card.className = 'list-item';
    const roleOptions = ['ADMIN', 'CUSTOMER']
      .map(
        (role) =>
          `<option value="${role}" ${role === user.role ? 'selected' : ''}>${role}</option>`,
      )
      .join('');

    card.innerHTML = `
      <h3>${user.firstName} ${user.lastName}</h3>
      <div class="muted">${user.email}</div>
      <div class="list-actions">
        <select data-role="role">${roleOptions}</select>
        <button class="btn ghost" data-action="update">Update role</button>
      </div>
    `;

    card.querySelector('[data-action="update"]').addEventListener('click', () =>
      updateUserRole(user._id, card.querySelector('[data-role="role"]').value),
    );

    selectors.usersList.appendChild(card);
  });
};

const populateProductForm = (product) => {
  selectors.productForm.productId.value = product._id;
  selectors.productForm.name.value = product.name;
  selectors.productForm.description.value = product.description;
  selectors.productForm.images.value = (product.images || []).join('\n');
  selectors.productForm.priceTags.value = (product.priceTags || [])
    .map((tag) => `${tag.name}:${tag.price}`)
    .join('\n');

  const selected = new Set((product.categories || []).map((cat) => cat._id));
  selectors.productCategories
    .querySelectorAll('input[type="checkbox"]')
    .forEach((input) => {
      input.checked = selected.has(input.value);
    });
};

const resetProductForm = () => {
  selectors.productForm.reset();
  selectors.productForm.productId.value = '';
  selectors.productCategories
    .querySelectorAll('input[type="checkbox"]')
    .forEach((input) => {
      input.checked = false;
    });
};

const populateCategoryForm = (category) => {
  selectors.categoryForm.categoryId.value = category._id;
  selectors.categoryForm.name.value = category.name;
  selectors.categoryForm.image.value = category.image;
};

const resetCategoryForm = () => {
  selectors.categoryForm.reset();
  selectors.categoryForm.categoryId.value = '';
};

const submitProduct = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = {
    name: formData.get('name'),
    description: formData.get('description'),
    images: parseLines(formData.get('images') || ''),
    categories: Array.from(
      selectors.productCategories.querySelectorAll('input:checked'),
    ).map((input) => input.value),
    priceTags: parsePriceTags(formData.get('priceTags') || ''),
  };

  const productId = formData.get('productId');

  try {
    if (productId) {
      await request(`/admin/products/${productId}`, {
        method: 'PUT',
        body: payload,
      });
      showToast('Product updated.');
    } else {
      await request('/admin/products', { method: 'POST', body: payload });
      showToast('Product created.');
    }

    resetProductForm();
    await loadProducts();
    await loadSummary();
  } catch (error) {
    showToast(error.message, 'error');
  }
};

const deleteProduct = async (id) => {
  if (!confirm('Delete this product?')) return;

  try {
    await request(`/admin/products/${id}`, { method: 'DELETE' });
    showToast('Product deleted.');
    await loadProducts();
    await loadSummary();
  } catch (error) {
    showToast(error.message, 'error');
  }
};

const submitCategory = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = {
    name: formData.get('name'),
    image: formData.get('image'),
  };
  const categoryId = formData.get('categoryId');

  try {
    if (categoryId) {
      await request(`/admin/categories/${categoryId}`, {
        method: 'PUT',
        body: payload,
      });
      showToast('Category updated.');
    } else {
      await request('/admin/categories', { method: 'POST', body: payload });
      showToast('Category created.');
    }

    resetCategoryForm();
    await loadCategories();
    await loadSummary();
  } catch (error) {
    showToast(error.message, 'error');
  }
};

const deleteCategory = async (id) => {
  if (!confirm('Delete this category?')) return;

  try {
    await request(`/admin/categories/${id}`, { method: 'DELETE' });
    showToast('Category deleted.');
    await loadCategories();
    await loadSummary();
  } catch (error) {
    showToast(error.message, 'error');
  }
};

const updateOrderStatus = async (id, status) => {
  try {
    await request(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: { orderStatus: Number(status) },
    });
    showToast('Order status updated.');
    await loadOrders();
  } catch (error) {
    showToast(error.message, 'error');
  }
};

const updateUserRole = async (id, role) => {
  try {
    await request(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: { role },
    });
    showToast('User role updated.');
    await loadUsers();
  } catch (error) {
    showToast(error.message, 'error');
  }
};

const initTabs = () => {
  document.querySelectorAll('.tab-btn').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(`tab-${button.dataset.tab}`).classList.add('active');
    });
  });
};

selectors.loginForm.addEventListener('submit', handleLogin);
selectors.logoutBtn.addEventListener('click', handleLogout);
selectors.productForm.addEventListener('submit', submitProduct);
selectors.productCancel.addEventListener('click', resetProductForm);
selectors.categoryForm.addEventListener('submit', submitCategory);
selectors.categoryCancel.addEventListener('click', resetCategoryForm);

initTabs();

if (state.token) {
  setLoggedIn(true);
  refreshAll().catch((error) => showToast(error.message, 'error'));
} else {
  setLoggedIn(false);
}

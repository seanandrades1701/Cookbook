const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');
const loginRegisterBtn = document.getElementById('login-register-btn');
const logoutBtn = document.getElementById('logout-btn');
const authModal = document.getElementById('auth-modal');
const authCloseBtn = document.getElementById('auth-close-btn');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const aboutUsBtn = document.getElementById('about-us-btn');
const aboutUsModal = document.getElementById('about-us-modal');
const aboutUsCloseBtn = document.getElementById('about-us-close-btn');
const userWelcome = document.getElementById('user-welcome');
const usernameSpan = document.getElementById('username');
const logoWrapper = document.getElementById('logo-wrapper');
const mealWrapper = document.getElementById('meal-wrapper');
const favoritesList = document.getElementById('favorites-list');

const API_BASE = 'http://localhost:5000';

let currentUser = null;

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (user) {
    currentUser = user;
    showLoggedInState();
    loadFavorites(user.id);
  }
});

// Event Listeners
searchBtn.addEventListener('click', getMealList);
mealList.addEventListener('click', handleMealListClick);
recipeCloseBtn.addEventListener('click', () => {
  document.querySelector('.meal-details').classList.remove('showRecipe');
});
loginRegisterBtn.addEventListener('click', () => {
  authModal.style.display = 'block';
  loginForm.style.display = 'block';
  registerForm.style.display = 'none';
});
authCloseBtn.addEventListener('click', () => {
  authModal.style.display = 'none';
});
showRegister.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
});
showLogin.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.style.display = 'block';
  registerForm.style.display = 'none';
});
loginBtn.addEventListener('click', handleLogin);
registerBtn.addEventListener('click', handleRegister);
logoutBtn.addEventListener('click', handleLogout);
aboutUsBtn.addEventListener('click', () => {
  aboutUsModal.style.display = 'block';
});
aboutUsCloseBtn.addEventListener('click', () => {
  aboutUsModal.style.display = 'none';
});
favoritesList.addEventListener('click', handleFavoritesClick);

// Fetch meal list from TheMealDB API
async function getMealList() {
  let searchInputTxt = document.getElementById('search-input').value.trim();
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`);
    const data = await response.json();
    let html = '';
    if (data.meals) {
      data.meals.forEach(meal => {
        html += `
          <div class="meal-item" data-id="${meal.idMeal}">
            <div class="meal-img">
              <img src="${meal.strMealThumb}" alt="food">
            </div>
            <div class="meal-name">
              <h3>${meal.strMeal}</h3>
              <a href="#" class="recipe-btn">Get Recipe</a>
              <button class="favorite-btn"><i class="fas fa-heart"></i></button>
            </div>
          </div>
        `;
      });
      mealList.classList.remove('notFound');
    } else {
      html = "Sorry, we didn't find any meal!";
      mealList.classList.add('notFound');
    }
    mealList.innerHTML = html;
  } catch (error) {
    console.error('Error fetching meals:', error);
    mealList.innerHTML = "An error occurred while fetching meals.";
    mealList.classList.add('notFound');
  }
}

// Handle clicks on meal list (get recipe or add to favorites)
async function handleMealListClick(e) {
  e.preventDefault();
  const mealItem = e.target.closest('.meal-item');
  if (!mealItem) return;

  const mealId = mealItem.dataset.id;

  if (e.target.classList.contains('recipe-btn')) {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
      const data = await response.json();
      const meal = data.meals[0];
      let html = `
        <h2 class="recipe-title">${meal.strMeal}</h2>
        <p class="recipe-category">${meal.strCategory}</p>
        <div class="recipe-instruct">
          <h3>Instructions:</h3>
          <p>${meal.strInstructions}</p>
        </div>
        <div class="recipe-meal-img">
          <img src="${meal.strMealThumb}" alt="">
        </div>
        <div class="recipe-link">
          <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
        </div>
      `;
      mealDetailsContent.innerHTML = html;
      document.querySelector('.meal-details').classList.add('showRecipe');
    } catch (error) {
      console.error('Error fetching recipe:', error);
      mealDetailsContent.innerHTML = "An error occurred while fetching the recipe.";
    }
  } else if (e.target.closest('.favorite-btn')) {
    if (!currentUser) {
      alert('Please log in to add meals to your favorites.');
      authModal.style.display = 'block';
      return;
    }
    const mealName = mealItem.querySelector('h3').textContent;
    const mealThumb = mealItem.querySelector('img').src;
    try {
      const response = await fetch(`${API_BASE}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, mealId, mealName, mealThumb }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Added to favorites!');
        loadFavorites(currentUser.id);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      alert('Error adding to favorites.');
    }
  }
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  try {
    const response = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      currentUser = data.user;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      authModal.style.display = 'none';
      showLoggedInState();
      loadFavorites(currentUser.id);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error logging in:', error);
    alert('Error logging in: ' + error.message);
  }
}

// Handle register
async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value.trim();

  if (!username || !password) {
    alert('Username and password are required');
    return;
  }
  if (username.length < 3) {
    alert('Username must be at least 3 characters');
    return;
  }
  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.success) {
      alert(data.message);
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error registering:', error);
    alert('Network error: ' + error.message);
  }
}

// Handle logout
function handleLogout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showLoggedOutState();
  favoritesList.innerHTML = '';
}

// Show logged-in state
function showLoggedInState() {
  loginRegisterBtn.style.display = 'none';
  logoutBtn.style.display = 'inline-block';
  userWelcome.style.display = 'inline';
  usernameSpan.textContent = currentUser.username;
  logoWrapper.style.display = 'none';
  mealWrapper.style.display = 'block';
}

// Show logged-out state
function showLoggedOutState() {
  loginRegisterBtn.style.display = 'inline-block';
  logoutBtn.style.display = 'none';
  userWelcome.style.display = 'none';
  logoWrapper.style.display = 'flex';
  mealWrapper.style.display = 'none';
}

// Load user's favorite meals
async function loadFavorites(userId) {
  try {
    const response = await fetch(`${API_BASE}/api/favorites/${userId}`);
    const favorites = await response.json();
    let html = '';
    if (favorites.length > 0) {
      favorites.forEach(favorite => {
        html += `
          <div class="favorite-item" data-id="${favorite.mealId}">
            <div class="favorite-img">
              <img src="${favorite.mealThumb}" alt="food">
            </div>
            <div class="favorite-name">
              <h3>${favorite.mealName}</h3>
              <button class="remove-favorite-btn"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        `;
      });
    } else {
      html = '<p>No favorite meals yet.</p>';
    }
    favoritesList.innerHTML = html;
  } catch (error) {
    console.error('Error loading favorites:', error);
    favoritesList.innerHTML = '<p>Error loading favorites.</p>';
  }
}

// Handle clicks on favorites list (remove favorite)
async function handleFavoritesClick(e) {
  if (e.target.closest('.remove-favorite-btn')) {
    const favoriteItem = e.target.closest('.favorite-item');
    const mealId = favoriteItem.dataset.id;
    try {
      const response = await fetch(`${API_BASE}/api/favorites/${currentUser.id}/${mealId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        alert('Removed from favorites!');
        loadFavorites(currentUser.id);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      alert('Error removing from favorites.');
    }
  }
}

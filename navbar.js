const navbars = {
  leader: `
    <div class="nav-nav-menu">
      <!-- Logo -->
      <a href="index.html" class="nav-logo">
        <img src="logo.png" alt="Logo" class="navbar-logo" />
      </a>
      
      <!-- Hamburger Button -->
      <button class="hamburger" aria-label="Toggle navigation">
        <span class="line"></span>
        <span class="line"></span>
        <span class="line"></span>
      </button>
      
      <!-- Navigation Items -->
      <div class="nav-items">
        <a href="index.html" class="nav-link home-link">Home</a>
        <a href="event-leader.html" class="nav-link events-link">Events</a>
        <a href="request-form.html" class="nav-link requests-link">Requests</a>
        <a href="ideas-page.html" class="nav-link ideas-link">Ideas</a>
        <a href="applications.html" class="nav-link applications-link">Applications</a>
        <a href="#" class="nav-link signout-link" onclick="signOut()">Sign Out</a>
      </div>
    </div>
  `,
  member: `
    <div class="nav-nav-menu">
      <a href="index.html" class="nav-logo">
        <img src="logo.png" alt="Logo" class="navbar-logo" />
      </a>
      <button class="hamburger" aria-label="Toggle navigation">
        <span class="line"></span>
        <span class="line"></span>
        <span class="line"></span>
      </button>
      <div class="nav-items">
        <a href="index.html" class="nav-link home-link">Home</a>
        <a href="volunteer-member-event.html" class="nav-link events-link">Events</a>
        <a href="request-form.html" class="nav-link requests-link">Requests</a>
        <a href="#" class="nav-link signout-link" onclick="signOut()">Sign Out</a>
      </div>
    </div>
  `,
  volunteer: `
    <div class="nav-nav-menu">
      <a href="index.html" class="nav-logo">
        <img src="logo.png" alt="Logo" class="navbar-logo" />
      </a>
      <button class="hamburger" aria-label="Toggle navigation">
        <span class="line"></span>
        <span class="line"></span>
        <span class="line"></span>
      </button>
      <div class="nav-items">
        <a href="index.html" class="nav-link home-link">Home</a>
        <a href="volunteer-member-event.html" class="nav-link events-link">Events</a>
        <a href="#" class="nav-link signout-link" onclick="signOut()">Sign Out</a>
      </div>
    </div>
  `,
  guest: `
    <div class="nav-nav-menu">
      <a href="index.html" class="nav-logo">
        <img src="logo.png" alt="Logo" class="navbar-logo" />
      </a>
      <button class="hamburger" aria-label="Toggle navigation">
        <span class="line"></span>
        <span class="line"></span>
        <span class="line"></span>
      </button>
      <div class="nav-items">
        <a href="index.html" class="nav-link home-link">Home</a>
        <a href="events.html" class="nav-link events-link">Events</a>
        <a href="sign-in.html" class="nav-link signout-link">Sign in</a>
      </div>
    </div>
  `,
};

function renderNavbar() {
  const savedRole = sessionStorage.getItem('userRole') || 'guest'; // Default to guest if no role is found
  console.log("Rendering navbar for role:", savedRole);

  const navigationDiv = document.querySelector('.navigation');
  if (!navigationDiv) {
    console.error("Navigation div not found in the DOM.");
    return;
  }

  navigationDiv.innerHTML = navbars[savedRole] || navbars['guest']; // Render the corresponding navbar

  const hamburger = navigationDiv.querySelector('.hamburger');
  const navItems = navigationDiv.querySelector('.nav-items');

  if (hamburger && navItems) {
    hamburger.addEventListener('click', () => {
      navItems.classList.toggle('show');
    });
  } else {
    console.error("Hamburger or nav-items not found in the rendered navbar.");
  }
}

// Handle sign-out
function signOut() {
  sessionStorage.removeItem('userRole'); // Clear sessionStorage
  window.location.href = 'index.html';
}

// Ensure the navbar is rendered on every page
document.addEventListener('DOMContentLoaded', renderNavbar);

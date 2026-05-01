import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrds464IchYEPipr4RzEWumDCCT7WGevY",
  authDomain: "brieflyx-89efd.firebaseapp.com",
  projectId: "brieflyx-89efd",
  storageBucket: "brieflyx-89efd.firebasestorage.app",
  messagingSenderId: "521476560438",
  appId: "1:521476560438:web:5c82be770b35f76e432a97",
  measurementId: "G-29DB3SBP4E"
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const categories = ["All", "Technology", "World", "Business", "Science", "Culture"];

const articles = [
  {
    title: "Neural Interface Chips Reach Consumer Trials",
    summary:
      "Early adopters are testing a new generation of neural chips designed to improve accessibility and communication.",
    category: "Technology",
    date: "May 1, 2026",
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Consumer-facing neural interfaces entered controlled trials this week, signaling a major milestone in wearable technology.",
      "The pilot focuses on assistive communication, helping users interact with devices using minimal physical motion.",
      "Regulators highlighted the need for robust privacy protections before full-scale launches can begin.",
      "Developers say the current generation prioritizes reliability over aggressive feature expansion.",
      "If successful, these trials could reshape how people think about input, accessibility, and digital presence."
    ]
  },
  {
    title: "Orbital Solar Grids Could Lower Urban Energy Costs",
    summary:
      "Engineers propose scalable orbital solar arrays that beam clean power to dense city regions with minimal land use.",
    category: "Science",
    date: "April 29, 2026",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    body: [
      "A consortium of researchers outlined a modular orbital solar concept aimed at reducing metropolitan energy pressure.",
      "The blueprint uses phased deployment, allowing incremental launches and localized test regions.",
      "Critics note that transmission safety and launch costs remain significant barriers to adoption.",
      "Despite the hurdles, investors continue to fund prototypes due to long-term climate and grid benefits."
    ]
  },
  {
    title: "Autonomous Freight Lanes Expand Across Coastal Routes",
    summary:
      "Smart freight corridors are reducing delays through predictive routing and adaptive traffic coordination systems.",
    category: "Business",
    date: "April 24, 2026",
    image:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Shipping agencies activated new autonomous lanes along coastal highways to improve delivery consistency.",
      "The system uses shared sensor meshes, allowing fleets to react to traffic and weather in real time.",
      "Analysts expect meaningful fuel savings once regional carriers complete software upgrades."
    ]
  }
];

const categoriesRow = document.getElementById("categories");
const newsGrid = document.getElementById("newsGrid");
const articleCategory = document.getElementById("articleCategory");
const articleTitle = document.getElementById("articleTitle");
const articleMeta = document.getElementById("articleMeta");
const articleContent = document.getElementById("articleContent");
const lockOverlay = document.getElementById("lockOverlay");
const authBtn = document.getElementById("authBtn");
const loginCta = document.getElementById("loginCta");
const prefGrid = document.getElementById("prefGrid");
const themeToggle = document.getElementById("themeToggle");
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const authStatus = document.getElementById("authStatus");

let selectedCategory = "All";
let currentUser = null;

function renderCategories() {
  categoriesRow.innerHTML = "";
  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = `pill-btn ${cat === selectedCategory ? "active" : ""}`;
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      selectedCategory = cat;
      renderCategories();
      renderNewsCards();
    });
    categoriesRow.appendChild(btn);
  });
}

function renderNewsCards() {
  const filtered =
    selectedCategory === "All"
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  newsGrid.innerHTML = "";
  filtered.forEach((article, index) => {
    const card = document.createElement("article");
    card.className = "news-card";
    card.innerHTML = `
      <img class="news-thumb" src="${article.image}" alt="${article.title}" />
      <div class="news-body">
        <span class="meta-chip">${article.category}</span>
        <h3>${article.title}</h3>
        <p>${article.summary}</p>
      </div>
    `;
    card.style.animation = `fadeInUp 0.3s ease ${index * 0.04}s both`;
    card.addEventListener("click", () => renderArticle(article));
    newsGrid.appendChild(card);
  });
}

function renderArticle(article) {
  articleCategory.textContent = article.category;
  articleTitle.textContent = article.title;
  articleMeta.textContent = article.date;
  articleContent.innerHTML = article.body.map((p) => `<p>${p}</p>`).join("");
  updateLockState();
}

function updateLockState() {
  const loggedIn = Boolean(currentUser);
  articleContent.classList.toggle("locked", !loggedIn);
  lockOverlay.classList.toggle("show", !loggedIn);
  authBtn.textContent = loggedIn ? "Logout" : "Login";
}

function renderPreferences() {
  prefGrid.innerHTML = "";
  categories
    .filter((c) => c !== "All")
    .forEach((cat) => {
      const chip = document.createElement("button");
      chip.className = "pill-btn";
      chip.textContent = cat;
      chip.addEventListener("click", () => chip.classList.toggle("active"));
      prefGrid.appendChild(chip);
    });
}

function initTheme() {
  const storedTheme = localStorage.getItem("brieflyx-theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    document.body.dataset.theme = storedTheme;
  }
}

function setAuthStatus(message) {
  authStatus.textContent = message;
}

function getFriendlyAuthError(error) {
  if (!error?.code) {
    return "Login failed. Please try again.";
  }
  if (error.code === "auth/unauthorized-domain") {
    return "This domain is not authorized in Firebase. Add it under Authentication > Settings > Authorized domains.";
  }
  if (error.code === "auth/popup-blocked") {
    return "Popup was blocked. Redirecting to sign-in...";
  }
  if (error.code === "auth/popup-closed-by-user") {
    return "Sign-in popup was closed before completing login.";
  }
  return `Login failed (${error.code}).`;
}

async function handleAuthAction() {
  try {
    if (currentUser) {
      await signOut(auth);
      setAuthStatus("Signed out.");
      return;
    }
    setAuthStatus("Opening sign-in...");
    await signInWithPopup(auth, provider);
    setAuthStatus("Signed in.");
  } catch (error) {
    console.error("Authentication error:", error);
    setAuthStatus(getFriendlyAuthError(error));
    if (error?.code === "auth/popup-blocked") {
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectError) {
        console.error("Redirect sign-in failed:", redirectError);
        setAuthStatus(getFriendlyAuthError(redirectError));
      }
    }
  }
}

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  document.body.dataset.theme = nextTheme;
  localStorage.setItem("brieflyx-theme", nextTheme);
});

authBtn.addEventListener("click", handleAuthAction);
loginCta.addEventListener("click", handleAuthAction);

menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  updateLockState();
  if (user) {
    setAuthStatus(`Signed in as ${user.displayName || user.email || "user"}.`);
  } else {
    setAuthStatus("You are not signed in.");
  }
});

initTheme();
renderCategories();
renderNewsCards();
renderArticle(articles[0]);
renderPreferences();

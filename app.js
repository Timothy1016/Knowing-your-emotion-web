// Application behavior for Box of Emotions.
// Static mode is the default so the complete site works on GitHub Pages.
// A future hosted backend can opt in by setting window.BOX_USE_SERVER = true.
const STATIC_MODE = window.BOX_USE_SERVER !== true;
const API_URL = window.BOX_API_URL || (
    location.protocol === "file:"
        ? "http://127.0.0.1:5000"
        : (["127.0.0.1", "localhost"].includes(location.hostname) && location.port !== "5000"
            ? `${location.protocol}//${location.hostname}:5000`
            : location.origin)
);

const EMPTY_STATE = () => ({ version: 1, notes: [], favorites: [], history: [], viewCounts: {} });
const CATEGORY_TONES = {
    calm: ["zen", "enjoyment"],
    positive: ["zen", "bliss", "enjoyment", "possibility", "ego"],
    heavy: ["emptiness", "heartache", "bitterness", "heat", "loathing", "angst"]
};
const BACKEND_CATEGORY_MAP = {
    Emptiness: "emptiness", Heartache: "heartache", Bitterness: "bitterness", Heat: "heat",
    Possibility: "possibility", Zen: "zen", Bliss: "bliss", Loathing: "loathing",
    Enjoyment: "enjoyment", Ego: "ego", Angst: "angst"
};
const CRISIS_TERMS = [
    "bunuh diri", "ingin mati", "mau mati", "akhiri hidup", "menyakiti diri",
    "self harm", "suicide", "kill myself", "end my life", "want to die"
];
const LOCAL_EMOTION_KEYWORDS = {
    Emptiness: ["hampa", "kosong", "mati rasa", "tak bermakna", "numb", "empty", "meaningless"],
    Heartache: ["sedih", "kecewa", "menangis", "nangis", "galau", "patah hati", "berduka", "hurt", "sad", "grief"],
    Bitterness: ["dendam", "getir", "sinis", "iri", "cemburu", "resentful", "jealous", "bitter"],
    Heat: ["kesal", "bete", "marah", "murka", "jengkel", "frustrasi", "angry", "furious", "annoyed"],
    Possibility: ["penasaran", "berharap", "optimis", "semangat", "mungkin bisa", "curious", "hopeful", "optimistic"],
    Zen: ["tenang", "damai", "rileks", "santai", "lega", "tenteram", "calm", "relaxed", "peaceful"],
    Bliss: ["bahagia", "gembira", "sukacita", "takjub", "euforia", "happy", "delighted", "blissful"],
    Loathing: ["jijik", "muak", "benci", "enggan", "risih", "disgusted", "repulsed", "loathe"],
    Enjoyment: ["senang", "seru", "menikmati", "nyaman", "puas", "lucu", "fun", "enjoy", "amused"],
    Ego: ["bangga", "hebat", "sukses", "percaya diri", "lebih unggul", "proud", "confident", "superior"],
    Angst: ["cemas", "takut", "khawatir", "gelisah", "panik", "gugup", "overthinking", "anxious", "afraid", "worried"]
};
const LOCAL_NEGATIONS = ["tidak", "tak", "bukan", "belum", "gak", "nggak", "enggak", "no", "not", "never"];
const REMINDER_STORAGE_KEY = "boxDailyReminder";
const REMINDER_NOTIFICATION = Object.freeze({
    title: "Box of Emotions",
    body: "Take a moment to check in with yourself. How are you feeling today?"
});

let accountMode = "guest";
let userState = EMPTY_STATE();
let activeTab = "emotions";
let libraryFilter = "all";
let editingNoteId = null;
let deletedNote = null;
let syncTimer = null;
let toastTimer = null;
let applyingRoute = false;
let deferredInstallPrompt = null;
let reminderTimer = null;
let reminderInFlight = false;

window.addEventListener("DOMContentLoaded", initializeApp, { once: true });
window.addEventListener("hashchange", () => currentUser && applyRoute());
window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    document.getElementById("installBtn").classList.remove("hidden");
    showToast(uiText[currentLang].installReady, "success");
});
window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    document.getElementById("installBtn").classList.add("hidden");
    showToast(uiText[currentLang].installed, "success");
});

async function initializeApp() {
    const savedLang = localStorage.getItem("boxLanguage");
    const savedTheme = localStorage.getItem("boxTheme");
    if (["id", "en", "zh"].includes(savedLang)) currentLang = savedLang;
    if (["light", "dark"].includes(savedTheme)) currentTheme = savedTheme;
    migrateLegacyLocalData();
    applyTheme();
    updateLanguageUI();
    startReminderMonitor();

    if (STATIC_MODE) {
        if (!restoreLocalSession()) document.getElementById("authPrivacy").innerText = uiText[currentLang].authLocalPrivacy;
        return;
    }

    try {
        const session = await apiFetch("/api/auth/session", {}, 2500);
        if (session.authenticated) {
            accountMode = "account";
            currentUser = session.user.username;
            userState = normalizeState(await apiFetch("/api/state"));
            showApp();
        }
    } catch (_error) {
        if (!restoreLocalSession()) document.getElementById("authPrivacy").innerText = `${uiText[currentLang].authOffline} ${uiText[currentLang].authLocalPrivacy}`;
    }
}

function migrateLegacyLocalData() {
    const legacyUser = localStorage.getItem("boxUser");
    const legacyNotes = legacyUser ? safeJSON(localStorage.getItem(`boxNotes_${legacyUser}`), []) : [];
    if (!localStorage.getItem("boxGuestState") && legacyNotes.length) {
        const migrated = EMPTY_STATE();
        migrated.notes = legacyNotes.map(note => ({ ...note, tag: note.tag || "", updatedAt: note.id || Date.now() }));
        localStorage.setItem("boxGuestState", JSON.stringify(migrated));
    }
    ["boxPass", "boxUser", "isLoggedIn"].forEach(key => localStorage.removeItem(key));
}

function safeJSON(value, fallback) {
    try { return value ? JSON.parse(value) : fallback; } catch (_error) { return fallback; }
}

function normalizeState(value) {
    const state = value && typeof value === "object" ? value : EMPTY_STATE();
    return {
        version: 1,
        notes: Array.isArray(state.notes) ? state.notes : [],
        favorites: Array.isArray(state.favorites) ? state.favorites : [],
        history: Array.isArray(state.history) ? state.history : [],
        viewCounts: state.viewCounts && typeof state.viewCounts === "object" ? state.viewCounts : {}
    };
}

async function apiFetch(path, options = {}, timeout = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(`${API_URL}${path}`, {
            credentials: "include",
            ...options,
            headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) },
            signal: controller.signal
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Server error");
        return data;
    } finally {
        clearTimeout(timer);
    }
}

function persistState() {
    if (accountMode === "guest") {
        localStorage.setItem("boxGuestState", JSON.stringify(userState));
        return;
    }
    if (accountMode === "local-account") {
        localStorage.setItem(localStateKey(currentUser), JSON.stringify(userState));
        return;
    }
    clearTimeout(syncTimer);
    syncTimer = setTimeout(async () => {
        try {
            await apiFetch("/api/state", { method: "PUT", body: JSON.stringify(userState) });
        } catch (_error) {
            showToast(uiText[currentLang].authOffline, "error");
        }
    }, 350);
}

function showToast(message, type = "error", actionLabel = "") {
    const toast = document.getElementById("toast");
    clearTimeout(toastTimer);
    toast.className = `toast show ${type}`;
    toast.innerHTML = `${escapeHTML(message)}${actionLabel ? ` <button type="button" class="toast-action" onclick="undoDeleteNote()">${escapeHTML(actionLabel)}</button>` : ""}`;
    toastTimer = setTimeout(() => toast.classList.remove("show"), actionLabel ? 6500 : 3000);
}

function applyTheme() {
    const root = document.getElementById("htmlRoot");
    const btn = document.getElementById("themeBtn");
    if (currentTheme === "dark") { root.setAttribute("data-theme", "dark"); btn.innerText = "☀️"; }
    else { root.removeAttribute("data-theme"); btn.innerText = "🌙"; }
}

function toggleTheme() {
    currentTheme = currentTheme === "light" ? "dark" : "light";
    localStorage.setItem("boxTheme", currentTheme);
    applyTheme();
}

function toggleLang() {
    currentLang = currentLang === "id" ? "en" : (currentLang === "en" ? "zh" : "id");
    localStorage.setItem("boxLanguage", currentLang);
    updateLanguageUI();
}

function updateLanguageUI() {
    const t = uiText[currentLang];
    document.documentElement.lang = currentLang === "zh" ? "zh-CN" : currentLang;
    setText({
        brandText: t.brand, lblUser: t.lblUser, lblPass: t.lblPass, txtHello: t.hello, btnLogout: t.logout,
        txtBack: t.btnBack, lblRefl: t.lblRefl, lblAdv: t.lblAdv, lblSeeAlso: t.lblSeeAlso,
        lblNavEmo: t.navEmo, lblNavLib: t.navLib, lblNavNote: t.navNote, lblNavAbout: t.navAbout,
        libTitle: t.libTitle, libSubtitle: t.libSub, notesTitle: t.notesTitle, notesSubtitle: t.notesSub,
        createNoteTitle: editingNoteId ? t.editNote : t.createNoteTitle, btnCancelNote: t.btnCancel,
        btnSaveNote: editingNoteId ? t.updateNote : t.btnSave, curhatTitle: t.curhatTitle, curhatSub: t.curhatSub,
        curhatSafety: t.curhatSafety, btnGuest: t.guest, authPrivacy: STATIC_MODE ? t.authLocalPrivacy : t.authPrivacy, btnExportNotes: t.exportNotes,
        noteTagLabel: t.noteTag, aboutTitle: t.aboutTitle, aboutSubtitle: t.aboutSubtitle,
        aboutPurposeTitle: t.aboutPurposeTitle, aboutPurpose: t.aboutPurpose,
        aboutCrisisTitle: t.aboutCrisisTitle, aboutCrisis: t.aboutCrisis,
        aboutCreditTitle: t.aboutCreditTitle, aboutCredit: t.aboutCredit,
        aboutPrivacyTitle: t.aboutPrivacyTitle, aboutPrivacy: t.aboutPrivacy,
        reminderTitle: t.reminderTitle, reminderDescription: t.reminderDescription,
        reminderTimeLabel: t.reminderTimeLabel, reminderTest: t.reminderTest, reminderHelp: t.reminderHelp,
        wheelTitle: t.wheelTitle, wheelSubtitle: t.wheelSubtitle, fuzzySearchHint: t.fuzzyHint
    });
    const langBtn = document.getElementById("langBtn");
    langBtn.innerText = t.langBtn; langBtn.title = t.switchLanguageLabel; langBtn.setAttribute("aria-label", t.switchLanguageLabel);
    const themeBtn = document.getElementById("themeBtn");
    themeBtn.title = t.toggleThemeLabel; themeBtn.setAttribute("aria-label", t.toggleThemeLabel);
    document.getElementById("librarySearch").placeholder = t.searchPlaceholder;
    document.getElementById("username").placeholder = t.usernamePlaceholder;
    document.getElementById("libraryClear").setAttribute("aria-label", t.clearSearch);
    document.getElementById("notesSearch").placeholder = t.notesSearch;
    document.getElementById("noteInput").placeholder = t.noteHolder;
    document.getElementById("curhatInput").placeholder = t.curhatPlaceholder;
    document.getElementById("curhatBtn").innerText = t.curhatBtn;
    document.getElementById("btnNewNote").setAttribute("aria-label", t.newNoteLabel);
    const installBtn = document.getElementById("installBtn");
    installBtn.title = t.installApp; installBtn.setAttribute("aria-label", t.installApp);
    const scrollFab = document.getElementById("scrollFab");
    scrollFab.title = t.scrollTop; scrollFab.setAttribute("aria-label", t.scrollTop);
    updateReminderUI();
    document.querySelectorAll(".filter-chip").forEach(button => button.innerText = t.filters[button.dataset.filter]);
    setupAuthMode();
    populateNoteTags();
    if (currentUser) applyRoute(true);
}

function setText(values) {
    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element && value !== undefined) element.innerText = value;
    });
}

// Authentication: server-side password hashes and HttpOnly session cookies.
function switchAuthMode() { isLogin = !isLogin; setupAuthMode(); }

function setupAuthMode() {
    const t = uiText[currentLang];
    setText({
        authTitle: isLogin ? t.authLogTitle : t.authRegTitle,
        authSubtitle: isLogin ? t.authLogSub : t.authRegSub,
        btnSubmit: isLogin ? t.btnLog : t.btnReg
    });
    document.getElementById("authSwitchText").innerHTML = isLogin
        ? `${t.switchReg} <button type="button" class="btn-link" onclick="switchAuthMode()">${t.switchRegAct}</button>`
        : `${t.switchLog} <button type="button" class="btn-link" onclick="switchAuthMode()">${t.switchLogAct}</button>`;
    document.getElementById("password").autocomplete = isLogin ? "current-password" : "new-password";
}

async function handleAuth() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const t = uiText[currentLang];
    if (!username || !password) return showToast(t.toastErrEmpty);
    if (!isLogin && password.length < 8) return showToast(currentLang === "id" ? "Kata sandi minimal 8 karakter." : (currentLang === "zh" ? "密码至少需要 8 个字符。" : "Password must be at least 8 characters."));
    const button = document.getElementById("btnSubmit");
    const label = button.innerText; button.disabled = true; button.setAttribute("aria-busy", "true"); button.innerText = t.authWorking;
    try {
        if (STATIC_MODE) {
            await authenticateLocally(username, password, !isLogin);
            return;
        }
        const result = await apiFetch(isLogin ? "/api/auth/login" : "/api/auth/register", {
            method: "POST", body: JSON.stringify({ username, password })
        });
        accountMode = "account";
        currentUser = result.user.username;
        userState = normalizeState(await apiFetch("/api/state"));
        document.getElementById("password").value = "";
        showApp();
    } catch (error) {
        if (error.name === "AbortError" || error instanceof TypeError) {
            try { await authenticateLocally(username, password, !isLogin); }
            catch (localError) { showToast(localError.message); }
        } else showToast(error.message);
    } finally {
        button.disabled = false; button.removeAttribute("aria-busy"); button.innerText = label;
    }
}

function localAccountKey(username) { return normalizeSearchText(username); }
function localStateKey(username) { return `boxLocalState_${localAccountKey(username)}`; }

function bytesToBase64(bytes) {
    let binary = "";
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary);
}

function base64ToBytes(value) {
    const binary = atob(value);
    return Uint8Array.from(binary, character => character.charCodeAt(0));
}

async function hashLocalPassword(password, salt, iterations = 210000) {
    if (!globalThis.crypto?.subtle) throw new Error(uiText[currentLang].authLocalCrypto);
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
    return bytesToBase64(new Uint8Array(bits));
}

function constantTimeEqual(left, right) {
    if (left.length !== right.length) return false;
    let difference = 0;
    for (let index = 0; index < left.length; index++) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
    return difference === 0;
}

async function authenticateLocally(username, password, registering) {
    const t = uiText[currentLang];
    if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) throw new Error(t.authLocalCrypto);
    const accounts = safeJSON(localStorage.getItem("boxLocalAccounts"), {});
    const key = localAccountKey(username);
    const existing = accounts[key];
    if (registering) {
        if (existing) throw new Error(t.authLocalExists);
        const salt = crypto.getRandomValues(new Uint8Array(16));
        accounts[key] = { username, salt: bytesToBase64(salt), hash: await hashLocalPassword(password, salt), iterations: 210000 };
        localStorage.setItem("boxLocalAccounts", JSON.stringify(accounts));
    } else {
        if (!existing) throw new Error(t.authLocalWrong);
        const candidate = await hashLocalPassword(password, base64ToBytes(existing.salt), existing.iterations || 210000);
        if (!constantTimeEqual(candidate, existing.hash)) throw new Error(t.authLocalWrong);
    }
    const account = accounts[key];
    accountMode = "local-account";
    currentUser = account.username;
    userState = normalizeState(safeJSON(localStorage.getItem(localStateKey(currentUser)), EMPTY_STATE()));
    localStorage.setItem("boxLocalSession", key);
    document.getElementById("password").value = "";
    showApp();
}

function restoreLocalSession() {
    const key = localStorage.getItem("boxLocalSession");
    const account = safeJSON(localStorage.getItem("boxLocalAccounts"), {})[key];
    if (!key || !account) return false;
    accountMode = "local-account";
    currentUser = account.username;
    userState = normalizeState(safeJSON(localStorage.getItem(localStateKey(currentUser)), EMPTY_STATE()));
    showApp();
    return true;
}

function continueAsGuest() {
    accountMode = "guest";
    currentUser = uiText[currentLang].guestName;
    userState = normalizeState(safeJSON(localStorage.getItem("boxGuestState"), EMPTY_STATE()));
    showApp();
}

async function logout() {
    if (!STATIC_MODE && accountMode === "account") {
        try { await apiFetch("/api/auth/logout", { method: "POST" }); } catch (_error) { /* local logout still proceeds */ }
    }
    if (accountMode === "local-account") localStorage.removeItem("boxLocalSession");
    currentUser = ""; userState = EMPTY_STATE();
    ["tabEmotions", "tabLibrary", "tabNotes", "tabAbout"].forEach(id => document.getElementById(id).classList.add("hidden"));
    document.getElementById("bottomNav").classList.remove("show");
    document.getElementById("authSection").classList.remove("hidden");
    history.replaceState(null, "", location.pathname + location.search);
    isLogin = true; setupAuthMode();
}

function showApp() {
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("userNameDisplay").innerText = currentUser;
    document.getElementById("bottomNav").classList.add("show");
    if (!location.hash) history.replaceState(null, "", "#emotions");
    applyRoute();
}

function setHash(hash, replace = false) {
    if (applyingRoute || location.hash === hash) return;
    history[replace ? "replaceState" : "pushState"](null, "", hash);
}

function applyRoute(preserveDetail = false) {
    if (!currentUser) return;
    applyingRoute = true;
    const parts = location.hash.replace(/^#/, "").split("/").filter(Boolean);
    const route = parts[0] || "emotions";
    if (route === "library" || route === "notes" || route === "about") switchTab(route, false);
    else if (route === "category" && emotionDB[parts[1]]) {
        switchTab("emotions", false); openCategory(parts[1], false);
    } else if (route === "emotion" && emotionDB[parts[1]]) {
        const index = findEmotionIndexBySlug(parts[1], parts.slice(2).join("/"));
        switchTab("emotions", false); openCategory(parts[1], false); openDetail(index < 0 ? 0 : index, false, !preserveDetail);
    } else switchTab("emotions", false);
    applyingRoute = false;
}

function switchTab(tabName, updateRoute = true) {
    activeTab = tabName;
    const map = { emotions: ["tabEmotions", "navEmo"], library: ["tabLibrary", "navLib"], notes: ["tabNotes", "navNote"], about: ["tabAbout", "navAbout"] };
    Object.values(map).forEach(([tab, nav]) => {
        document.getElementById(tab).classList.add("hidden");
        document.getElementById(nav).classList.remove("active");
        document.getElementById(nav).removeAttribute("aria-current");
    });
    document.getElementById(map[tabName][0]).classList.remove("hidden");
    document.getElementById(map[tabName][1]).classList.add("active");
    document.getElementById(map[tabName][1]).setAttribute("aria-current", "page");
    document.getElementById("scrollArea").scrollTop = 0;
    if (tabName === "emotions") renderCategories();
    if (tabName === "library") renderLibrary();
    if (tabName === "notes") { hideCreateNote(); renderNotes(); }
    if (updateRoute) setHash(`#${tabName}`);
}

function renderCategories() {
    currentEmotionView = "home"; activeSubIndex = -1;
    const t = uiText[currentLang];
    setText({ dashTitle: t.dashTitle, dashSubtitle: t.dashSub });
    document.getElementById("detailViewWrapper").classList.add("hidden");
    document.getElementById("homeView").classList.remove("hidden");
    renderSavedPanels();
    renderEmotionWheel();
    document.getElementById("mainGrid").innerHTML = Object.entries(emotionDB).map(([key, data], index) => {
        const title = categoryTitle(data);
        return `<button type="button" class="card" style="animation-delay:${index * .04}s;border-top:3px solid ${data.color}" onclick="openCategory('${key}')">
            <span class="card-emoji" style="background:${data.color}22;color:${data.color}">${data.icon}</span>
            <span class="card-info"><span class="card-title">${escapeHTML(title)}</span><span class="card-desc">${data.subs[currentLang].length} ${t.variations}</span></span>
        </button>`;
    }).join("");
}

function renderEmotionWheel() {
    const entries = Object.entries(emotionDB), segment = 360 / entries.length;
    const wheel = document.getElementById("emotionWheel");
    wheel.setAttribute("aria-label", uiText[currentLang].wheelLabel);
    const gap = 1.35;
    wheel.style.background = `conic-gradient(${entries.flatMap(([_key, category], index) => {
        const start = index * segment, end = (index + 1) * segment;
        return [
            `var(--surface-solid) ${start}deg ${start + gap}deg`,
            `${category.color} ${start + gap}deg ${end - gap}deg`,
            `var(--surface-solid) ${end - gap}deg ${end}deg`
        ];
    }).join(",")})`;
    wheel.innerHTML = `${entries.map(([key, category], index) => {
        const title = categoryTitle(category), angle = index * segment + segment / 2;
        return `<button type="button" class="wheel-node" data-wheel-key="${key}" style="--angle:${angle}deg;--node-color:${category.color}" onclick="openCategory('${key}')" title="${escapeHTML(title)}" aria-label="${escapeHTML(title)}">${category.icon}</button>`;
    }).join("")}<div class="wheel-center"><span class="wheel-center-title" id="wheelCenterTitle">${escapeHTML(uiText[currentLang].wheelCenter)}</span><span class="wheel-center-hint" id="wheelCenterHint">${escapeHTML(uiText[currentLang].wheelCenterHint)}</span></div>`;
    document.getElementById("emotionWheelLegend").innerHTML = entries.map(([key, category]) => `
        <button type="button" class="wheel-legend-item" data-wheel-key="${key}" style="--legend-color:${category.color}" onclick="openCategory('${key}')">
            <span class="wheel-legend-icon" aria-hidden="true">${category.icon}</span>
            <span class="wheel-legend-copy"><span class="wheel-legend-name">${escapeHTML(categoryTitle(category))}</span><span class="wheel-legend-count">${category.subs[currentLang].length} ${escapeHTML(uiText[currentLang].variations)}</span></span>
            <span class="wheel-legend-arrow" aria-hidden="true">→</span>
        </button>`).join("");
    document.querySelectorAll("[data-wheel-key]").forEach(button => {
        const key = button.dataset.wheelKey;
        button.addEventListener("pointerenter", () => previewWheelSpectrum(key));
        button.addEventListener("pointerleave", resetWheelPreview);
        button.addEventListener("focus", () => previewWheelSpectrum(key));
        button.addEventListener("blur", resetWheelPreview);
    });
}

function previewWheelSpectrum(key) {
    const category = emotionDB[key];
    if (!category) return;
    document.getElementById("emotionWheel").classList.add("has-active");
    document.querySelectorAll("[data-wheel-key]").forEach(button => button.classList.toggle("is-active", button.dataset.wheelKey === key));
    setText({
        wheelCenterTitle: categoryTitle(category),
        wheelCenterHint: `${category.subs[currentLang].length} ${uiText[currentLang].variations}`
    });
}

function resetWheelPreview() {
    document.getElementById("emotionWheel").classList.remove("has-active");
    document.querySelectorAll("[data-wheel-key]").forEach(button => button.classList.remove("is-active"));
    setText({ wheelCenterTitle: uiText[currentLang].wheelCenter, wheelCenterHint: uiText[currentLang].wheelCenterHint });
}

function renderSavedPanels() {
    const t = uiText[currentLang];
    const groups = [
        [t.favoritesTitle, userState.favorites.slice(0, 5)],
        [t.recentTitle, userState.history.slice(0, 5).map(item => item.id)]
    ];
    document.getElementById("savedPanels").innerHTML = groups.filter(([_title, ids]) => ids.length).map(([title, ids]) => `
        <section class="saved-panel"><div class="saved-panel-title">${escapeHTML(title)}</div><div class="saved-links">
        ${ids.map(id => emotionLinkButton(id)).join("")}</div></section>`).join("");
}

function emotionLinkButton(id) {
    const target = emotionFromId(id);
    if (!target) return "";
    const item = emotionDB[target.catKey].subs[currentLang][target.index];
    return `<button type="button" class="saved-link" onclick="openEmotionAt('${target.catKey}',${target.index})">${item.emoji} ${escapeHTML(item.name)}</button>`;
}

function openCategory(catKey, updateRoute = true) {
    if (!emotionDB[catKey]) return;
    activeCategory = catKey; activeSubIndex = -1; currentEmotionView = "subs";
    document.getElementById("homeView").classList.add("hidden");
    document.getElementById("detailViewWrapper").classList.remove("hidden");
    document.getElementById("reflectionDetail").classList.add("hidden");
    const data = emotionDB[catKey], t = uiText[currentLang];
    const intro = document.getElementById("spectrumIntro");
    const localizedTitle = data.title[currentLang];
    const titleParts = currentLang === "id" ? localizedTitle.match(/^(.+?) \((.+)\)$/) : null;
    intro.classList.remove("hidden");
    intro.style.setProperty("--spectrum-color", data.color);
    setText({
        txtBack: t.backToSpectrums,
        spectrumKicker: t.spectrumKicker,
        spectrumIcon: data.icon,
        spectrumTitle: titleParts ? titleParts[1] : localizedTitle,
        spectrumTitleTranslation: titleParts ? titleParts[2] : "",
        spectrumDescription: spectrumDescriptions[catKey][currentLang],
        spectrumCount: `${data.subs[currentLang].length} ${t.variations}`,
        spectrumPrompt: t.subPrompt.replace(/:$/, ""),
        spectrumNote: t.spectrumNote
    });
    document.getElementById("spectrumTitleTranslation").classList.toggle("hidden", !titleParts);
    const grid = document.getElementById("subGrid");
    grid.classList.remove("hidden");
    grid.innerHTML = data.subs[currentLang].map((item, index) => `
        <button type="button" class="card span-2" style="animation-delay:${index * .04}s;border-left:4px solid ${data.color}" onclick="openDetail(${index})">
            <span class="card-emoji" style="font-size:32px;background:${data.color}22;color:${data.color}">${item.emoji}</span>
            <span class="card-info"><span class="card-title" style="font-size:16px">${escapeHTML(item.name)}</span><span class="card-desc">${t.clickRefl}</span></span>
        </button>`).join("");
    document.getElementById("scrollArea").scrollTop = 0;
    if (updateRoute) setHash(`#category/${catKey}`);
}

function openDetail(index, updateRoute = true, track = true) {
    if (!emotionDB[activeCategory]?.subs[currentLang][index]) return;
    currentEmotionView = "detail"; activeSubIndex = index;
    const category = emotionDB[activeCategory], item = category.subs[currentLang][index], t = uiText[currentLang];
    const emoji = document.getElementById("resEmoji");
    emoji.innerText = item.emoji; emoji.style.background = `${category.color}22`; emoji.style.color = category.color;
    setText({ txtBack: t.backToCategory, resName: item.name, resReflection: item.reflection, resAdvice: item.advice || "" });
    document.getElementById("adviceSection").classList.toggle("hidden", !item.advice);
    document.getElementById("seeAlsoSection").classList.toggle("hidden", !item.seeAlso);
    document.getElementById("resSeeAlso").innerHTML = item.seeAlso ? buildSeeAlsoLinks(item.seeAlso) : "";
    const reflectionCard = document.getElementById("reflectionCardBox");
    reflectionCard.style.borderColor = category.color;
    reflectionCard.style.setProperty("--detail-color", category.color);
    document.getElementById("subGrid").classList.add("hidden");
    document.getElementById("spectrumIntro").classList.add("hidden");
    document.getElementById("reflectionDetail").classList.remove("hidden");
    document.getElementById("scrollArea").scrollTop = 0;
    updateFavoriteButton();
    const id = emotionId(activeCategory, index);
    if (track) recordView(id);
    if (updateRoute) setHash(`#emotion/${activeCategory}/${emotionSlug(activeCategory, index)}`);
}

function openEmotionAt(catKey, index) { switchTab("emotions", false); openCategory(catKey, false); openDetail(index); }
function openCategoryLink(catKey) { switchTab("emotions", false); openCategory(catKey); }
function goBackEmotions() { currentEmotionView === "detail" ? openCategory(activeCategory) : switchTab("emotions"); }

function emotionSlug(catKey, index) { return slugify(emotionDB[catKey].subs.id[index].name); }
function emotionId(catKey, index) { return `${catKey}:${emotionSlug(catKey, index)}`; }
function findEmotionIndexBySlug(catKey, slug) { return emotionDB[catKey].subs.id.findIndex((_item, index) => emotionSlug(catKey, index) === slug); }
function emotionFromId(id) {
    const [catKey, ...rest] = String(id).split(":");
    if (!emotionDB[catKey]) return null;
    const index = findEmotionIndexBySlug(catKey, rest.join(":"));
    return index < 0 ? null : { catKey, index };
}
function slugify(value) { return normalizeEmotionName(value).replace(/\s+/g, "-"); }
function normalizeEmotionName(value) { return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
function normalizeSearchText(value) { return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim(); }
function levenshteinDistance(left, right) {
    const a = [...left], b = [...right];
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let previous = Array.from({ length: b.length + 1 }, (_value, index) => index);
    for (let row = 1; row <= a.length; row++) {
        const current = [row];
        for (let column = 1; column <= b.length; column++) {
            current[column] = Math.min(
                current[column - 1] + 1,
                previous[column] + 1,
                previous[column - 1] + (a[row - 1] === b[column - 1] ? 0 : 1)
            );
        }
        previous = current;
    }
    return previous[b.length];
}

function fuzzyMatchScore(query, fields) {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return 1;
    const normalizedFields = fields.map(normalizeSearchText).filter(Boolean);
    if (normalizedFields.some(field => field.includes(normalizedQuery))) return 100;
    const queryTokens = normalizedQuery.split(" ").filter(Boolean);
    const candidateTokens = [...new Set(normalizedFields.flatMap(field => field.split(" ").filter(Boolean)))];
    let totalDistance = 0;
    for (const token of queryTokens) {
        const distances = candidateTokens.map(candidate => levenshteinDistance(token, candidate));
        const best = distances.length ? Math.min(...distances) : Infinity;
        const tolerance = token.length <= 3 ? 0 : Math.max(1, Math.floor(token.length * .34));
        if (best > tolerance) return 0;
        totalDistance += best;
    }
    return Math.max(1, 70 - totalDistance * 10);
}
function categoryTitle(category) { return currentLang === "zh" ? category.title.zh : category.title[currentLang].split(" (")[0]; }

function recordView(id) {
    userState.history = [{ id, viewedAt: Date.now() }, ...userState.history.filter(entry => entry.id !== id)].slice(0, 50);
    userState.viewCounts[id] = (userState.viewCounts[id] || 0) + 1;
    persistState();
}

function toggleFavorite() {
    const id = emotionId(activeCategory, activeSubIndex), index = userState.favorites.indexOf(id);
    if (index >= 0) userState.favorites.splice(index, 1); else userState.favorites.unshift(id);
    persistState(); updateFavoriteButton(); renderSavedPanels();
}

function updateFavoriteButton() {
    const button = document.getElementById("favoriteBtn"), t = uiText[currentLang];
    const active = activeSubIndex >= 0 && userState.favorites.includes(emotionId(activeCategory, activeSubIndex));
    button.classList.toggle("active", active); button.innerText = `${active ? "★" : "☆"} ${active ? t.favorited : t.favorite}`;
}

function findRelatedTarget(name) {
    const normalized = normalizeEmotionName(name);
    for (const [catKey, category] of Object.entries(emotionDB)) {
        const index = category.subs.id.findIndex(item => normalizeEmotionName(item.name) === normalized);
        if (index >= 0) return { type: "item", catKey, index, color: category.color };
        if ([catKey, category.title.en.split(" (")[0]].some(value => normalizeEmotionName(value) === normalized)) return { type: "category", catKey, color: category.color };
    }
    return null;
}

function buildSeeAlsoLinks(value) {
    return value.split(/[,;]/).map(name => name.trim()).filter(Boolean).map(name => {
        const target = findRelatedTarget(name); if (!target) return "";
        const label = target.type === "item" ? emotionDB[target.catKey].subs[currentLang][target.index].name : categoryTitle(emotionDB[target.catKey]);
        const action = target.type === "item" ? `openEmotionAt('${target.catKey}',${target.index})` : `openCategoryLink('${target.catKey}')`;
        return `<button type="button" class="see-also-link" style="color:${target.color}" onclick="${action}" aria-label="${escapeHTML(uiText[currentLang].openRelatedLabel)}: ${escapeHTML(label)}">${escapeHTML(label)} →</button>`;
    }).join("");
}

function containsCrisisLanguage(text) { const lower = text.toLowerCase(); return CRISIS_TERMS.some(term => lower.includes(term)); }
function showCrisisMessage(box) { const t = uiText[currentLang]; box.classList.remove("hidden"); box.classList.add("error"); box.innerHTML = `<strong>${escapeHTML(t.crisisTitle)}</strong><div>${escapeHTML(t.crisisMessage)}</div>`; }

function localKeywordScore(text, keyword) {
    const normalizedText = normalizeSearchText(text), normalizedKeyword = normalizeSearchText(keyword);
    let start = 0, score = 0;
    while ((start = normalizedText.indexOf(normalizedKeyword, start)) >= 0) {
        const before = normalizedText.slice(Math.max(0, start - 35), start).trim().split(/\s+/).slice(-3);
        if (!before.some(word => LOCAL_NEGATIONS.includes(word))) score += normalizedKeyword.includes(" ") ? 2 : 1;
        start += normalizedKeyword.length;
    }
    return score;
}

function analyzeEmotionLocally(text) {
    const scores = Object.entries(LOCAL_EMOTION_KEYWORDS).map(([emotion, keywords]) => ({
        emotion, score: keywords.reduce((total, keyword) => total + localKeywordScore(text, keyword), 0)
    })).filter(item => item.score > 0).sort((left, right) => right.score - left.score);
    if (!scores.length) return { detected_emotion: "Enjoyment", candidates: [], unclear: true, follow_up: localFollowUpQuestion() };
    const top = scores.slice(0, 3), weights = top.map(item => Math.exp(Math.min(item.score, 8)));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    const candidates = top.map((item, index) => ({ emotion: item.emotion, confidence: weights[index] / total }));
    const margin = candidates[0].confidence - (candidates[1]?.confidence || 0);
    const unclear = candidates[0].confidence < .52 || (candidates.length > 1 && margin < .18);
    return { detected_emotion: candidates[0].emotion, candidates, unclear, follow_up: unclear ? localFollowUpQuestion() : null };
}

function localFollowUpQuestion() {
    if (currentLang === "en") return "Which feeling is strongest: sadness, anger, fear, emptiness, or perhaps relief?";
    if (currentLang === "zh") return "哪一种感受最强烈：悲伤、愤怒、恐惧、空虚，还是释然？";
    return "Emosi mana yang paling kuat: sedih, marah, takut, hampa, atau justru lega?";
}

async function analyzeCurhat() {
    const t = uiText[currentLang], input = document.getElementById("curhatInput"), text = input.value.trim();
    const box = document.getElementById("curhatResult"), button = document.getElementById("curhatBtn");
    if (!text) return showToast(t.curhatEmpty);
    if (containsCrisisLanguage(text)) return showCrisisMessage(box);
    const label = button.innerText; button.innerText = "…"; button.disabled = true; button.setAttribute("aria-busy", "true");
    try {
        const data = STATIC_MODE
            ? analyzeEmotionLocally(text)
            : await apiFetch("/api/analyze", { method: "POST", body: JSON.stringify({ text, language: currentLang }) });
        if (data.crisis) return showCrisisMessage(box);
        const candidates = (data.candidates || []).map(candidate => {
            const key = BACKEND_CATEGORY_MAP[candidate.emotion], category = emotionDB[key];
            return `<div class="candidate-row"><span>${category.icon} ${escapeHTML(categoryTitle(category))}</span><strong>${Math.round(candidate.confidence * 100)}%</strong></div>`;
        }).join("");
        const primary = BACKEND_CATEGORY_MAP[data.detected_emotion] || "enjoyment";
        box.classList.remove("hidden", "error");
        box.innerHTML = `<strong>${t.curhatResultLabel}</strong><div class="analysis-candidates">${candidates || escapeHTML(t.curhatResultMessage)}</div>
            ${data.follow_up ? `<div class="follow-up-question">${escapeHTML(data.follow_up)}</div>` : ""}
            <button type="button" class="curhat-result-btn" onclick="openCategoryLink('${primary}')">${t.curhatSeeDetail}</button>`;
    } catch (_error) {
        box.classList.remove("hidden"); box.classList.add("error"); box.innerHTML = `<div>${escapeHTML(t.curhatOffline)}</div>`;
    } finally { button.innerText = label; button.disabled = false; button.removeAttribute("aria-busy"); }
}

function setLibraryFilter(filter) {
    libraryFilter = filter;
    document.querySelectorAll(".filter-chip").forEach(button => button.classList.toggle("active", button.dataset.filter === filter));
    renderLibrary();
}

function itemMatchesFilter(catKey, id) {
    if (libraryFilter === "all") return true;
    if (CATEGORY_TONES[libraryFilter]) return CATEGORY_TONES[libraryFilter].includes(catKey);
    if (libraryFilter === "favorites") return userState.favorites.includes(id);
    if (libraryFilter === "recent") return userState.history.some(entry => entry.id === id);
    if (libraryFilter === "frequent") return (userState.viewCounts[id] || 0) >= 2;
    return true;
}

function renderLibrary() {
    const container = document.getElementById("libraryContainer"), t = uiText[currentLang];
    const query = normalizeSearchText(document.getElementById("librarySearch").value);
    let count = 0;
    container.innerHTML = Object.entries(emotionDB).map(([catKey, category]) => {
        const categoryMatch = !query || fuzzyMatchScore(query, [catKey, category.title.id, category.title.en, category.title.zh]) > 0;
        const items = category.subs[currentLang].map((item, index) => {
            const id = emotionId(catKey, index);
            const searchScore = !query ? 1 : fuzzyMatchScore(query, [
                item.name, item.reflection, item.advice || "",
                category.subs.id[index].name, category.subs.en[index].name, category.subs.zh[index].name
            ]);
            if ((!categoryMatch && searchScore === 0) || !itemMatchesFilter(catKey, id)) return "";
            count += 1;
            return `<article class="lib-item">
                <button type="button" class="lib-name-button" onclick="openEmotionAt('${catKey}',${index})">${item.emoji} ${escapeHTML(item.name)}</button>
                <div class="lib-item-desc clamped" id="lib-desc-${catKey}-${index}">${escapeHTML(item.reflection)}</div>
                <button type="button" class="read-more" onclick="toggleLibraryText('${catKey}',${index},this)">${t.readMore}</button>
                ${item.seeAlso ? `<div class="lib-item-see"><div class="lib-see-label">${t.lblSeeAlso.replace("🔗 ", "")}</div><div class="see-also-links">${buildSeeAlsoLinks(item.seeAlso)}</div></div>` : ""}
            </article>`;
        }).join("");
        if (!items) return "";
        return `<details class="lib-category-card" style="border-left:4px solid ${category.color}" ${query || libraryFilter !== "all" ? "open" : ""}>
            <summary><div class="lib-cat-title" style="color:${category.color}">${category.icon} ${escapeHTML(category.title[currentLang])}</div></summary>${items}</details>`;
    }).join("");
    document.getElementById("libraryResultCount").innerText = count ? `${count} ${t.resultSuffix}` : t.noSearchResults;
    if (!count) container.innerHTML = `<div class="empty-state"><div class="empty-icon">🔎</div><div>${escapeHTML(t.noSearchResults)}</div></div>`;
}

function toggleLibraryText(catKey, index, button) {
    const text = document.getElementById(`lib-desc-${catKey}-${index}`), expanded = !text.classList.contains("clamped");
    text.classList.toggle("clamped", expanded); button.innerText = expanded ? uiText[currentLang].readMore : uiText[currentLang].readLess;
}
function clearLibrarySearch() { const input = document.getElementById("librarySearch"); input.value = ""; renderLibrary(); input.focus(); }
function scrollToTop() { document.getElementById("scrollArea").scrollTo({ top: 0, behavior: "smooth" }); }

function updateScrollFeedback(scroller) {
    const distance = Math.max((scroller.scrollHeight || 0) - (scroller.clientHeight || 0), 0);
    const progress = distance ? Math.min(1, Math.max(0, scroller.scrollTop / distance)) : 0;
    document.getElementById("scrollProgressBar").style.transform = `scaleX(${progress})`;
    document.getElementById("scrollFab").classList.toggle("visible", scroller.scrollTop > Math.max(260, (scroller.clientHeight || 0) * .55));
}

function getNotes() { return userState.notes; }
function renderNotes() {
    const t = uiText[currentLang], query = normalizeSearchText(document.getElementById("notesSearch").value);
    const notes = [...getNotes()].filter(note => !query || fuzzyMatchScore(query, [note.text, note.tag || ""]) > 0).sort((a, b) => (b.updatedAt || b.id) - (a.updatedAt || a.id));
    document.getElementById("notesContainer").innerHTML = notes.length ? notes.map((note, index) => `
        <article class="note-item" style="animation-delay:${index * .04}s"><div class="note-header"><div class="note-date">${escapeHTML(note.date)}</div>
        <div class="note-buttons"><button type="button" class="btn-delete" onclick="showCreateNote(${note.id})" title="${t.editNote}" aria-label="${t.editNote}">✏️</button>
        <button type="button" class="btn-delete" onclick="deleteNote(${note.id})" title="${t.deleteNoteLabel}" aria-label="${t.deleteNoteLabel}">🗑️</button></div></div>
        <div class="note-content">${escapeHTML(note.text)}</div>${note.tag ? `<span class="note-tag">${escapeHTML(note.tag)}</span>` : ""}</article>`).join("")
        : `<div class="empty-state"><div class="empty-icon">📝</div><div>${t.emptyNote}</div></div>`;
}

function populateNoteTags() {
    const select = document.getElementById("noteTag"), previous = select.value;
    select.innerHTML = `<option value="">—</option>${Object.entries(emotionDB).map(([key, category]) => `<option value="${key}">${category.icon} ${escapeHTML(categoryTitle(category))}</option>`).join("")}`;
    select.value = previous;
}

function showCreateNote(id = null) {
    editingNoteId = id;
    const note = id === null ? null : getNotes().find(item => item.id === id);
    document.getElementById("notesListView").classList.add("hidden");
    document.getElementById("noteCreateView").classList.remove("hidden");
    document.getElementById("noteInput").value = note?.text || "";
    document.getElementById("noteTag").value = note?.tag || "";
    setText({ createNoteTitle: note ? uiText[currentLang].editNote : uiText[currentLang].createNoteTitle, btnSaveNote: note ? uiText[currentLang].updateNote : uiText[currentLang].btnSave });
    document.getElementById("noteInput").focus();
}
function hideCreateNote() { editingNoteId = null; document.getElementById("noteCreateView").classList.add("hidden"); document.getElementById("notesListView").classList.remove("hidden"); }

function saveNote() {
    const text = document.getElementById("noteInput").value.trim(); if (!text) return;
    const now = new Date(), date = now.toLocaleDateString(currentLang === "id" ? "id-ID" : (currentLang === "zh" ? "zh-CN" : "en-US"), { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    const tag = document.getElementById("noteTag").value;
    if (editingNoteId !== null) {
        const note = getNotes().find(item => item.id === editingNoteId);
        if (note) Object.assign(note, { text, tag, date, updatedAt: Date.now() });
    } else userState.notes.push({ id: Date.now(), text, tag, date, updatedAt: Date.now() });
    persistState(); showToast(uiText[currentLang].toastOkNote, "success"); hideCreateNote(); renderNotes();
}

function deleteNote(id) {
    const index = getNotes().findIndex(note => note.id === id); if (index < 0) return;
    deletedNote = { note: getNotes()[index], index }; getNotes().splice(index, 1); persistState(); renderNotes();
    showToast(uiText[currentLang].toastDelNote, "success", uiText[currentLang].undo);
}
function undoDeleteNote() { if (!deletedNote) return; getNotes().splice(deletedNote.index, 0, deletedNote.note); deletedNote = null; persistState(); renderNotes(); showToast(uiText[currentLang].noteRestored, "success"); }

function exportNotes() {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), notes: getNotes() }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `box-of-emotions-notes-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url);
}

function escapeHTML(value) { return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character])); }

async function installPWA() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    document.getElementById("installBtn").classList.add("hidden");
}

function getReminderSettings() {
    const saved = safeJSON(localStorage.getItem(REMINDER_STORAGE_KEY), {});
    return {
        enabled: saved.enabled === true,
        time: /^([01]\d|2[0-3]):[0-5]\d$/.test(saved.time || "") ? saved.time : "20:00",
        lastSentDate: typeof saved.lastSentDate === "string" ? saved.lastSentDate : ""
    };
}

function persistReminderSettings(settings) {
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings));
}

function supportsNotifications() {
    return "Notification" in window;
}

function updateReminderUI() {
    const timeInput = document.getElementById("reminderTime");
    const toggle = document.getElementById("reminderToggle");
    const test = document.getElementById("reminderTest");
    const status = document.getElementById("reminderStatus");
    if (!timeInput || !toggle || !test || !status) return;
    const settings = getReminderSettings(), t = uiText[currentLang];
    timeInput.value = settings.time;
    toggle.innerText = settings.enabled ? t.reminderDisable : t.reminderEnable;
    toggle.classList.toggle("is-active", settings.enabled);
    status.classList.remove("is-active", "is-warning");
    const usableOrigin = ["http:", "https:"].includes(location.protocol);
    const permission = supportsNotifications() ? window.Notification.permission : "unsupported";
    test.disabled = permission !== "granted" || !usableOrigin;
    if (!supportsNotifications()) {
        status.innerText = t.reminderUnavailable;
        status.classList.add("is-warning");
    } else if (!usableOrigin) {
        status.innerText = t.reminderHttps;
        status.classList.add("is-warning");
    } else if (permission === "denied") {
        status.innerText = t.reminderPermissionDenied;
        status.classList.add("is-warning");
    } else if (settings.enabled && permission === "granted") {
        status.innerText = t.reminderActive.replace("{time}", settings.time);
        status.classList.add("is-active");
    } else {
        status.innerText = t.reminderInactive;
    }
}

function saveReminderTime() {
    const settings = getReminderSettings();
    const value = document.getElementById("reminderTime").value;
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
        settings.time = value;
        settings.lastSentDate = "";
        persistReminderSettings(settings);
    }
    updateReminderUI();
    checkDailyReminder();
}

async function toggleDailyReminder() {
    const settings = getReminderSettings(), t = uiText[currentLang];
    if (settings.enabled) {
        settings.enabled = false;
        persistReminderSettings(settings);
        updateReminderUI();
        showToast(t.reminderDisabledToast, "success");
        return;
    }
    if (!["http:", "https:"].includes(location.protocol)) {
        showToast(t.reminderHttps, "error");
        updateReminderUI();
        return;
    }
    if (!supportsNotifications()) {
        showToast(t.reminderUnavailable, "error");
        updateReminderUI();
        return;
    }
    let permission = window.Notification.permission;
    if (permission === "default") permission = await window.Notification.requestPermission();
    if (permission !== "granted") {
        showToast(t.reminderPermissionDenied, "error");
        updateReminderUI();
        return;
    }
    settings.enabled = true;
    settings.time = document.getElementById("reminderTime").value || settings.time;
    settings.lastSentDate = "";
    persistReminderSettings(settings);
    updateReminderUI();
    showToast(t.reminderEnabledToast, "success");
    checkDailyReminder();
}

async function deliverReminderNotification(isTest = false) {
    const options = {
        body: REMINDER_NOTIFICATION.body,
        icon: "./icons/icon-192.png",
        tag: isTest ? "box-emotions-test" : "box-emotions-daily",
        renotify: true,
        data: { url: "./index.html#emotions" }
    };
    if ("serviceWorker" in navigator && ["http:", "https:"].includes(location.protocol)) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(REMINDER_NOTIFICATION.title, options);
        return;
    }
    const notification = new window.Notification(REMINDER_NOTIFICATION.title, options);
    notification.onclick = () => {
        window.focus();
        location.hash = "#emotions";
        notification.close();
    };
}

async function sendDailyReminder(isTest = false) {
    const t = uiText[currentLang];
    if (!["http:", "https:"].includes(location.protocol)) {
        if (isTest) showToast(t.reminderHttps, "error");
        return false;
    }
    if (!supportsNotifications() || window.Notification.permission !== "granted") {
        if (isTest) showToast(supportsNotifications() ? t.reminderPermissionDenied : t.reminderUnavailable, "error");
        return false;
    }
    try {
        await deliverReminderNotification(isTest);
        if (isTest) showToast(t.reminderTestSent, "success");
        return true;
    } catch (_error) {
        if (isTest) showToast(t.reminderUnavailable, "error");
        return false;
    }
}

function localDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

async function checkDailyReminder() {
    if (reminderInFlight) return;
    const settings = getReminderSettings();
    if (!settings.enabled || !supportsNotifications() || window.Notification.permission !== "granted") return;
    const now = new Date(), [hour, minute] = settings.time.split(":").map(Number);
    const today = localDateKey(now);
    if (now.getHours() * 60 + now.getMinutes() < hour * 60 + minute || settings.lastSentDate === today) return;
    reminderInFlight = true;
    try {
        if (await sendDailyReminder(false)) {
            settings.lastSentDate = today;
            persistReminderSettings(settings);
            updateReminderUI();
        }
    } finally {
        reminderInFlight = false;
    }
}

function startReminderMonitor() {
    clearInterval(reminderTimer);
    checkDailyReminder();
    reminderTimer = setInterval(checkDailyReminder, 30000);
}

if ("serviceWorker" in navigator && ["http:", "https:"].includes(location.protocol)) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js", { scope: "./" })
            .catch(error => console.error("Service worker registration failed:", error));
    });
}

const scrollArea = document.getElementById("scrollArea");
scrollArea.addEventListener("scroll", function () {
    document.getElementById("headerBar").classList.toggle("active-border", this.scrollTop > 10);
    updateScrollFeedback(this);
}, { passive: true });
updateScrollFeedback(scrollArea);

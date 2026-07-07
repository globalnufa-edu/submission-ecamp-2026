const CONFIG = {
  earlyBirdDeadline: "2026-11-15T23:59:59",

  // OPTION A: send data straight into a Google Form's responses
  // (leave formActionUrl empty to skip this and use Apps Script below instead)
  formActionUrl: "", // e.g. "https://docs.google.com/forms/d/e/1FAIpQLS.../formResponse"
  formEntryMap: {
    fullName: "entry.PASTE_ID_HERE",
    school: "entry.PASTE_ID_HERE",
    grade: "entry.PASTE_ID_HERE",
    age: "entry.PASTE_ID_HERE",
    gender: "entry.PASTE_ID_HERE",
    parentName: "entry.PASTE_ID_HERE",
    parentPhone: "entry.PASTE_ID_HERE",
    parentEmail: "entry.PASTE_ID_HERE",
    medical: "entry.PASTE_ID_HERE",
    tribePref: "entry.PASTE_ID_HERE",
  },

  // OPTION B: send data to a Google Apps Script Web App that writes to a Sheet
  // (only used if formActionUrl above is left empty)
  appsScriptUrl: "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE",
};

function updateCountdown() {
  const now = new Date();
  const target = new Date(CONFIG.earlyBirdDeadline);
  let diff = target - now;
  if (diff < 0) diff = 0;
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  document.getElementById("cd-days").textContent = d;
  document.getElementById("cd-hours").textContent = String(h).padStart(2, "0");
  document.getElementById("cd-mins").textContent = String(m).padStart(2, "0");
  document.getElementById("cd-secs").textContent = String(s).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Interactive tribe map: hover tooltip + click-to-jump-and-select
const tooltip = document.getElementById("tribeTooltip");
const mapWrap = document.querySelector(".map-section .wrap");

function positionTooltip(node) {
  const nodeBox = node.getBoundingClientRect();
  const wrapBox = mapWrap.getBoundingClientRect();
  let left = nodeBox.left + nodeBox.width / 2 - wrapBox.left;
  // keep the tooltip from spilling off the left/right edge on narrow screens
  const half = 90;
  left = Math.max(half, Math.min(left, wrapBox.width - half));
  tooltip.style.left = left + "px";
  tooltip.style.top = nodeBox.top - wrapBox.top + "px";
  document.getElementById("ttEmoji").textContent = node.dataset.emoji;
  document.getElementById("ttName").textContent = node.dataset.tribe;
  document.getElementById("ttTag").textContent = node.dataset.tag;
  tooltip.style.setProperty("--tint", node.dataset.color);
}

document.querySelectorAll(".tribe-node").forEach((node) => {
  const routeId = "route-" + node.dataset.tribe.toLowerCase().replace(" ", "");
  const route = document.getElementById(routeId);

  node.addEventListener("mouseenter", () => {
    node.classList.add("active");
    if (route) route.classList.add("active");
    positionTooltip(node);
    tooltip.classList.add("show");
  });

  node.addEventListener("mouseleave", () => {
    node.classList.remove("active");
    if (route) route.classList.remove("active");
    tooltip.classList.remove("show");
  });

  node.addEventListener("click", () => {
    const tribe = node.dataset.tribe;

    // works even on touch screens where hover never fires: show the same
    // ping + tooltip feedback right on tap, briefly, before jumping down
    node.classList.add("active");
    if (route) route.classList.add("active");
    positionTooltip(node);
    tooltip.classList.add("show");

    document
      .getElementById("register")
      .scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      node.classList.remove("active");
      if (route) route.classList.remove("active");
      tooltip.classList.remove("show");
      showStep(3);
      const radio = document.querySelector(
        'input[name="tribe"][value="' + tribe + '"]',
      );
      if (radio) {
        radio.checked = true;
        const label = document.getElementById("pick-" + tribe);
        if (label) {
          label.classList.remove("just-picked");
          void label.offsetWidth; // restart animation
          label.classList.add("just-picked");
        }
      }
    }, 550);
  });
});
function openLightbox(card) {
  const src = card.querySelector("img").src;
  document.getElementById("lightboxImg").src = src;
  document.getElementById("lightbox").classList.add("open");
}
function closeLightbox() {
  document.getElementById("lightbox").classList.remove("open");
}
document.getElementById("lightbox").addEventListener("click", function (e) {
  if (e.target.id === "lightbox") closeLightbox();
});

// Video card: show a YouTube thumbnail preview, open a popup to actually play it
function extractYouTubeId(input) {
  if (!input) return null;
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/,
  ];
  for (const re of patterns) {
    const match = input.match(re);
    if (match) return match[1];
  }
  // fallback: maybe they pasted the bare ID itself
  if (/^[a-zA-Z0-9_-]{6,}$/.test(input.trim())) return input.trim();
  return null;
}

const videoCard = document.getElementById("videoCard");
const videoId = extractYouTubeId(videoCard.dataset.video);

if (videoId) {
  // maxresdefault isn't always available — fall back to hqdefault if it fails to load
  const thumb = new Image();
  thumb.onload = function () {
    // YouTube serves a small placeholder image (120x90) when maxres doesn't exist
    const useHq = thumb.naturalWidth <= 120;
    videoCard.style.backgroundImage = `url(https://img.youtube.com/vi/${videoId}/${useHq ? "hqdefault" : "maxresdefault"}.jpg)`;
  };
  thumb.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
} else {
  videoCard.querySelector(".play-badge").innerHTML =
    '<div class="lbl">🎬 Highlight reel coming soon — paste your YouTube link into data-video in the code to activate this.</div>';
}

videoCard.addEventListener("click", function () {
  if (!videoId) return;
  const modal = document.getElementById("videoModal");
  const modalFrame = document.getElementById("modalVideoFrame");
  modalFrame.src = "https://www.youtube.com/embed/" + videoId + "?autoplay=1";
  modal.classList.add("open");
});

function closeVideoModal() {
  const modal = document.getElementById("videoModal");
  const modalFrame = document.getElementById("modalVideoFrame");
  modalFrame.src = ""; // stops playback when closed
  modal.classList.remove("open");
}
document.getElementById("videoModal").addEventListener("click", function (e) {
  if (e.target.id === "videoModal") closeVideoModal();
});

let currentStep = 1;
function showStep(n) {
  document.querySelectorAll(".form-step").forEach((el) => {
    el.classList.toggle("visible", Number(el.dataset.step) === n);
  });
  document.querySelectorAll(".steps .dot").forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.dot) <= n);
  });
  currentStep = n;
}
function validateStep(n) {
  const stepEl = document.querySelector('.form-step[data-step="' + n + '"]');
  const inputs = stepEl.querySelectorAll(
    "input[required], select[required], textarea[required]",
  );
  for (const inp of inputs) {
    if (!inp.value) {
      inp.focus();
      return false;
    }
  }
  return true;
}
function nextStep(n) {
  if (!validateStep(n)) return;
  showStep(n + 1);
}
function prevStep(n) {
  showStep(n - 1);
}

document
  .getElementById("regForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const errMsg = document.getElementById("errMsg");
    if (!validateStep(3)) {
      errMsg.style.display = "block";
      return;
    }
    errMsg.style.display = "none";

    const payload = {
      fullName: document.getElementById("fullName").value,
      school: document.getElementById("school").value,
      grade: document.getElementById("grade").value,
      age: document.getElementById("age").value,
      gender: document.getElementById("gender").value,
      parentName: document.getElementById("parentName").value,
      parentPhone: document.getElementById("parentPhone").value,
      parentEmail: document.getElementById("parentEmail").value,
      medical: document.getElementById("medical").value,
      tribePref:
        (document.querySelector('input[name="tribe"]:checked') || {}).value ||
        "-",
      submittedAt: new Date().toISOString(),
    };

    const btn = document.getElementById("submitBtn");
    btn.disabled = true;
    btn.textContent = "Sending...";

    try {
      if (CONFIG.formActionUrl && CONFIG.formActionUrl.startsWith("http")) {
        // OPTION A: submit straight into a Google Form's responses.
        // Google Forms blocks reading the response (no-cors), so we can't
        // confirm success/failure here — we just fire it and trust it landed.
        const params = new URLSearchParams();
        Object.keys(CONFIG.formEntryMap).forEach((key) => {
          params.append(CONFIG.formEntryMap[key], payload[key] ?? "");
        });
        await fetch(CONFIG.formActionUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        });
      } else if (
        CONFIG.appsScriptUrl &&
        CONFIG.appsScriptUrl.startsWith("http")
      ) {
        // OPTION B: send to an Apps Script Web App that writes into a Sheet.
        await fetch(CONFIG.appsScriptUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
      } else {
        console.log(
          "No submission target set yet. Registration payload:",
          payload,
        );
      }
      document.getElementById("regForm").style.display = "none";
      document.getElementById("successView").style.display = "block";
    } catch (err) {
      console.error(err);
      errMsg.textContent =
        "Something went wrong sending this — try again or contact the crew directly.";
      errMsg.style.display = "block";
      btn.disabled = false;
      btn.textContent = "Submit Registration ✓";
    }
  });

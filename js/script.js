const CONFIG = {
  earlyBirdDeadline: "2026-11-15T23:59:59",

  // OPTION A: send data straight into a Google Form's responses
  // (leave formActionUrl empty to skip this and use Apps Script below instead)
  formActionUrl: "", // e.g. "https://docs.google.com/forms/d/e/1FAIpQLS.../formResponse"
  formEntryMap: {
    fullName: "entry.PASTE_ID_HERE",
    dob: "entry.PASTE_ID_HERE",
    gender: "entry.PASTE_ID_HERE",
    bloodType: "entry.PASTE_ID_HERE",
    school: "entry.PASTE_ID_HERE",
    grade: "entry.PASTE_ID_HERE",
    city: "entry.PASTE_ID_HERE",
    district: "entry.PASTE_ID_HERE",
    address: "entry.PASTE_ID_HERE",
    camperPhone: "entry.PASTE_ID_HERE",
    parentName: "entry.PASTE_ID_HERE",
    parentPhone: "entry.PASTE_ID_HERE",
    parentEmail: "entry.PASTE_ID_HERE",
    medical: "entry.PASTE_ID_HERE",
    shirtSize: "entry.PASTE_ID_HERE",
    infoSource: "entry.PASTE_ID_HERE",
    tribePref: "entry.PASTE_ID_HERE",
    photoConsent: "entry.PASTE_ID_HERE",
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

// ============================================================
// CHOOSE YOUR TRIBE — carousel nav + dots + persistent selection
//
// TRUE INFINITE LOOP: the old version detected "end of scroll" using
// scrollLeft vs scrollWidth, but since several cards are visible at once,
// the browser runs out of scrollable room way before you've actually
// paged through all 6 tribes — that's why it looked "stuck" / snapped
// back early, and why only ~2 of the 6 dots ever lit up.
//
// Fix: clone the last few cards onto the front and the first few onto the
// back, so there's always a card waiting on either side. We track the
// "real" tribe index ourselves (0–5) instead of deriving it from
// scrollLeft, and silently teleport (no animation) back into the real
// card zone whenever the user drags/arrows into the cloned zone. The user
// never sees the seam — it just keeps gliding in whichever direction they
// pushed.
// ============================================================
(function () {
  const track = document.getElementById("tribeCarousel");
  const originalCards = Array.from(document.querySelectorAll(".tribe-card"));
  const prevBtn = document.getElementById("tribePrev");
  const nextBtn = document.getElementById("tribeNext");
  const dotsWrap = document.getElementById("tribeDots");

  if (!track || !originalCards.length) return; // tribe section not on this page

  const total = originalCards.length; // 6 tribes
  const CLONES = 3; // enough clones to always fill the visible viewport

  const headClones = originalCards.slice(-CLONES).map((c) => {
    const clone = c.cloneNode(true);
    clone.classList.add("tribe-card-clone");
    clone.setAttribute("aria-hidden", "true");
    return clone;
  });
  const tailClones = originalCards.slice(0, CLONES).map((c) => {
    const clone = c.cloneNode(true);
    clone.classList.add("tribe-card-clone");
    clone.setAttribute("aria-hidden", "true");
    return clone;
  });
  headClones.forEach((c) => track.insertBefore(c, track.firstChild));
  tailClones.forEach((c) => track.appendChild(c));

  // one dot per REAL tribe (not per clone) — this is what makes all 6 work
  originalCards.forEach((card, i) => {
    const dot = document.createElement("div");
    dot.className = "tribe-dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll(".tribe-dot");

  function cardStep() {
    const style = getComputedStyle(originalCards[0]);
    return (
      originalCards[0].offsetWidth + parseFloat(style.marginRight || 0) + 18
    ); // 18 = gap
  }

  // scrollLeft position where the "real" first card (index 0) sits
  function baseOffset() {
    return CLONES * cardStep();
  }

  let realIndex = 0;
  let isJumping = false; // true while we silently snap back into the real zone

  function setActiveDot(i) {
    dots.forEach((d, idx) => d.classList.toggle("active", idx === i));
  }

  // move the scroll position instantly, without triggering our own
  // "did we drift into the clones" logic or an animation
  function silentJump(left) {
    isJumping = true;
    track.scrollLeft = left;
    requestAnimationFrame(() => (isJumping = false));
  }

  function goTo(index, smooth = true) {
    realIndex = ((index % total) + total) % total;
    track.scrollTo({
      left: baseOffset() + realIndex * cardStep(),
      behavior: smooth ? "smooth" : "auto",
    });
    setActiveDot(realIndex);
  }

  // start on the first real card, no animation
  silentJump(baseOffset());

  prevBtn.addEventListener("click", () => goTo(realIndex - 1));
  nextBtn.addEventListener("click", () => goTo(realIndex + 1));

  // once a scroll/drag settles, check whether we've drifted into the
  // cloned zone — if so, silently teleport to the matching real position
  // so the loop never runs out of cards to show
  let scrollTimeout;
  track.addEventListener("scroll", () => {
    if (isJumping) return;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const step = cardStep();
      const rawIndex = Math.round((track.scrollLeft - baseOffset()) / step);

      if (rawIndex < 0) {
        silentJump(track.scrollLeft + total * step);
        realIndex = ((rawIndex % total) + total) % total;
      } else if (rawIndex >= total) {
        silentJump(track.scrollLeft - total * step);
        realIndex = rawIndex % total;
      } else {
        realIndex = rawIndex;
      }
      setActiveDot(realIndex);
    }, 80);
  });

  // ---- drag-to-scroll (mouse) + drag-vs-click distinction (mouse + touch) ----
  // This is the fix for "carousel only scrolls once": without this, a mouse
  // drag (or a touch swipe interpreted as a tap) was firing the card's click
  // handler, which jumped the whole page down to the registration form.
  let isDown = false;
  let dragged = false;
  let startX = 0;
  let startScroll = 0;

  function pointerDown(x) {
    isDown = true;
    dragged = false;
    startX = x;
    startScroll = track.scrollLeft;
  }
  function pointerMove(x) {
    if (!isDown) return;
    const delta = x - startX;
    if (Math.abs(delta) > 6) dragged = true;
    track.scrollLeft = startScroll - delta;
  }
  function pointerUp() {
    isDown = false;
  }

  track.addEventListener("mousedown", (e) => {
    pointerDown(e.pageX);
  });
  window.addEventListener("mousemove", (e) => pointerMove(e.pageX));
  window.addEventListener("mouseup", pointerUp);
  track.addEventListener("mouseleave", () => {
    if (isDown) pointerUp();
  });

  track.addEventListener(
    "touchstart",
    (e) => {
      pointerDown(e.touches[0].pageX);
    },
    { passive: true },
  );
  track.addEventListener(
    "touchmove",
    (e) => {
      pointerMove(e.touches[0].pageX);
    },
    { passive: true },
  );
  track.addEventListener("touchend", pointerUp);

  // click a card (real OR clone) = select it, matched by tribe name so the
  // highlight applies correctly no matter which physical copy was tapped.
  // This now stays on the current page and reflects the pick right here —
  // it no longer jumps down into the registration form.
  track.addEventListener("click", (e) => {
    if (dragged) return; // this was a drag/swipe, not a real tap — ignore it
    const card = e.target.closest(".tribe-card");
    if (!card) return;
    const tribe = card.dataset.tribe;

    document
      .querySelectorAll(".tribe-card")
      .forEach((c) => c.classList.remove("selected"));
    document
      .querySelectorAll('.tribe-card[data-tribe="' + tribe + '"]')
      .forEach((c) => c.classList.add("selected"));

    // silently sync the actual form field so it's ready when they get there
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

    // show the confirmation banner right here on the tribe section
    const banner = document.getElementById("tribeSelectedBanner");
    const nameEl = document.getElementById("tribeSelectedName");
    if (banner && nameEl) {
      nameEl.textContent = tribe;
      banner.classList.add("show");
    }
  });

  // keep the loop aligned if card width changes (resize / orientation change)
  window.addEventListener("resize", () =>
    silentJump(baseOffset() + realIndex * cardStep()),
  );
})();

// ============================================================
// SCROLL REVEAL — fades/slides sections in as you scroll down the page.
// Uses IntersectionObserver (no scroll-listener overhead) and stops
// observing each element once it has revealed, so it stays smooth
// even on long pages.
// ============================================================
(function () {
  const revealEls = document.querySelectorAll(".reveal-up, .reveal-stagger");
  if (!revealEls.length) return;

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  revealEls.forEach((el) => revealObserver.observe(el));
})();

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
    if (!validateStep(4)) {
      errMsg.style.display = "block";
      return;
    }
    errMsg.style.display = "none";

    const payload = {
      fullName: document.getElementById("fullName").value,
      dob: document.getElementById("dob").value,
      gender: document.getElementById("gender").value,
      bloodType: document.getElementById("bloodType").value,
      school: document.getElementById("school").value,
      grade: document.getElementById("grade").value,
      city: document.getElementById("city").value,
      district: document.getElementById("district").value,
      address: document.getElementById("address").value,
      camperPhone: document.getElementById("camperPhone").value,
      parentName: document.getElementById("parentName").value,
      parentPhone: document.getElementById("parentPhone").value,
      parentEmail: document.getElementById("parentEmail").value,
      medical: document.getElementById("medical").value,
      shirtSize: document.getElementById("shirtSize").value,
      infoSource: document.getElementById("infoSource").value,
      tribePref:
        (document.querySelector('input[name="tribe"]:checked') || {}).value ||
        "-",
      photoConsent: document.getElementById("photoConsent").checked,
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

// ============================================================
// ADVENTURE MAP ITINERARY
// ============================================================
(function () {
  const DAYS = [
    {
      day: 1,
      color: "coral",
      tagline: "Arrival &amp; Overcoming the Fear",
      activities: [
        { ic: "🪢", text: "Tribe Formation &amp; Identity" },
        { ic: "⚡", text: "Ice Breaking: Rapid Fire" },
        { ic: "🔥", text: "Welcome Bonfire Night" },
      ],
    },
    {
      day: 2,
      color: "teal",
      tagline: "Game Day 1 — Round 1 Begins",
      activities: [
        { ic: "🏁", text: "Amazing Race Round 1" },
        { ic: "🛍️", text: "Global Marketplace" },
        { ic: "🎬", text: "Movie Night, Talk Circle &amp; Performance" },
      ],
    },
    {
      day: 3,
      color: "gold",
      tagline: "Game Day 2 — Game Round 2",
      activities: [
        { ic: "🏁", text: "Amazing Race Round 2" },
        { ic: "📣", text: "Pitch Prep" },
        { ic: "🎥", text: "Video Recap &amp; Tribe Bonfire" },
      ],
    },
    {
      day: 4,
      color: "sydney",
      tagline: "Showtime",
      activities: [
        { ic: "🎪", text: "E-Camp Festival!" },
        { ic: "🌟", text: "Talent Showcase" },
        { ic: "🏆", text: "Awarding &amp; Grand Closing" },
        { ic: "🚌", text: "Pack-Up &amp; Departure" },
      ],
    },
  ];

  const mapStops = document.querySelectorAll(".map-stop");
  const panel = document.getElementById("dayDetailPanel");
  const trailLit = document.getElementById("trailLit");
  const pillsContainer = document.getElementById("dayPills");

  if (!mapStops.length || !panel) return; // itinerary map not on this page

  let trailLength = 0;

  // measure the real curve length so we can "light it up" proportionally
  if (trailLit && trailLit.getTotalLength) {
    trailLength = trailLit.getTotalLength();
    trailLit.style.strokeDasharray = trailLength;
    trailLit.style.strokeDashoffset = trailLength; // start fully unlit
  }

  function updateTrailLight(index) {
    if (!trailLength) return;
    const progress = index / (DAYS.length - 1); // 0 → 1
    trailLit.style.strokeDashoffset = trailLength * (1 - progress);
  }

  function renderPanel(index) {
    const d = DAYS[index];
    panel.setAttribute("data-color", d.color);

    const itemsHtml = d.activities
      .map((a) => `<li><span class="ic">${a.ic}</span> ${a.text}</li>`)
      .join("");

    panel.innerHTML = `
      <div class="panel-eyebrow">Day ${d.day}</div>
      <div class="panel-tagline">${d.tagline}</div>
      <ul class="panel-activities">${itemsHtml}</ul>
      <div class="panel-nav">
        <button class="panel-nav-btn" id="prevDayBtn" ${index === 0 ? "disabled" : ""}>← Prev</button>
        <span class="panel-progress" id="dayProgress">Day ${d.day} of ${DAYS.length}</span>
        <button class="panel-nav-btn" id="nextDayBtn" ${index === DAYS.length - 1 ? "disabled" : ""}>${index === DAYS.length - 1 ? "🎉 Journey Complete" : "Next Day →"}</button>
      </div>
    `;

    // re-bind nav buttons since innerHTML wipes old listeners
    document
      .getElementById("prevDayBtn")
      .addEventListener("click", () => goToDay(index - 1));
    document
      .getElementById("nextDayBtn")
      .addEventListener("click", () => goToDay(index + 1));
  }

  function setActiveStop(index) {
    mapStops.forEach((stop, i) => {
      stop.classList.toggle("active", i === index);
      if (i <= index) stop.classList.add("visited");
    });
  }

  function setActivePill(index) {
    if (!pillsContainer) return;
    pillsContainer.querySelectorAll(".day-pill").forEach((pill, i) => {
      pill.classList.toggle("active", i === index);
    });
  }

  function launchConfetti(anchorEl) {
    if (!anchorEl) return;
    const pieces = ["🎉", "✨", "🎊", "⭐"];
    for (let i = 0; i < 12; i++) {
      const span = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      span.textContent = pieces[Math.floor(Math.random() * pieces.length)];
      span.setAttribute("class", "journey-confetti-svg");
      span.setAttribute("font-size", "20");
      span.setAttribute("x", 0);
      span.setAttribute("y", 0);
      const dx = Math.random() * 140 - 70;
      const dy = Math.random() * -110 - 20;
      const rot = Math.random() * 360 - 180;
      span.style.setProperty("--dx", dx + "px");
      span.style.setProperty("--dy", dy + "px");
      span.style.setProperty("--rot", rot + "deg");
      span.style.animation = `confettiPopSvg 1.1s ease-out ${Math.random() * 0.2}s forwards`;
      anchorEl.appendChild(span);
      setTimeout(() => span.remove(), 1500);
    }
  }

  function goToDay(index) {
    if (index < 0 || index >= DAYS.length) return;
    setActiveStop(index);
    setActivePill(index);
    updateTrailLight(index);
    renderPanel(index);
    if (index === DAYS.length - 1) {
      launchConfetti(mapStops[index]);
    }
  }

  mapStops.forEach((stop, i) => {
    stop.addEventListener("click", () => goToDay(i));
  });

  if (pillsContainer) {
    pillsContainer.querySelectorAll(".day-pill").forEach((pill, i) => {
      pill.addEventListener("click", () => goToDay(i));
    });
  }

  // initial state
  setActiveStop(0);
  setActivePill(0);
  updateTrailLight(0);
})();

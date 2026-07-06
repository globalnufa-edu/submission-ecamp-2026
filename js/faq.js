const CATEGORIES = [
  { id: 'all',       label: 'All Gates',      icon: '🌐' },
  { id: 'checkin',   label: 'Check-In',       icon: '✈️' },
  { id: 'boarding',  label: 'Boarding Pass',  icon: '🎒' },
  { id: 'security',  label: 'Security Check', icon: '🛂' },
  { id: 'inflight',  label: 'In-Flight',      icon: '🌍' },
  { id: 'customs',   label: 'Customs',        icon: '💳' },
  { id: 'arrivals',  label: 'Arrivals',       icon: '🛬' }
];

const FAQS = [
  { cat:'checkin', icon:'✈️', q:"How do I register my child for Global Voice Camp?",
    a:"Head to the registration page, fill in camper + parent details across 3 quick steps, and submit. You'll get a confirmation and next steps via WhatsApp/email shortly after." },
  { cat:'checkin', icon:'✈️', q:"What's included in the price?",
    a:"3-night stay at Sentul Eco Edu Tourism Forest, all meals, 6 facilitators (3 native speakers + 3 local mentors), a camp kit, an official certificate, and full video documentation." },
  { cat:'checkin', icon:'✈️', q:"What's the difference between Early Bird and Normal price?",
    a:"Early Bird (Rp 2,750,000) is available until the countdown on our homepage hits zero — after that, registrations move to Normal price (Rp 2,950,000). Same camp, same everything, just a different deadline." },
  { cat:'checkin', icon:'✈️', q:"Is there a discount for siblings or groups from the same school?",
    a:"We're finalizing group rates for schools sending 10+ campers together — message our team directly and we'll work out a package." },
  { cat:'checkin', icon:'✈️', q:"What age or grade levels can join?",
    a:"Global Voice Camp is designed for junior high (SMP) students, roughly ages 12–15, though motivated senior high (SMA) students are welcome too." },

  { cat:'boarding', icon:'🎒', q:"What should my child pack?",
    a:"Comfortable outdoor clothes, a refillable water bottle, sunscreen, a light jacket for the evenings, prayer gear if needed, and any personal medication. A full packing checklist is sent after registration." },
  { cat:'boarding', icon:'🎒', q:"Is there a dress code or uniform?",
    a:"No strict uniform — just closed-toe shoes for the outdoor games and modest, activity-friendly clothing." },
  { cat:'boarding', icon:'🎒', q:"Can my child bring their phone?",
    a:"Phones are allowed but discouraged during activities to protect the \"100% English Zone\" immersion — most photo and video moments are already handled by our documentation team." },
  { cat:'boarding', icon:'🎒', q:"What if my child has dietary restrictions or allergies?",
    a:"There's a field for medical notes and allergies right in the registration form — our kitchen team adjusts meals accordingly." },

  { cat:'security', icon:'🛂', q:"What safety measures are in place during the camp?",
    a:"Three layers of supervision: native speaker facilitators, bilingual local mentors, and a 24/7 programme team handling logistics and safety protocols throughout the camp." },
  { cat:'security', icon:'🛂', q:"Who supervises the campers overnight?",
    a:"Facilitators and mentors stay on-site in the dormitory area every night, with the programme team on standby for anything urgent." },
  { cat:'security', icon:'🛂', q:"What happens if my child gets sick or injured?",
    a:"Our on-ground team has a basic first-aid setup and a clear protocol to contact parents and, if needed, the nearest clinic in Babakan Madang." },
  { cat:'security', icon:'🛂', q:"Are prayer times accommodated?",
    a:"Yes — Dzuhur, Ashar, Maghrib, and Isya are respected and built into the daily schedule." },

  { cat:'inflight', icon:'🌍', q:"What does a typical day look like?",
    a:"Mornings start with breakfast and a short English warm-up class, followed by the main activity block (races, marketplace, or pitching prep), then evenings wrap up with a shared event like movie night or a bonfire." },
  { cat:'inflight', icon:'🌍', q:"What is \"The Amazing Linguistic Race\"?",
    a:"A rotating set of 6 game stations — think relay races, blindfolded drawing, and charades — where every instruction and interaction has to happen in English." },
  { cat:'inflight', icon:'🌍', q:"Will my child really only speak English the whole time?",
    a:"That's the goal of the \"100% English Zone.\" Facilitators enforce it playfully, not punitively — kids pick it up fast once the games start." },
  { cat:'inflight', icon:'🌍', q:"What if my child doesn't speak English well yet?",
    a:"That's exactly who this camp is for. Facilitators scaffold instructions with gestures and repetition at first, and the game-based format makes mistakes feel low-stakes." },
  { cat:'inflight', icon:'🌍', q:"Who are the facilitators?",
    a:"3 native English speakers (flown in for the programme) plus 3 bilingual local mentors, rotating across all 6 tribes." },

  { cat:'customs', icon:'💳', q:"What payment methods are accepted?",
    a:"Bank transfer and QRIS — full payment details are sent by our team shortly after your registration is received." },
  { cat:'customs', icon:'💳', q:"Is the registration fee refundable if we cancel?",
    a:"Refund terms are shared alongside the payment instructions after registration. Reach out to our team as early as possible if plans change." },
  { cat:'customs', icon:'💳', q:"What happens if the camp is postponed or cancelled?",
    a:"Registered participants are notified immediately with the option to transfer to a rescheduled date or receive a refund." },

  { cat:'arrivals', icon:'🛬', q:"Will my child receive a certificate?",
    a:"Yes — every camper graduates with an official Certificate of Participation, handed out during the Grand Closing on Day 4." },
  { cat:'arrivals', icon:'🛬', q:"How can I see photos or videos from the camp?",
    a:"A highlight video and photo album are shared with parents after the camp — you can also catch the live Showcase via livestream on Day 4." },
  { cat:'arrivals', icon:'🛬', q:"Will there be a way to stay in touch with tribe friends after camp?",
    a:"Many tribes set up their own group chats, and we maintain an alumni community for past campers to stay connected." },
  { cat:'arrivals', icon:'🛬', q:"How do I contact the organizers with more questions?",
    a:"Use the \"Still have questions?\" button at the bottom of this page to reach our team directly on WhatsApp." }
];

let activeCategory = 'all';
let searchTerm = '';

function catMeta(id){
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
}

function renderGates(){
  const row = document.getElementById('gateRow');
  row.innerHTML = CATEGORIES.map(c => {
    const count = c.id === 'all' ? FAQS.length : FAQS.filter(f => f.cat === c.id).length;
    return `<div class="gate-tab ${c.id === activeCategory ? 'active' : ''}" data-cat="${c.id}">
      <span>${c.icon}</span> ${c.label} <span class="n">${count}</span>
    </div>`;
  }).join('');

  row.querySelectorAll('.gate-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeCategory = tab.dataset.cat;
      renderGates();
      renderList();
    });
  });
}

function renderList(){
  const list = document.getElementById('faqList');
  const noResults = document.getElementById('noResults');
  const term = searchTerm.trim().toLowerCase();

  const filtered = FAQS.filter(f => {
    const catOk = activeCategory === 'all' || f.cat === activeCategory;
    const searchOk = !term || f.q.toLowerCase().includes(term) || f.a.toLowerCase().includes(term);
    return catOk && searchOk;
  });

  if(filtered.length === 0){
    list.innerHTML = '';
    noResults.classList.add('show');
    return;
  }
  noResults.classList.remove('show');

  list.innerHTML = filtered.map((f, i) => `
    <div class="faq-item" data-index="${i}">
      <div class="faq-q">
        <div class="cat-icon">${f.icon}</div>
        <div class="qtext">${f.q}</div>
        <div class="chev">▾</div>
      </div>
      <div class="faq-a-wrap">
        <div class="faq-a">
          <span class="stamp-mini">✓ Answered</span>
          ${f.a}
        </div>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      // close all others for a cleaner "one gate at a time" feel
      list.querySelectorAll('.faq-item.open').forEach(other => {
        if(other !== item) other.classList.remove('open');
      });
      item.classList.toggle('open', !wasOpen);
    });
  });
}

document.getElementById('faqSearch').addEventListener('input', (e) => {
  searchTerm = e.target.value;
  renderList();
});

renderGates();
renderList();

const MAX_CAPACITY = 120;
const TABLE_COUNT = 15;
const SEATS_PER_TABLE = 8;
const TOTAL_SEATS = TABLE_COUNT * SEATS_PER_TABLE;

const state = {
  guests: [],
};

const form = document.getElementById('rsvp-form');
const nameInput = document.getElementById('guest-name');
const dietaryInput = document.getElementById('guest-dietary');
const plusOneInput = document.getElementById('guest-plus-one');
const statusInput = document.getElementById('guest-status');
const confirmedCountEl = document.getElementById('confirmed-count');
const remainingSpotsEl = document.getElementById('remaining-spots');
const waitlistCountEl = document.getElementById('waitlist-count');
const confirmedListEl = document.getElementById('confirmed-list');
const waitlistEl = document.getElementById('waitlist');
const dietarySummaryEl = document.getElementById('dietary-summary');
const tablesGridEl = document.getElementById('tables-grid');

const dietaryLabels = {
  'none': 'None',
  'vegetarian': 'Vegetarian',
  'vegan': 'Vegan',
  'gluten-free': 'Gluten-Free',
};

function createGuest(name, dietary, plusOne, status) {
  return {
    id: Date.now() + Math.random(),
    name: name.trim(),
    dietary,
    plusOne: plusOne ? 1 : 0,
    status,
    createdAt: new Date().toISOString(),
  };
}

function countConfirmedSeats(guest) {
  return guest.status === 'confirmed' ? 1 + guest.plusOne : 0;
}

function getConfirmedGuests() {
  return state.guests.filter(guest => guest.status === 'confirmed');
}

function getWaitlistGuests() {
  return state.guests.filter(guest => guest.status === 'confirmed' && guest.waitlisted);
}

function calculateCapacity() {
  const confirmed = getConfirmedGuests();
  let seatCount = 0;
  const assigned = [];

  for (const guest of confirmed) {
    const guestSeats = 1 + guest.plusOne;
    if (seatCount + guestSeats <= MAX_CAPACITY) {
      assigned.push(guest);
      seatCount += guestSeats;
      guest.waitlisted = false;
    } else {
      guest.waitlisted = true;
    }
  }

  return {
    confirmedCount: seatCount,
    remainingSpots: Math.max(0, MAX_CAPACITY - seatCount),
    waitlistCount: state.guests.filter(guest => guest.status === 'confirmed' && guest.waitlisted).length,
    assignedGuests: assigned,
  };
}

function getDietaryCounts() {
  const counts = {
    none: 0,
    vegetarian: 0,
    vegan: 0,
    'gluten-free': 0,
  };

  for (const guest of getConfirmedGuests()) {
    if (!guest.waitlisted) {
      counts[guest.dietary] = (counts[guest.dietary] || 0) + 1 + guest.plusOne;
    }
  }

  return counts;
}

function getBadgeClass(dietary) {
  return `badge badge-${dietary}`;
}

function renderDietarySummary() {
  const counts = getDietaryCounts();
  dietarySummaryEl.innerHTML = '';

  for (const key of Object.keys(counts)) {
    const item = document.createElement('li');
    item.className = 'guest-row';
    item.innerHTML = `
      <div class="guest-meta">
        <div>${dietaryLabels[key]}</div>
      </div>
      <strong>${counts[key]}</strong>
    `;
    dietarySummaryEl.appendChild(item);
  }
}

function renderGuestRow(guest) {
  const row = document.createElement('div');
  row.className = 'guest-row';

  const meta = document.createElement('div');
  meta.className = 'guest-meta';
  meta.innerHTML = `
    <div class="guest-name">${guest.name}</div>
    <div class="guest-tag">
      <span class="badge ${getBadgeClass(guest.dietary)}">${dietaryLabels[guest.dietary]}</span>
      <span>${guest.plusOne ? `Plus-one included` : 'No plus-one'}</span>
    </div>
  `;

  const actionGroup = document.createElement('div');
  actionGroup.className = 'action-group';

  const updateButton = document.createElement('button');
  updateButton.type = 'button';
  updateButton.className = 'secondary-button';
  updateButton.textContent = guest.status === 'declined' ? 'Mark Confirmed' : 'Mark Declined';
  updateButton.addEventListener('click', () => toggleGuestStatus(guest.id));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'secondary-button danger-button';
  deleteButton.textContent = 'Remove';
  deleteButton.addEventListener('click', () => removeGuest(guest.id));

  actionGroup.append(updateButton, deleteButton);
  row.append(meta, actionGroup);

  return row;
}

function renderConfirmedGuests(confirmedGuests) {
  confirmedListEl.innerHTML = '';
  if (!confirmedGuests.length) {
    confirmedListEl.innerHTML = '<p class="empty-seat">No confirmed RSVPs yet.</p>';
    return;
  }

  confirmedGuests.forEach(guest => {
    const row = renderGuestRow(guest);
    confirmedListEl.appendChild(row);
  });
}

function renderWaitlist(waitlistGuests) {
  waitlistEl.innerHTML = '';
  if (!waitlistGuests.length) {
    waitlistEl.innerHTML = '<p class="empty-seat">No waitlisted guests.</p>';
    return;
  }

  waitlistGuests.forEach(guest => {
    const row = renderGuestRow(guest);
    waitlistEl.appendChild(row);
  });
}

function buildSeatingChart(assignedGuests) {
  const seats = [];
  assignedGuests.forEach(guest => {
    seats.push({ guest, seatFor: 'primary' });
    if (guest.plusOne) {
      seats.push({ guest, seatFor: 'plusOne' });
    }
  });

  const emptySeats = TOTAL_SEATS - seats.length;
  for (let i = 0; i < emptySeats; i += 1) {
    seats.push(null);
  }

  const tables = [];
  for (let tableIndex = 0; tableIndex < TABLE_COUNT; tableIndex += 1) {
    const tableSeats = seats.slice(tableIndex * SEATS_PER_TABLE, (tableIndex + 1) * SEATS_PER_TABLE);
    tables.push({ tableNumber: tableIndex + 1, seats: tableSeats });
  }

  return tables;
}

function renderTables(assignedGuests) {
  tablesGridEl.innerHTML = '';
  const tables = buildSeatingChart(assignedGuests);

  tables.forEach(table => {
    const card = document.createElement('div');
    card.className = 'table-card';
    card.innerHTML = `
      <div class="table-title">
        <span>Table ${table.tableNumber}</span>
        <span>${table.seats.filter(Boolean).length}/8</span>
      </div>
      <div class="seat-grid"></div>
    `;

    const seatGrid = card.querySelector('.seat-grid');
    table.seats.forEach((seat, index) => {
      const seatEl = document.createElement('div');
      seatEl.className = 'seat';
      if (seat) {
        seatEl.innerHTML = `
          <div class="seat-number">Seat ${index + 1}</div>
          <div class="guest-name">${seat.guest.name}${seat.seatFor === 'plusOne' ? ' (Plus-one)' : ''}</div>
          <span class="badge ${getBadgeClass(seat.guest.dietary)}">${dietaryLabels[seat.guest.dietary]}</span>
        `;
      } else {
        seatEl.innerHTML = `
          <div class="seat-number">Seat ${index + 1}</div>
          <div class="empty-seat">Empty seat</div>
        `;
      }
      seatGrid.appendChild(seatEl);
    });

    tablesGridEl.appendChild(card);
  });
}

function updateUI() {
  const capacity = calculateCapacity();
  const confirmedGuests = getConfirmedGuests().filter(guest => !guest.waitlisted);
  const waitlistGuests = getWaitlistGuests();

  confirmedCountEl.textContent = capacity.confirmedCount;
  remainingSpotsEl.textContent = capacity.remainingSpots;
  waitlistCountEl.textContent = capacity.waitlistCount;

  renderConfirmedGuests(confirmedGuests);
  renderWaitlist(waitlistGuests);
  renderDietarySummary();
  renderTables(capacity.assignedGuests);
}

function toggleGuestStatus(guestId) {
  const guest = state.guests.find(item => item.id === guestId);
  if (!guest) return;

  guest.status = guest.status === 'confirmed' ? 'declined' : 'confirmed';
  updateUI();
}

function removeGuest(guestId) {
  state.guests = state.guests.filter(item => item.id !== guestId);
  updateUI();
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const name = nameInput.value;
  const dietary = dietaryInput.value;
  const plusOne = plusOneInput.checked;
  const status = statusInput.value;

  if (!name.trim()) return;

  state.guests.push(createGuest(name, dietary, plusOne, status));
  form.reset();
  updateUI();
});

renderTables([]);
updateUI();

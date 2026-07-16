# Soirée Planner Handoff

## Project overview
Soirée Planner is a lightweight RSVP and seating management app for a venue with a fixed fire-code capacity of 120 guests. It tracks confirmed RSVPs, plus-ones, dietary preferences, waitlist placement, and a 15-table seating chart.

## Features completed
- Enforced a maximum confirmed guest capacity of 120 seats.
- Counted confirmed attendees including plus-ones.
- Automatically moved additional confirmed RSVPs into a waitlist when capacity is full.
- Displayed remaining guest spots and waitlist totals.
- Added a dietary preference field for every guest with supported values: None, Vegetarian, Vegan, Gluten-Free.
- Rendered dietary badges next to every guest and on occupied seats.
- Implemented a caterer summary panel counting dietary categories for seated guests.
- Built a seating chart with 15 tables and 8 seats each (120 total seats).
- Assigned confirmed guests to seats automatically in signup order, including plus-ones.
- Ensured waitlisted and declined guests are never seated.
- Kept the UI responsive with a clean card-based layout using plain JavaScript and CSS.

## Files modified
- `index.html` — app structure and new RSVP / seating UI sections.
- `styles.css` — responsive styling, guest badges, summary cards, and seating chart visuals.
- `script.js` — RSVP state management, waitlisting, dietary tracking, seating assignment, and rendering logic.
- `HANDOFF.md` — this handoff summary.

## Important business rules
- Confirmed attendees are counted with plus-ones.
- The venue's fire-code capacity is 120 seats.
- Once 120 seats are assigned, any additional confirmed RSVP is placed on a waitlist.
- Waitlisted guests are never assigned a seat.
- Declined guests are never assigned a seat.
- Seating updates automatically whenever RSVPs change.
- Dietary counts are based on seated confirmed guests and include plus-ones under the same category.

## Current architecture
- `index.html` defines the UI structure and sections for RSVP entry, summary statistics, guest lists, waitlist, and seating chart.
- `styles.css` provides modern card layout, responsive grid behavior, and visual badge styling.
- `script.js` manages state in a simple `state.guests` array and performs all calculations in plain JavaScript.
  - RSVP creation, status toggling, and removal are handled with DOM event listeners.
  - Capacity calculation uses signup order to assign seats and set `waitlisted` flags.
  - Seating chart generation maps assigned guests to table seats while preserving empty seat visibility.

## Remaining future improvements
- Add persistent storage using localStorage or backend integration.
- Support separate dietary information for plus-ones.
- Add search, filtering, or sorting of guests and waitlist entries.
- Provide editing of existing guest details without deletion.
- Add a print-friendly seating chart layout for event staff.

## Instructions for another AI agent
1. Open `index.html`, `styles.css`, and `script.js`.
2. Confirm the current RSVP flow: guest creation, capacity assignment, waitlisting, and seat assignment.
3. Validate the seating chart assignment logic for guests and plus-ones, ensuring no waitlisted or declined guest receives a seat.
4. If extending the app, keep using plain JavaScript and avoid adding new frameworks.
5. Consider adding persistence, edit controls, and clearer plus-one dietary handling in the next iteration.

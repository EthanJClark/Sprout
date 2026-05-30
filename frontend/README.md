# SPROUT — GDAC Disaster Tracker

A real-time climate disaster monitoring dashboard with a 3D interactive globe.

## Stack
- **React 18** + **Vite**
- **globe.gl** (Three.js-based 3D globe)
- NASA Blue Marble textures via CDN

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Project Structure

```
src/
  App.jsx                  # Root layout, state, filter logic
  main.jsx                 # React entry point
  styles/
    global.css             # All styles (CSS variables, layout, components)
  components/
    Header.jsx             # Top bar: branding, status, event count
    FilterBar.jsx          # Category filter chips (above globe)
    Sidebar.jsx            # Right panel: search + collapsible event cards
    Globe.jsx              # 3D interactive globe (globe.gl)
  data/
    mockEvents.js          # Mock data + category config
```

---

## Connecting Your Backend

In `App.jsx`, replace the mock data block:

```js
// Replace this:
const [events, setEvents] = useState(MOCK_EVENTS);

// With a real fetch:
const [events, setEvents] = useState([]);

useEffect(() => {
  fetch("https://your-backend.com/api/events")
    .then(r => r.json())
    .then(data => setEvents(data));
}, []);
```

### Expected Event Shape

```js
{
  id: "evt-001",              // string, unique
  title: "Event Name",        // string
  category: "wildfire",       // see EVENT_CATEGORIES keys in mockEvents.js
  location: "City, Country",  // display string
  lat: 33.1558,               // number (-90 to 90)
  lng: -86.0919,              // number (-180 to 180)
  date: "Apr 7, 2026",        // display string
  severity: 42,               // number 0–100
  status: "Active",           // "Active" | "Monitoring" | "Resolved"
  affected: "~1,200 acres",   // display string
  description: "...",         // string
  source: "IRWIN",            // source name
  sourceUrl: "https://...",   // link to source
}
```

### Adding New Categories

In `src/data/mockEvents.js`, add to `EVENT_CATEGORIES`:

```js
export const EVENT_CATEGORIES = {
  // ...existing...
  tsunami: { label: "Tsunami", color: "#00acc1" },
};
```

The globe, filter bar, and sidebar will all pick up the new category automatically.

---

## Globe Features

- **NASA Blue Marble** night-side texture
- **Auto-rotate** (pauses on interaction, resumes after 3s)
- **Colored points** per category, sized by severity
- **Pulse rings** on active high-severity (≥70) events
- **Click to focus**: clicking a sidebar event pans the globe to it
- Exposes `globeRef.current.focusOn(lat, lng)` for programmatic camera control

## Customization Tips

- **Globe texture**: swap `globeImageUrl` in `Globe.jsx` for a different NASA image
- **Point scale**: adjust the `pointRadius` formula in `Globe.jsx`
- **Ring threshold**: change `severity >= 70` in the rings `useEffect`
- **Sidebar width**: `--sidebar-w` CSS variable in `global.css`
- **Color scheme**: all colors are CSS variables at the top of `global.css`

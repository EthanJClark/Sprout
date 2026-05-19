import { useState, useEffect, useRef, useCallback } from "react";
import Globe from "./components/Globe";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import { EVENT_CATEGORIES } from "./data/mockEvents";
import "./styles/global.css";

export default function App() {
  const [events, setEvents] = useState([]);
  const [lastFetchAt, setLastFetchAt] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeFilters, setActiveFilters] = useState(new Set(["all"]));
  const [searchQuery, setSearchQuery] = useState("");
  const [globeReady, setGlobeReady] = useState(false);
  const globeRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = () => {
      fetch("http://localhost:8000/api/events")
        .then(r => r.json())
        .then(data => {
          if (isMounted) {
            setEvents(data);
            setLastFetchAt(new Date());
          }
        });
    };

    fetchEvents();
    const intervalId = setInterval(fetchEvents, 10 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const filteredEvents = events.filter(ev => {
    const matchesFilter = activeFilters.has("all") || activeFilters.has(ev.category);
    const matchesSearch =
      !searchQuery ||
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleEventClick = useCallback((event) => {
    setSelectedEvent(prev => prev?.id === event.id ? null : event);
    if (globeRef.current && event.lat && event.lng) {
      globeRef.current.focusOn(event.lat, event.lng);
    }
  }, []);

  const handleGlobeEventClick = useCallback((event) => {
    setSelectedEvent(event);
  }, []);

  return (
    <div className="app">
      <Header
        activeCount={filteredEvents.length}
        totalCount={events.length}
        lastFetchAt={lastFetchAt}
      />
      <div className="main-layout">
        <div className="globe-area">
          <FilterBar
            categories={EVENT_CATEGORIES}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />
          <Globe
            ref={globeRef}
            events={filteredEvents}
            selectedEvent={selectedEvent}
            onEventClick={handleGlobeEventClick}
            onReady={() => setGlobeReady(true)}
          />
          {!globeReady && (
            <div className="globe-loading">
              <div className="pulse-ring" />
              <span>Initializing Earth feed…</span>
            </div>
          )}
        </div>
        <Sidebar
          events={filteredEvents}
          selectedEvent={selectedEvent}
          onEventClick={handleEventClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>
    </div>
  );
}

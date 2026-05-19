import { EVENT_CATEGORIES } from "../data/mockEvents";

function SeverityBar({ value, color }) {
  return (
    <div className="severity-bar-wrap">
      <div className="severity-bar-bg">
        <div
          className="severity-bar-fill"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    Active: { bg: "rgba(255,64,64,0.15)", color: "#ff6060" },
    Monitoring: { bg: "rgba(255,193,7,0.15)", color: "#ffd166" },
    Resolved: { bg: "rgba(86,248,154,0.15)", color: "#56f89a" },
  };
  const s = colors[status] || colors.Monitoring;
  return (
    <span style={{
      padding: "2px 8px",
      borderRadius: 3,
      background: s.bg,
      color: s.color,
      fontFamily: "var(--font-mono)",
      fontSize: 9,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      fontWeight: 700,
    }}>
      {status}
    </span>
  );
}

function EventCard({ event, isActive, onClick }) {
  const cat = EVENT_CATEGORIES[event.category] || EVENT_CATEGORIES.all;

  return (
    <div
      className={`event-card ${isActive ? "active" : ""}`}
      onClick={() => onClick(event)}
    >
      <div className="event-card-header">
        <div
          className="event-category-bar"
          style={{ background: cat.color }}
        />
        <div className="event-card-body">
          <div className="event-card-top">
            <span className="event-category-tag" style={{ color: cat.color }}>
              {cat.label}
            </span>
            <span className="event-date">{event.date}</span>
          </div>
          <div className="event-title" title={event.title}>{event.title}</div>
          <div className="event-location">📍 {event.location}</div>
        </div>
        <svg
          className="event-chevron"
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ marginTop: 4 }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {isActive && (
        <div className="event-detail">
          <div className="event-detail-grid">
            <div className="detail-item">
              <div className="detail-label">Status</div>
              <div className="detail-value"><StatusBadge status={event.status} /></div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Severity</div>
              <div className="detail-value" style={{ marginBottom: 4 }}>{event.severity}/100</div>
              <SeverityBar value={event.severity} color={cat.color} />
            </div>
            <div className="detail-item">
              <div className="detail-label">Coordinates</div>
              <div className="detail-value detail-coords">
                {event.lat?.toFixed(4)}°, {event.lng?.toFixed(4)}°
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Affected</div>
              <div className="detail-value">{event.affected}</div>
            </div>
            <div className="detail-item full">
              <div className="detail-label">Description</div>
              <div className="detail-value" style={{ fontWeight: 400, fontSize: 12, lineHeight: 1.5 }}>
                {event.description}
              </div>
            </div>
          </div>
          {event.sourceUrl ? (
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="event-source-link"
            >
              Source: {event.source}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 9L9 1M9 1H4M9 1V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ) : (
            <div className="event-source-link">Source: {event.source}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  events,
  selectedEvent,
  onEventClick,
  searchQuery,
  onSearchChange,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <div className="sidebar-live-label">
            <div className="live-dot" />
            Live Monitoring
          </div>
          <span className="sidebar-count">
            {events.length} anomalies matched
          </span>
        </div>
        <div className="sidebar-title">Global Events</div>
        <div style={{ marginTop: 10 }}>
          <div className="search-input-wrap">
            <svg className="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search events…"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="sidebar-events">
        {events.length === 0 ? (
          <div style={{
            padding: "32px 16px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.08em",
          }}>
            No events match filters
          </div>
        ) : (
          events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              isActive={selectedEvent?.id === event.id}
              onClick={onEventClick}
            />
          ))
        )}
      </div>
    </aside>
  );
}

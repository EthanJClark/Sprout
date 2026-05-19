import logo from "../assets/logo.png";

export default function Header({ activeCount, totalCount, lastFetchAt }) {
  const now = new Date().toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });
  const lastFetchText = lastFetchAt
    ? lastFetchAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-icon">
          <img src={logo} alt="Sprout logo"/>
        </div>
        <div>
          <div className="header-title">Sprout</div>
          <div className="header-subtitle">Powered by GDAC</div>
        </div>
      </div>

      <div className="header-meta">
        <div className="status-pill">
          <div className="status-dot" />
          Operational
        </div>
        <div className="header-stat">
          <div className="header-stat-label">Showing</div>
          <div className="header-stat-value">{activeCount}</div>
        </div>
        <div className="header-stat">
          <div className="header-stat-label">Total events</div>
          <div className="header-stat-value">{totalCount}</div>
        </div>
        <div className="header-stat">
          <div className="header-stat-label">As of</div>
          <div className="header-stat-value" style={{ fontSize: 13 }}>{now}</div>
        </div>
        <div className="header-stat">
          <div className="header-stat-label">Last update</div>
          <div className="header-stat-value" style={{ fontSize: 13 }}>{lastFetchText}</div>
        </div>
      </div>
    </header>
  );
}

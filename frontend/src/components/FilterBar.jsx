import { EVENT_CATEGORIES } from "../data/mockEvents";

export default function FilterBar({ activeFilters, onFilterChange }) {
  const toggleFilter = (key) => {
    if (key === "all") {
      onFilterChange(new Set(["all"]));
      return;
    }
    const next = new Set(activeFilters);
    next.delete("all");
    if (next.has(key)) {
      next.delete(key);
      if (next.size === 0) next.add("all");
    } else {
      next.add(key);
    }
    onFilterChange(next);
  };

  return (
    <div className="filter-bar">
      {Object.entries(EVENT_CATEGORIES).map(([key, cat]) => (
        <button
          key={key}
          className={`filter-chip ${activeFilters.has(key) ? "active" : ""}`}
          onClick={() => toggleFilter(key)}
        >
          {key !== "all" && (
            <span className="filter-dot" style={{ background: cat.color }} />
          )}
          {cat.label}
        </button>
      ))}
    </div>
  );
}

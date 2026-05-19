import json
import sqlite3
from typing import Optional
from typing_extensions import Annotated

from pydantic import BaseModel, Field, BeforeValidator

import gdacs

EVENT_TYPE_MAP = {
    "WF": "wildfire",
    "FL": "flood",
    "TC": "cyclone",
    "EQ": "earthquake",
    "VO": "volcano",
    "DR": "drought",
    "LS": "landslide",
    "ST": "storm",
}

extract_population = BeforeValidator(
    lambda v: v.get('value', 0) if isinstance(v, dict) else (v or 0)
)

# Add location
class GDACSEventModel(BaseModel):
    event_id: str = Field(..., validation_alias="gdacs_eventid")
    episode_id: str = Field(..., validation_alias="gdacs_episodeid")
    title: str
    level: str = Field(..., validation_alias="gdacs_alertlevel")
    severity: dict = Field(..., validation_alias="gdacs_severity")
    summary: Optional[str] = "No Description provided."
    lat: float = Field(..., ge=-90, le=90, validation_alias="geo_lat")
    long: float = Field(..., ge=-180, le=180, validation_alias="geo_long")
    date: str = Field(..., validation_alias="gdacs_fromdate")
    population: Annotated[int, extract_population]  = Field(default= 0, validation_alias="gdacs_population")
    location: str = Field(..., validation_alias="gdacs_country")
    raw_payload: dict
    links: Optional[list] = []

def map_category(raw: dict) -> str:
    event_type = str(raw.get("gdacs_eventtype") or "")
    return EVENT_TYPE_MAP.get(event_type, "storm")

def map_status(raw: dict) -> str:
    return "Active" if str(raw.get("gdacs_iscurrent", "")).lower() == "true" else "Resolved"

def map_source(raw: dict) -> str:
    return (raw.get("gdacs_resource") or {}).get("source") or "GDACS"

def map_source_url(raw: dict) -> str:
    if raw.get("link"):
        return raw["link"]
    for link in raw.get("links", []):
        if link.get("rel") == "alternate" and link.get("href"):
            return link["href"]
    return ""

def map_severity_score(raw: dict) -> int:
    sev = raw.get("gdacs_severity") or {}
    try:
        value = float(sev.get("value", 0))
    except Exception:
        value = 0
    # Example normalization for wildfire hectares (adjust as needed)
    return min(100, max(0, round((value / 10000) * 100)))

def create_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS disaster_cache (
            event_id TEXT PRIMARY KEY,
            episode_id TEXT,
            title TEXT,
            level TEXT,
            severity TEXT,
            summary TEXT,
            lat REAL,
            long REAL,
            date TEXT,
            population REAL,
            location TEXT,
            raw_payload TEXT,
            category TEXT,
            status TEXT,
            severity_score REAL,
            affected TEXT,
            source TEXT,
            source_url TEXT,
            lng REAL,
            description TEXT
        )
    """)


def sync_gdacs(raw_feed: list):
    conn = sqlite3.connect("disasters.db")
    cursor = conn.cursor()
    create_table(cursor)

    for item in raw_feed:
        try:
            item["raw_payload"] = item.copy()

            event = GDACSEventModel(**item)
            raw = event.raw_payload
            category = map_category(raw)
            status = map_status(raw)
            source = map_source(raw)
            source_url = map_source_url(raw)
            severity_score = map_severity_score(raw)
            affected = f"~{event.population} people"
            description = event.summary
            lng = event.long

            cursor.execute(
                """
                    INSERT INTO disaster_cache
                    (event_id, episode_id, title, level, severity, summary, lat, long, date, location, population, raw_payload,
                     category, status, severity_score, affected, source, source_url, lng, description)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(event_id) DO UPDATE SET
                        severity = excluded.severity,
                        population = excluded.population,
                        raw_payload = excluded.raw_payload,
                        category = excluded.category,
                        status = excluded.status,
                        severity_score = excluded.severity_score,
                        affected = excluded.affected,
                        source = excluded.source,
                        source_url = excluded.source_url,
                        lng = excluded.lng,
                        description = excluded.description
                """,
                (
                    event.event_id,
                    event.episode_id,
                    event.title,
                    event.level,
                    json.dumps(event.severity),
                    event.summary,
                    event.lat,
                    event.long,
                    event.date,
                    event.location,
                    event.population,
                    json.dumps(event.raw_payload),
                    category,
                    status,
                    severity_score,
                    affected,
                    source,
                    source_url,
                    lng,
                    description,
                ),
            )

            conn.commit()

        except Exception as e:
            print(e)
            exit()

    conn.close()


if __name__ == "__main__":
    dis = gdacs.fetch_gdacs_rss(10)
    sync_gdacs(dis)

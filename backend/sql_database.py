import json
import sqlite3
from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator

import backend.gdacs as gdacs

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
    raw_payload: dict
    links: Optional[list] = []


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
            raw_payload TEXT
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

            cursor.execute(
                """
                    INSERT INTO disaster_cache
                    (event_id, episode_id, title, level, severity, summary, lat, long, date, raw_payload)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(event_id) DO UPDATE SET
                        severity = excluded.severity,
                        raw_payload = excluded.raw_payload
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
                    json.dumps(event.raw_payload),
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

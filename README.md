# Interactive 3D Globe for Global Climate Disaster Tracking

## SPROUT
**SPROUT: Accessible Interactive 3D Globe for Climate Disaster
Monitoring**

------------------------------------------------------------------------

## Project Overview

Sprout is an interactive 3D globe-based visualization platform
designed to help users track global climate-related disasters such as:

-   Earthquakes
-   Volcanic Eruptions
-   Tsunamis
-   Hurricanes
-   Flooding Events
-   Drought Zones

### Future Expansion

Future versions may include:

-   Oil Spills
-   Forest Fires / Wildfires
-   Glacier Collapse Events
-   Heatwave Zones
-   Air Pollution Tracking

The platform prioritizes:

-   Accessibility
-   Human-Computer Interaction (HCI)
-   Real-time geographic awareness
-   Inclusive visual design
-   Search and filtering efficiency

------------------------------------------------------------------------

## Core Features

## 1. Interactive 3D Globe

### Capabilities

-   Fully rotatable 3D globe
-   Smooth zoom in / zoom out
-   Mouse drag + touch pan support
-   Clickable disaster markers
-   Hover interactions for quick previews
-   Region-based clustering for high-density events

### User Actions

Users can:

-   Rotate the Earth
-   Zoom into specific countries or regions
-   Select disaster hotspots
-   Open detailed event cards
-   Compare disaster frequency geographically

------------------------------------------------------------------------

## 2. Disaster Pinpoint System

Each disaster is represented using:

-   Distinct color-coded markers
-   Shape-based categorization for accessibility
-   Severity-based sizing
-   Timeline indicators for recency

### Example

  Disaster Type   Marker
  --------------- -----------------
  Earthquake      Red Pulse Dot
  Volcano         Orange Triangle
  Flood           Blue Ripple
  Hurricane       Spiral Icon

This improves usability for users with color vision deficiencies.

------------------------------------------------------------------------

## 3. Search + Filter Sidebar

### Search Bar

Allows users to search by:

-   Country
-   Region
-   Disaster Type
-   Severity Level
-   Date Range
-   Disaster Name (if named event)

### Filters

Sidebar filtering options include:

-   Past 24 Hours
-   Past Week
-   Past Month
-   Magnitude Threshold
-   Fatality Count
-   Active vs Historical Events

------------------------------------------------------------------------

## 4. Accessibility-Focused Design

This project strongly emphasizes inclusive design.

### Accessibility Features

-   Keyboard navigation support
-   Screen reader compatibility
-   High contrast mode
-   Reduced motion option
-   Colorblind-safe palette
-   Alternative text for visual data
-   Large-click interaction zones
-   Voice-search support (future work)

### HCI Principles Applied

-   Recognition over recall
-   Visibility of system status
-   Error prevention
-   User control and freedom
-   Consistency and standards
-   Flexibility of use

------------------------------------------------------------------------

## Frontend
### Globe Rendering

Recommended libraries:

-   Three.js
-   React Three Fiber
-   Globe.gl
-   CesiumJS (optional advanced alternative)

### UI Components

-   React
-   Next.js
-   Tailwind CSS
-   Framer Motion

------------------------------------------------------------------------

## Backend

### Data Sources

Possible APIs:

-   USGS Earthquake API
-   NASA Earth Observatory
-   NOAA Climate Data
-   Global Volcanism Program
-   ReliefWeb API
-   GDACS Disaster Alerts

### Backend Tools

-   Node.js
-   Express.js
-   MongoDB / PostgreSQL
-   Firebase (optional)

------------------------------------------------------------------------

## UI Layout

``` text
 ------------------------------------------------------
| Search + Filters |                                  |
| Sidebar          |        3D Interactive Globe      |
|                  |                                  |
| - Search Bar     |                                  |
| - Disaster Type  |                                  |
| - Date Range     |                                  |
| - Severity       |                                  |
| - Event List     |                                  |
 ------------------------------------------------------
```

## Final Goal

To create a system that helps people understand global climate disasters
faster, more clearly, and more accessibly through intuitive
human-computer interaction and powerful geographic visualization.

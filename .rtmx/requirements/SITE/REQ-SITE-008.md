# REQ-SITE-008: TAK Interface Enumeration (External and Internal)

## Description
Complete enumeration of all external and internal interfaces in the TAK
ecosystem. This provides a definitive map of how TAK components communicate,
what protocols they use, and what data formats flow between them.

## External Interfaces
- TAK Server (CoT over TCP/TLS, HTTP/HTTPS REST API)
- Cursor on Target (CoT XML schema over multicast/unicast UDP)
- SA (Situational Awareness) multicast
- Mission Package transfer (ZIP over HTTP)
- KML/KMZ import/export
- GeoPackage/SpatiaLite databases
- WMS/WMTS tile services
- ATAK plugin API (Intent-based, BroadcastReceiver)
- JTAC/CAS data link formats
- Link-16 / VMF message formats
- Repository dispatch / CI webhooks

## Internal Interfaces
- MapComponent lifecycle (onCreate, onDestroy, onStart, onStop)
- CotDispatcher event bus
- Intent-based inter-component communication
- SharedPreferences configuration
- IconsetDatabase (SQLite)
- CoT event parsing pipeline
- Map renderer integration (OpenGL ES)
- Plugin framework (MEF for WinTAK, BroadcastReceiver for ATAK)

## Acceptance Criteria
- [ ] data/tak-interfaces.json enumerates all external interfaces with protocol, format, port
- [ ] data/tak-internal-interfaces.json enumerates internal component communication patterns
- [ ] Each interface entry includes: name, type (external/internal), protocol, data format, direction
- [ ] Interface documentation rendered on GitHub Pages site

## Validation
- **Test**: tests/interfaces/test_interface_catalog.mjs::test_interfaces_valid
- **Method**: Unit Test

# MIL-STD-2525 Cross-Version Study Plan

## Objective

Produce an authoritative cross-version mapping of MIL-STD-2525 symbology identifiers
from versions B/C (15-character SIDC) to versions D/E (20-character SIDC), validated
against the original PDF specifications.

## Methodology

1. **PDF Extraction** -- Extract field definitions, entity tables, and modifier tables
   from the 10 authoritative PDF documents listed below.
2. **Hypothesis Testing** -- Formulate testable hypotheses about cross-version
   relationships and validate each against the extracted PDF data.
3. **Visual Validation** -- For entries flagged as "lossy" (where the mapping requires
   a base entity plus sector modifiers), validate via pre-rendered SVG comparison that
   the visual output differs from the base entity alone.

## Sources

| # | Document | Year |
|---|----------|------|
| 1 | MIL-STD-2525 Base.pdf | 1981 |
| 2 | MIL-STD-2525A.pdf | 1996 |
| 3 | MIL-STD-2525A Change 1.pdf | -- |
| 4 | MIL-STD-2525B.pdf | 1999 |
| 5 | MIL-STD-2525B Change 1.pdf | -- |
| 6 | MIL-STD-2525B Change 2.pdf | -- |
| 7 | MIL-STD-2525C.pdf | 2008 |
| 8 | MIL-STD-2525D.pdf | 2014 |
| 9 | MIL-STD-2525D Change 1.pdf | -- |
| 10 | MIL-STD-2525E.pdf | 2021 |

## Status

- 8 hypotheses formulated and tested (see study-hypotheses.json, study-results.json)
- Field definitions extracted for B/C (15-char) and D/E (20-char) SIDC structures
- Delta analysis complete: D-to-E comparison shows 2016 shared, 93 D-only, 150 E-only
- B-to-D crosswalk: 1915 mappings (438 lossy, 1477 non-lossy)
- Visual validation script implemented (validate-crosswalk.mjs)

## Findings Summary

1. **H1 (CONFIRMED)**: B and C use identical 15-character SIDC field positions.
   C renames "Affiliation" to "Standard Identity" but encoding is the same.
2. **H2 (CONFIRMED)**: D and E use identical 20-character SIDC structure (two sets of 10).
3. **H3 (CONFIRMED)**: Entity code 110200 is "Rotary Wing" in Air symbol set (SS=01).
4. **H4 (CONFIRMED)**: Sector modifier 1 transforms the base entity visually, not just
   as a text overlay.
5. **H5 (PARTIALLY CONFIRMED)**: Non-lossy entries map correctly via NGA crosswalk.
   Lossy entries are semantically correct (base entity + modifier) but require modifier
   rendering for full visual accuracy.
6. **H6 (CONFIRMED)**: D and E share the same SIDC structure. E adds version codes 13-15.
   2016 shared entities, 93 D-only, 150 E-only.
7. **H7 (CONFIRMED)**: The 6-digit entity field is a hierarchical 3-level code:
   Entity(2) + Entity Type(2) + Entity Subtype(2).
8. **H8 (CONFIRMED)**: B/C Battle Dimension maps to D/E Symbol Set
   (A->01, P->05, G->10, S->30, U->35).

## Remaining Work

- Entity table extraction from B/C PDFs (positions 5-10 function IDs) to enable direct
  B->C function ID comparison without relying solely on the NGA crosswalk.
- Full pre-rendered SVG coverage for visual validation of all 438 lossy entries.
- Extension of crosswalk to cover A-to-B transitions (versions Base, A currently have
  no entity count data).

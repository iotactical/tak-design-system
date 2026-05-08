# REQ-ICN-002: ATAK Vector Drawable SVG Extraction

## Description
Convert all 174 ATAK Android vector drawable XML resources into platform-agnostic SVG files. Android vector drawables use a subset of SVG path syntax wrapped in an Android-specific XML schema (VectorDrawable). The design system must provide equivalent SVGs so that web, iOS, Windows, and Linux consumers can render the same icons without an Android dependency. Each converted SVG must preserve the original path data, fill colors, stroke attributes, viewport dimensions, and group transforms. This extraction forms the foundation for the icon font, React component, and SwiftUI asset pipelines.

## Acceptance Criteria
- [ ] A directory `icons/svg/vector/` contains exactly 174 SVG files, one per ATAK vector drawable.
- [ ] Each SVG file name matches its ATAK resource name with a `.svg` extension (e.g., `ic_menu_compass.svg`).
- [ ] SVG viewBox dimensions match the original `android:viewportWidth` and `android:viewportHeight`.
- [ ] All `android:pathData` values are converted to valid SVG `d` attributes with no data loss.
- [ ] Fill colors (`android:fillColor`) are preserved as SVG `fill` attributes; where the original uses a theme reference, a design-token CSS custom property is substituted.
- [ ] Stroke colors, widths, line caps, and line joins are accurately mapped to SVG equivalents.
- [ ] Group-level translations, rotations, scales, and pivot points are converted to SVG `transform` attributes.
- [ ] Each output SVG is valid per the SVG 1.1 specification (passes svglint or equivalent validation).
- [ ] A conversion log records any drawables that required manual intervention or produced warnings.
- [ ] Round-trip visual regression: rendered SVG at 24dp, 48dp, and 96dp matches the Android vector drawable rendering with less than 1% pixel difference.

## Validation
- **Test**: tests/icons/test_vector_svg_extraction.mjs::test_svg_file_count
- **Test**: tests/icons/test_vector_svg_extraction.mjs::test_svg_viewbox_matches_source
- **Test**: tests/icons/test_vector_svg_extraction.mjs::test_svg_path_data_integrity
- **Test**: tests/icons/test_vector_svg_extraction.mjs::test_svg_schema_valid
- **Test**: tests/icons/test_vector_svg_extraction.mjs::test_svg_visual_regression
- **Method**: Unit Test

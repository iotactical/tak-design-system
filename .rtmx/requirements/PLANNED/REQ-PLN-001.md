# REQ-PLN-001: WinTAK WPF ResourceDictionary Generation

## Description
Build pipeline must generate WPF ResourceDictionary XAML files for WinTAK,
using the ComponentResourceKey pattern discovered in WinTAK SDK 5.7.0.142.
WinTAK uses WinTak.UI.Controls.Themes.ResourceKeys for control styling.

## Approach
- Style Dictionary transform producing WPF XAML ResourceDictionary
- SolidColorBrush resources for color tokens
- sys:Double resources for dimension tokens
- ComponentResourceKey naming matching WinTAK SDK conventions
- Pack URI compatible for plugin assembly embedding

## Acceptance Criteria
- [ ] platforms/wintak/generated/TakResourceDictionary.xaml exists after build
- [ ] Color tokens as SolidColorBrush resources
- [ ] Dimension tokens as sys:Double resources
- [ ] Resource keys follow WinTak.UI.Controls.Themes.ResourceKeys naming
- [ ] Build command available (npm run build:wintak)

## Validation
- **Test**: tests/build/test_wintak.mjs::test_wintak_xaml_output
- **Method**: Integration Test

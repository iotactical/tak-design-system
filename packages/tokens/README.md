# @iotactical/tak-tokens

W3C-format design tokens for the TAK Design System, usable across all TAK platforms (ATAK, WinTAK, iTAK, WebTAK).

## Install

```bash
npm install @iotactical/tak-tokens
```

## Usage

Import specific token sets:

```js
import coreTokens from '@iotactical/tak-tokens/core';
import semanticTokens from '@iotactical/tak-tokens/semantic';
import componentTokens from '@iotactical/tak-tokens/component';
import atakTokens from '@iotactical/tak-tokens/atak';
```

## Token Sets

- **core** - Primitive values (colors, spacing, typography scales)
- **semantic** - Purpose-based aliases (e.g., `color.danger`, `spacing.panel`)
- **component** - Component-level tokens (button sizes, input heights)
- **atak** - ATAK-specific overrides and platform tokens

## Format

All tokens follow the [W3C Design Tokens Community Group](https://design-tokens.github.io/community-group/format/) specification.

## License

MIT

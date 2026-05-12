# mil-sym-wpf

WPF renderer for MIL-STD-2525D military symbology. Renders SIDC-based tactical symbols as WPF DrawingVisual objects for use in WinTAK desktop applications.

## Requirements

- .NET 8.0 SDK (Windows)
- WPF target framework

## Build

```bash
dotnet build platforms/wintak/mil-sym-wpf/mil-sym-wpf.sln
```

## Test

```bash
dotnet test platforms/wintak/mil-sym-wpf/mil-sym-wpf.sln
```

## Package

```bash
dotnet pack platforms/wintak/mil-sym-wpf/src/MilSymWpf/MilSymWpf.csproj -o artifacts/
```

## License

Apache-2.0

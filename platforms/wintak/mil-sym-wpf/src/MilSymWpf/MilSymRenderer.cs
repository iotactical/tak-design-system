// rtmx:req REQ-XW-023
// rtmx:req REQ-XW-024
using System.Windows.Media;
using MilSymWpf.Data;
using MilSymWpf.Rendering;
using MilSymWpf.Sidc;

namespace MilSymWpf;

/// <summary>
/// Main public API for rendering MIL-STD-2525D military symbols as WPF drawings.
/// Composes frame, entity icon, and modifier/amplifier layers into a single DrawingGroup.
/// </summary>
public class MilSymRenderer
{
    private readonly MsdLoader _msd;

    public MilSymRenderer()
    {
        _msd = MsdLoader.Load();
    }

    public MilSymRenderer(MsdLoader msd)
    {
        _msd = msd;
    }

    /// <summary>
    /// Render a complete military symbol from a SIDC string.
    /// </summary>
    /// <param name="sidc">15 or 20 character Symbol Identification Code</param>
    /// <param name="size">Desired size in device-independent pixels</param>
    /// <param name="entityPathData">Optional SVG path data for the entity icon</param>
    /// <returns>A DrawingGroup containing the composed symbol, or null if SIDC is invalid</returns>
    public DrawingGroup? Render(string sidc, double size, string? entityPathData = null)
    {
        var parsed = SidcParser.Parse(sidc);
        if (!parsed.IsValid)
            return null;

        var group = new DrawingGroup();

        // Layer 1: Frame
        var affiliation = FrameRenderer.GetAffiliation(parsed.StandardIdentity);
        var planned = parsed.Status == "1";
        var frameVisual = FrameRenderer.RenderFrame(affiliation, size, planned);
        if (frameVisual.Drawing != null)
            group.Children.Add(frameVisual.Drawing);

        // Layer 2: Entity icon (if path data provided)
        if (!string.IsNullOrEmpty(entityPathData))
        {
            var entityColor = GetEntityColor(affiliation);
            var entityDrawing = EntityRenderer.RenderEntity(entityPathData, size, entityColor);
            if (entityDrawing != null)
                group.Children.Add(entityDrawing);
        }

        // Layer 3: Modifiers
        // HQ indicator
        if (parsed.HqTfFd is "2" or "3" or "6" or "7")
        {
            var hqVisual = ModifierRenderer.RenderHqIndicator(size);
            if (hqVisual.Drawing != null)
                group.Children.Add(hqVisual.Drawing);
        }

        // Task Force indicator
        if (parsed.HqTfFd is "4" or "5" or "6" or "7")
        {
            var tfVisual = ModifierRenderer.RenderTaskForceIndicator(size);
            if (tfVisual.Drawing != null)
                group.Children.Add(tfVisual.Drawing);
        }

        // Feint/Dummy indicator
        if (parsed.HqTfFd is "1" or "3" or "5" or "7")
        {
            var fdVisual = ModifierRenderer.RenderFeintDummyIndicator(size);
            if (fdVisual.Drawing != null)
                group.Children.Add(fdVisual.Drawing);
        }

        // Echelon indicator
        if (parsed.Echelon is not "" and not "00")
        {
            var echelonVisual = ModifierRenderer.RenderEchelon(parsed.Echelon, size);
            if (echelonVisual.Drawing != null)
                group.Children.Add(echelonVisual.Drawing);
        }

        return group;
    }

    /// <summary>
    /// Look up a symbol definition by its parsed SIDC fields.
    /// </summary>
    public SymbolDefinition? LookupSymbol(ParsedSidc parsed)
    {
        return _msd.GetSymbol(parsed.SymbolSet, parsed.Entity);
    }

    private static Color GetEntityColor(Affiliation affiliation)
    {
        return affiliation switch
        {
            Affiliation.Friend => Colors.Black,
            Affiliation.Hostile => Colors.Black,
            Affiliation.Neutral => Colors.Black,
            _ => Colors.Black,
        };
    }
}

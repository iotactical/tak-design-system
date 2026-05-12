// rtmx:req REQ-XW-024
using System.Globalization;
using System.Windows;
using System.Windows.Media;

namespace MilSymWpf.Rendering;

/// <summary>
/// Renders modifier and amplifier indicators for MIL-STD-2525 symbols:
/// echelon indicators, HQ flag, Task Force bracket, Feint/Dummy dashes.
/// </summary>
public static class ModifierRenderer
{
    private static readonly Typeface DefaultTypeface = new("Segoe UI");

    /// <summary>
    /// Render an echelon indicator above the frame.
    /// Echelon indicators are marks placed above the symbol frame.
    /// </summary>
    public static DrawingVisual RenderEchelon(string echelonCode, double size)
    {
        var visual = new DrawingVisual();
        using var dc = visual.RenderOpen();

        var center = size / 2;
        var top = size * 0.05;
        var markSize = size * 0.06;
        var brush = new SolidColorBrush(Colors.Black);
        brush.Freeze();
        var pen = new Pen(brush, Math.Max(1.0, size / 40));
        pen.Freeze();

        switch (echelonCode)
        {
            case "11": // Team/Crew - single dot
                dc.DrawEllipse(brush, null, new Point(center, top), markSize / 2, markSize / 2);
                break;
            case "12": // Squad - two dots
                dc.DrawEllipse(brush, null, new Point(center - markSize, top), markSize / 2, markSize / 2);
                dc.DrawEllipse(brush, null, new Point(center + markSize, top), markSize / 2, markSize / 2);
                break;
            case "13": // Section - three dots
                dc.DrawEllipse(brush, null, new Point(center - markSize * 1.5, top), markSize / 2, markSize / 2);
                dc.DrawEllipse(brush, null, new Point(center, top), markSize / 2, markSize / 2);
                dc.DrawEllipse(brush, null, new Point(center + markSize * 1.5, top), markSize / 2, markSize / 2);
                break;
            case "14": // Platoon - single vertical line
                dc.DrawLine(pen, new Point(center, top - markSize), new Point(center, top + markSize));
                break;
            case "15": // Company - single vertical line with dot
                dc.DrawLine(pen, new Point(center, top - markSize), new Point(center, top + markSize));
                dc.DrawEllipse(brush, null, new Point(center, top - markSize * 1.5), markSize / 2, markSize / 2);
                break;
            case "16": // Battalion - two vertical lines
                dc.DrawLine(pen, new Point(center - markSize, top - markSize), new Point(center - markSize, top + markSize));
                dc.DrawLine(pen, new Point(center + markSize, top - markSize), new Point(center + markSize, top + markSize));
                break;
            case "17": // Regiment - three vertical lines
                dc.DrawLine(pen, new Point(center - markSize * 1.5, top - markSize), new Point(center - markSize * 1.5, top + markSize));
                dc.DrawLine(pen, new Point(center, top - markSize), new Point(center, top + markSize));
                dc.DrawLine(pen, new Point(center + markSize * 1.5, top - markSize), new Point(center + markSize * 1.5, top + markSize));
                break;
            case "18": // Brigade - single X
                DrawX(dc, pen, center, top, markSize);
                break;
            case "19": // Division - two Xs
                DrawX(dc, pen, center - markSize * 1.2, top, markSize);
                DrawX(dc, pen, center + markSize * 1.2, top, markSize);
                break;
            case "20": // Corps - three Xs
                DrawX(dc, pen, center - markSize * 2.4, top, markSize);
                DrawX(dc, pen, center, top, markSize);
                DrawX(dc, pen, center + markSize * 2.4, top, markSize);
                break;
            case "21": // Army - four Xs
                DrawX(dc, pen, center - markSize * 3, top, markSize);
                DrawX(dc, pen, center - markSize, top, markSize);
                DrawX(dc, pen, center + markSize, top, markSize);
                DrawX(dc, pen, center + markSize * 3, top, markSize);
                break;
        }

        return visual;
    }

    /// <summary>
    /// Render a Headquarters indicator (vertical line from bottom of frame).
    /// </summary>
    public static DrawingVisual RenderHqIndicator(double size)
    {
        var visual = new DrawingVisual();
        using var dc = visual.RenderOpen();

        var brush = new SolidColorBrush(Colors.Black);
        brush.Freeze();
        var pen = new Pen(brush, Math.Max(1.5, size / 30));
        pen.Freeze();

        var center = size / 2;
        var bottom = size * 0.9;
        var lineEnd = size * 1.15;

        dc.DrawLine(pen, new Point(center, bottom), new Point(center, lineEnd));

        return visual;
    }

    /// <summary>
    /// Render a Task Force indicator (bracket/arc above the frame).
    /// </summary>
    public static DrawingVisual RenderTaskForceIndicator(double size)
    {
        var visual = new DrawingVisual();
        using var dc = visual.RenderOpen();

        var brush = new SolidColorBrush(Colors.Black);
        brush.Freeze();
        var pen = new Pen(brush, Math.Max(1.5, size / 30));
        pen.Freeze();

        var margin = size * 0.1;
        var top = size * 0.08;
        var frameTop = size * 0.1;

        // Bracket: lines from frame sides to above
        dc.DrawLine(pen, new Point(margin, frameTop), new Point(margin, top));
        dc.DrawLine(pen, new Point(margin, top), new Point(size - margin, top));
        dc.DrawLine(pen, new Point(size - margin, top), new Point(size - margin, frameTop));

        return visual;
    }

    /// <summary>
    /// Render a Feint/Dummy indicator (dashes above the frame).
    /// </summary>
    public static DrawingVisual RenderFeintDummyIndicator(double size)
    {
        var visual = new DrawingVisual();
        using var dc = visual.RenderOpen();

        var brush = new SolidColorBrush(Colors.Black);
        brush.Freeze();
        var pen = new Pen(brush, Math.Max(1.5, size / 30));
        pen.DashStyle = DashStyles.Dash;
        pen.Freeze();

        var margin = size * 0.15;
        var top = size * 0.02;

        dc.DrawLine(pen, new Point(margin, top), new Point(size - margin, top));

        return visual;
    }

    private static void DrawX(DrawingContext dc, Pen pen, double cx, double cy, double halfSize)
    {
        dc.DrawLine(pen, new Point(cx - halfSize, cy - halfSize), new Point(cx + halfSize, cy + halfSize));
        dc.DrawLine(pen, new Point(cx + halfSize, cy - halfSize), new Point(cx - halfSize, cy + halfSize));
    }
}

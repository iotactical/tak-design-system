// rtmx:req REQ-XW-023
using System.Windows;
using System.Windows.Media;

namespace MilSymWpf.Rendering;

/// <summary>
/// Renders entity icons from SVG path data as WPF GeometryDrawing objects.
/// WPF's Geometry.Parse() supports SVG-compatible mini-language path syntax,
/// allowing direct conversion from SVG d-attribute path data.
/// </summary>
public static class EntityRenderer
{
    /// <summary>
    /// Render an entity icon from SVG path data string.
    /// </summary>
    /// <param name="svgPathData">SVG path data (d attribute content)</param>
    /// <param name="size">Target size in device-independent pixels</param>
    /// <param name="fillColor">Fill color for the entity icon</param>
    /// <param name="strokeColor">Stroke color for the entity outline</param>
    /// <returns>A GeometryDrawing of the entity, or null if path data is invalid</returns>
    public static GeometryDrawing? RenderEntity(
        string svgPathData,
        double size,
        Color? fillColor = null,
        Color? strokeColor = null)
    {
        if (string.IsNullOrWhiteSpace(svgPathData))
            return null;

        try
        {
            // WPF Geometry.Parse() understands SVG path mini-language
            var geometry = Geometry.Parse(svgPathData);

            // Scale to target size
            var bounds = geometry.Bounds;
            if (bounds.Width > 0 && bounds.Height > 0)
            {
                var scale = Math.Min(size / bounds.Width, size / bounds.Height) * 0.7;
                var offsetX = (size - bounds.Width * scale) / 2 - bounds.X * scale;
                var offsetY = (size - bounds.Height * scale) / 2 - bounds.Y * scale;

                var transform = new TransformGroup();
                transform.Children.Add(new ScaleTransform(scale, scale));
                transform.Children.Add(new TranslateTransform(offsetX, offsetY));
                geometry.Transform = transform;
            }

            geometry.Freeze();

            var fill = new SolidColorBrush(fillColor ?? Colors.Black);
            fill.Freeze();

            Pen? pen = null;
            if (strokeColor.HasValue)
            {
                var strokeBrush = new SolidColorBrush(strokeColor.Value);
                strokeBrush.Freeze();
                pen = new Pen(strokeBrush, Math.Max(0.5, size / 50));
                pen.Freeze();
            }

            return new GeometryDrawing(fill, pen, geometry);
        }
        catch (FormatException)
        {
            // Invalid SVG path data
            return null;
        }
    }

    /// <summary>
    /// Create a DrawingVisual from SVG path data.
    /// </summary>
    public static DrawingVisual? RenderEntityVisual(
        string svgPathData,
        double size,
        Color? fillColor = null,
        Color? strokeColor = null)
    {
        var drawing = RenderEntity(svgPathData, size, fillColor, strokeColor);
        if (drawing == null)
            return null;

        var visual = new DrawingVisual();
        using var dc = visual.RenderOpen();
        dc.DrawDrawing(drawing);
        return visual;
    }
}

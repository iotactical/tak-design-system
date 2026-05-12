// rtmx:req REQ-XW-023
using System.Windows.Media;
using MilSymWpf.Rendering;
using Xunit;

namespace MilSymWpf.Tests;

public class EntityRendererTests
{
    // Simple SVG path: a triangle
    private const string TrianglePath = "M 10 0 L 20 20 L 0 20 Z";

    [Fact]
    public void RenderEntity_ValidPath_ReturnsDrawing()
    {
        var drawing = EntityRenderer.RenderEntity(TrianglePath, 50);
        Assert.NotNull(drawing);
    }

    [Fact]
    public void RenderEntity_NullPath_ReturnsNull()
    {
        var drawing = EntityRenderer.RenderEntity(null!, 50);
        Assert.Null(drawing);
    }

    [Fact]
    public void RenderEntity_EmptyPath_ReturnsNull()
    {
        var drawing = EntityRenderer.RenderEntity("", 50);
        Assert.Null(drawing);
    }

    [Fact]
    public void RenderEntity_InvalidPath_ReturnsNull()
    {
        var drawing = EntityRenderer.RenderEntity("not a valid path", 50);
        Assert.Null(drawing);
    }

    [Fact]
    public void RenderEntity_WithCustomColors_ReturnsDrawing()
    {
        var drawing = EntityRenderer.RenderEntity(TrianglePath, 50, Colors.Red, Colors.Blue);
        Assert.NotNull(drawing);
    }

    [Fact]
    public void RenderEntityVisual_ReturnsVisual()
    {
        var visual = EntityRenderer.RenderEntityVisual(TrianglePath, 50);
        Assert.NotNull(visual);
    }

    [Fact]
    public void RenderEntity_UsesGeometryParse()
    {
        // Verify it can handle a complex path
        var complexPath = "M 5 5 L 15 5 L 15 15 L 5 15 Z M 8 8 L 12 8 L 12 12 L 8 12 Z";
        var drawing = EntityRenderer.RenderEntity(complexPath, 100);
        Assert.NotNull(drawing);
    }
}

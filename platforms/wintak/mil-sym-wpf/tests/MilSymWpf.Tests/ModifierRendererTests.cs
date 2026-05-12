// rtmx:req REQ-XW-024
using MilSymWpf.Rendering;
using Xunit;

namespace MilSymWpf.Tests;

public class ModifierRendererTests
{
    [Theory]
    [InlineData("11")]  // Team/Crew
    [InlineData("12")]  // Squad
    [InlineData("14")]  // Platoon
    [InlineData("16")]  // Battalion
    [InlineData("18")]  // Brigade
    [InlineData("19")]  // Division
    [InlineData("20")]  // Corps
    [InlineData("21")]  // Army
    public void RenderEchelon_ReturnsVisual(string echelonCode)
    {
        var visual = ModifierRenderer.RenderEchelon(echelonCode, 50);
        Assert.NotNull(visual);
    }

    [Fact]
    public void RenderHqIndicator_ReturnsVisual()
    {
        var visual = ModifierRenderer.RenderHqIndicator(50);
        Assert.NotNull(visual);
    }

    [Fact]
    public void RenderTaskForceIndicator_ReturnsVisual()
    {
        var visual = ModifierRenderer.RenderTaskForceIndicator(50);
        Assert.NotNull(visual);
    }

    [Fact]
    public void RenderFeintDummyIndicator_ReturnsVisual()
    {
        var visual = ModifierRenderer.RenderFeintDummyIndicator(50);
        Assert.NotNull(visual);
    }

    [Fact]
    public void RenderEchelon_UnknownCode_NoError()
    {
        // Unrecognized code should not throw
        var visual = ModifierRenderer.RenderEchelon("99", 50);
        Assert.NotNull(visual);
    }
}

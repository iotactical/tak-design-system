// rtmx:req REQ-XW-022
using System.Windows.Media;
using MilSymWpf.Rendering;
using MilSymWpf.Sidc;
using Xunit;

namespace MilSymWpf.Tests;

public class FrameRendererTests
{
    [Theory]
    [InlineData(Affiliation.Friend)]
    [InlineData(Affiliation.Hostile)]
    [InlineData(Affiliation.Neutral)]
    [InlineData(Affiliation.Unknown)]
    [InlineData(Affiliation.Pending)]
    public void RenderFrame_ReturnsNonNullVisual(Affiliation affiliation)
    {
        var visual = FrameRenderer.RenderFrame(affiliation, 50);
        Assert.NotNull(visual);
    }

    [Fact]
    public void RenderFrame_FriendlyHasDrawing()
    {
        var visual = FrameRenderer.RenderFrame(Affiliation.Friend, 100);
        Assert.NotNull(visual.Drawing);
    }

    [Fact]
    public void RenderFrame_HostileHasDrawing()
    {
        var visual = FrameRenderer.RenderFrame(Affiliation.Hostile, 100);
        Assert.NotNull(visual.Drawing);
    }

    [Fact]
    public void RenderFrame_PlannedUseDashed()
    {
        // This tests that planned=true doesn't throw
        var visual = FrameRenderer.RenderFrame(Affiliation.Friend, 50, planned: true);
        Assert.NotNull(visual);
    }

    [Fact]
    public void RenderFrame_FromParsedSidc()
    {
        var parsed = SidcParser.Parse("10031000001211000000");
        var visual = FrameRenderer.RenderFrame(parsed, 50);
        Assert.NotNull(visual);
    }

    [Theory]
    [InlineData("3", Affiliation.Friend)]
    [InlineData("2", Affiliation.Friend)]
    [InlineData("6", Affiliation.Hostile)]
    [InlineData("4", Affiliation.Neutral)]
    [InlineData("1", Affiliation.Unknown)]
    [InlineData("0", Affiliation.Pending)]
    public void GetAffiliation_MapsCorrectly(string si, Affiliation expected)
    {
        Assert.Equal(expected, FrameRenderer.GetAffiliation(si));
    }
}

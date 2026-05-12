// rtmx:req REQ-XW-025
using MilSymWpf.Data;
using Xunit;

namespace MilSymWpf.Tests;

public class MsdLoaderTests
{
    [Fact]
    public void Load_ReturnsNonEmptySymbolList()
    {
        var loader = MsdLoader.Load();
        Assert.True(loader.Count > 0, "Should load at least one symbol");
    }

    [Fact]
    public void Load_ContainsAirSymbolSet()
    {
        var loader = MsdLoader.Load();
        var airSymbols = loader.GetSymbolSet("01");
        Assert.NotEmpty(airSymbols);
    }

    [Fact]
    public void GetSymbol_ReturnsCorrectEntity()
    {
        var loader = MsdLoader.Load();
        // Symbol Set 01 (Air), entity code 110000 = "Military"
        var sym = loader.GetSymbol("01", "110000");
        Assert.NotNull(sym);
        Assert.Equal("01", sym.SymbolSet);
        Assert.Equal("110000", sym.Code);
    }

    [Fact]
    public void GetSymbol_ReturnsNullForUnknown()
    {
        var loader = MsdLoader.Load();
        var sym = loader.GetSymbol("99", "999999");
        Assert.Null(sym);
    }

    [Fact]
    public void LoadFromJson_ParsesMinimalData()
    {
        var json = """
        {
          "msd": {
            "SYMBOL": [
              { "ss": "01", "e": "Test", "et": "", "est": "", "code": "110000", "versions": "10" }
            ]
          }
        }
        """;

        var loader = MsdLoader.LoadFromJson(json);
        Assert.Equal(1, loader.Count);
        var sym = loader.GetSymbol("01", "110000");
        Assert.NotNull(sym);
        Assert.Equal("Test", sym.Entity);
    }
}

// rtmx:req REQ-XW-021
using MilSymWpf.Sidc;
using Xunit;

namespace MilSymWpf.Tests;

public class SidcParserTests
{
    // Friendly Land Unit Infantry: 10031000001211000000
    private const string FriendlyInfantry = "10031000001211000000";
    // Hostile Air Fighter: 10060100001101000000
    private const string HostileAirFighter = "10060100001101000000";
    // B-series friendly ground: SFGPUCI---*****
    private const string BFriendlyInfantry = "SFGPUCI-------";

    [Fact]
    public void Parse_20Char_ExtractsVersion()
    {
        var result = SidcParser.Parse(FriendlyInfantry);
        Assert.True(result.IsValid);
        Assert.Equal("D", result.Version);
    }

    [Fact]
    public void Parse_20Char_ExtractsStandardIdentity()
    {
        var result = SidcParser.Parse(FriendlyInfantry);
        Assert.Equal("3", result.StandardIdentity);
        Assert.Equal("Friend", result.StandardIdentityName);
    }

    [Fact]
    public void Parse_20Char_ExtractsHostile()
    {
        var result = SidcParser.Parse(HostileAirFighter);
        Assert.Equal("6", result.StandardIdentity);
        Assert.Equal("Hostile/Faker", result.StandardIdentityName);
    }

    [Fact]
    public void Parse_20Char_ExtractsSymbolSet()
    {
        var result = SidcParser.Parse(FriendlyInfantry);
        Assert.Equal("10", result.SymbolSet);
        Assert.Equal("Land Unit", result.SymbolSetName);
    }

    [Fact]
    public void Parse_20Char_ExtractsAirSymbolSet()
    {
        var result = SidcParser.Parse(HostileAirFighter);
        Assert.Equal("01", result.SymbolSet);
        Assert.Equal("Air", result.SymbolSetName);
    }

    [Fact]
    public void Parse_20Char_ExtractsStatus()
    {
        var result = SidcParser.Parse(FriendlyInfantry);
        Assert.Equal("0", result.Status);
        Assert.Equal("Present", result.StatusName);
    }

    [Fact]
    public void Parse_20Char_ExtractsEntity()
    {
        var result = SidcParser.Parse(FriendlyInfantry);
        Assert.Equal("121100", result.Entity);
    }

    [Fact]
    public void Parse_20Char_ExtractsModifiers()
    {
        var result = SidcParser.Parse(FriendlyInfantry);
        Assert.Equal("00", result.Modifier1);
        Assert.Equal("00", result.Modifier2);
    }

    [Fact]
    public void Parse_20Char_ExtractsEchelon()
    {
        var result = SidcParser.Parse(FriendlyInfantry);
        Assert.Equal("00", result.Echelon);
        Assert.Equal("Unspecified", result.EchelonName);
    }

    [Fact]
    public void Parse_20Char_ExtractsHqTfFd()
    {
        var result = SidcParser.Parse(FriendlyInfantry);
        Assert.Equal("0", result.HqTfFd);
        Assert.Equal("Not Applicable", result.HqTfFdName);
    }

    [Fact]
    public void Parse_15Char_ExtractsVersion()
    {
        var result = SidcParser.Parse(BFriendlyInfantry);
        Assert.True(result.IsValid);
        Assert.Equal("B", result.Version);
    }

    [Fact]
    public void Parse_15Char_ExtractsIdentity()
    {
        var result = SidcParser.Parse(BFriendlyInfantry);
        Assert.Equal("F", result.StandardIdentity);
        Assert.Equal("Friend", result.StandardIdentityName);
    }

    [Fact]
    public void Parse_Null_ReturnsInvalid()
    {
        var result = SidcParser.Parse(null);
        Assert.False(result.IsValid);
    }

    [Fact]
    public void Parse_Empty_ReturnsInvalid()
    {
        var result = SidcParser.Parse("");
        Assert.False(result.IsValid);
    }

    [Fact]
    public void Parse_InvalidLength_ReturnsInvalid()
    {
        var result = SidcParser.Parse("12345");
        Assert.False(result.IsValid);
    }

    [Fact]
    public void Parse_PreservesRawSidc()
    {
        var result = SidcParser.Parse(FriendlyInfantry);
        Assert.Equal(FriendlyInfantry, result.Raw);
    }
}

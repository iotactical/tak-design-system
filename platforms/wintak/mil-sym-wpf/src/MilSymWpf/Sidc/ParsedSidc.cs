// rtmx:req REQ-XW-021
namespace MilSymWpf.Sidc;

/// <summary>
/// Parsed fields from a MIL-STD-2525 Symbol Identification Code.
/// Supports both 20-character (D/E) and 15-character (B/C) formats.
/// </summary>
public record ParsedSidc
{
    /// <summary>SIDC version: "D" for 20-char, "B" for 15-char</summary>
    public string Version { get; init; } = "";

    /// <summary>Original SIDC string</summary>
    public string Raw { get; init; } = "";

    /// <summary>Context code (position 1 in D/E format): 0=Reality, 1=Exercise, 2=Simulation</summary>
    public string Context { get; init; } = "";

    /// <summary>Standard Identity code: 0-6 in D/E, character in B/C (F/H/N/U/etc.)</summary>
    public string StandardIdentity { get; init; } = "";

    /// <summary>Standard Identity name (e.g., "Friend", "Hostile")</summary>
    public string StandardIdentityName { get; init; } = "";

    /// <summary>Symbol Set code (e.g., "01" for Air, "10" for Land Unit)</summary>
    public string SymbolSet { get; init; } = "";

    /// <summary>Symbol Set name (e.g., "Air", "Land Unit")</summary>
    public string SymbolSetName { get; init; } = "";

    /// <summary>Status code: 0=Present, 1=Planned</summary>
    public string Status { get; init; } = "";

    /// <summary>Status name</summary>
    public string StatusName { get; init; } = "";

    /// <summary>HQ/Task Force/Feint-Dummy indicator</summary>
    public string HqTfFd { get; init; } = "";

    /// <summary>HQ/TF/FD name</summary>
    public string HqTfFdName { get; init; } = "";

    /// <summary>Echelon code</summary>
    public string Echelon { get; init; } = "";

    /// <summary>Echelon name</summary>
    public string EchelonName { get; init; } = "";

    /// <summary>Entity code (6 characters in D/E format)</summary>
    public string Entity { get; init; } = "";

    /// <summary>Modifier 1 code (2 characters)</summary>
    public string Modifier1 { get; init; } = "";

    /// <summary>Modifier 2 code (2 characters)</summary>
    public string Modifier2 { get; init; } = "";

    /// <summary>Whether the SIDC was successfully parsed</summary>
    public bool IsValid { get; init; }
}

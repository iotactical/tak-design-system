// rtmx:req REQ-XW-021
namespace MilSymWpf.Sidc;

/// <summary>
/// Parses MIL-STD-2525 Symbol Identification Codes (SIDCs).
/// Supports both 20-character (D/E) and 15-character (B/C) formats.
///
/// D/E 20-character format:
///   Position: 0-1  2  3  4-5  6  7  8-9  10-15  16-17  18-19
///   Field:    Ver  Ctx SI SS   St HQ Ech  Entity Mod1   Mod2
///
/// B/C 15-character format:
///   Position: 0     1   2     3  4-9    10       11      12-14
///   Field:    Scheme SI  BattDim Stat  FuncID   Echelon  HQ/Country
/// </summary>
public static class SidcParser
{
    private static readonly Dictionary<string, string> SymbolSetNames = new()
    {
        ["01"] = "Air",
        ["02"] = "Air Missile",
        ["05"] = "Space",
        ["06"] = "Space Missile",
        ["10"] = "Land Unit",
        ["11"] = "Land Civilian",
        ["15"] = "Land Equipment",
        ["20"] = "Land Installation",
        ["25"] = "Control Measures",
        ["27"] = "Stability Operations",
        ["30"] = "Sea Surface",
        ["35"] = "Sea Subsurface",
        ["36"] = "Mine Warfare",
        ["40"] = "Activities",
        ["45"] = "Atmospheric",
        ["46"] = "Oceanographic",
        ["47"] = "Meteorological Space",
        ["50"] = "Signals Intelligence - Space",
        ["51"] = "Signals Intelligence - Air",
        ["52"] = "Signals Intelligence - Land",
        ["53"] = "Signals Intelligence - Surface",
        ["54"] = "Signals Intelligence - Subsurface",
        ["60"] = "Cyberspace",
    };

    private static readonly Dictionary<string, string> StandardIdentityNames = new()
    {
        ["0"] = "Pending",
        ["1"] = "Unknown",
        ["2"] = "Assumed Friend",
        ["3"] = "Friend",
        ["4"] = "Neutral",
        ["5"] = "Suspect/Joker",
        ["6"] = "Hostile/Faker",
    };

    private static readonly Dictionary<string, string> StatusNames = new()
    {
        ["0"] = "Present",
        ["1"] = "Planned/Anticipated",
    };

    private static readonly Dictionary<string, string> EchelonNames = new()
    {
        ["00"] = "Unspecified",
        ["11"] = "Team/Crew",
        ["12"] = "Squad",
        ["13"] = "Section",
        ["14"] = "Platoon",
        ["15"] = "Company/Battery",
        ["16"] = "Battalion/Squadron",
        ["17"] = "Regiment/Group",
        ["18"] = "Brigade",
        ["19"] = "Division",
        ["20"] = "Corps",
        ["21"] = "Army",
        ["22"] = "Front",
        ["23"] = "Region",
        ["24"] = "Command",
    };

    private static readonly Dictionary<string, string> HqTfFdNames = new()
    {
        ["0"] = "Not Applicable",
        ["1"] = "Feint/Dummy",
        ["2"] = "Headquarters",
        ["3"] = "Feint/Dummy HQ",
        ["4"] = "Task Force",
        ["5"] = "Feint/Dummy TF",
        ["6"] = "Task Force HQ",
        ["7"] = "Feint/Dummy TF HQ",
    };

    // B/C Standard Identity character to name
    private static readonly Dictionary<char, string> BcIdentityNames = new()
    {
        ['P'] = "Pending",
        ['U'] = "Unknown",
        ['A'] = "Assumed Friend",
        ['F'] = "Friend",
        ['N'] = "Neutral",
        ['S'] = "Suspect",
        ['H'] = "Hostile",
        ['J'] = "Joker",
        ['K'] = "Faker",
    };

    /// <summary>
    /// Parse a SIDC string into its component fields.
    /// </summary>
    /// <param name="sidc">A 15 or 20 character SIDC string</param>
    /// <returns>Parsed SIDC with named fields and lookup values</returns>
    public static ParsedSidc Parse(string? sidc)
    {
        if (string.IsNullOrEmpty(sidc))
            return new ParsedSidc { IsValid = false };

        return sidc.Length switch
        {
            20 => ParseD(sidc),
            15 => ParseB(sidc),
            _ => new ParsedSidc { Raw = sidc, IsValid = false },
        };
    }

    private static ParsedSidc ParseD(string sidc)
    {
        var context = sidc[2].ToString();
        var si = sidc[3].ToString();
        var symbolSet = sidc.Substring(4, 2);
        var status = sidc[6].ToString();
        var hqTfFd = sidc[7].ToString();
        var echelon = sidc.Substring(8, 2);
        var entity = sidc.Substring(10, 6);
        var mod1 = sidc.Substring(16, 2);
        var mod2 = sidc.Substring(18, 2);

        return new ParsedSidc
        {
            Version = "D",
            Raw = sidc,
            Context = context,
            StandardIdentity = si,
            StandardIdentityName = StandardIdentityNames.GetValueOrDefault(si, si),
            SymbolSet = symbolSet,
            SymbolSetName = SymbolSetNames.GetValueOrDefault(symbolSet, symbolSet),
            Status = status,
            StatusName = StatusNames.GetValueOrDefault(status, status),
            HqTfFd = hqTfFd,
            HqTfFdName = HqTfFdNames.GetValueOrDefault(hqTfFd, hqTfFd),
            Echelon = echelon,
            EchelonName = EchelonNames.GetValueOrDefault(echelon, echelon),
            Entity = entity,
            Modifier1 = mod1,
            Modifier2 = mod2,
            IsValid = true,
        };
    }

    private static ParsedSidc ParseB(string sidc)
    {
        var siChar = sidc[1];
        var identityName = BcIdentityNames.GetValueOrDefault(siChar, siChar.ToString());

        return new ParsedSidc
        {
            Version = "B",
            Raw = sidc,
            StandardIdentity = siChar.ToString(),
            StandardIdentityName = identityName,
            Status = sidc[3].ToString(),
            StatusName = sidc[3] == 'A' ? "Planned/Anticipated" : "Present",
            Entity = sidc.Substring(4, 6),
            Echelon = sidc.Length > 10 ? sidc[10].ToString() : "",
            HqTfFd = sidc.Length > 11 ? sidc[11].ToString() : "",
            IsValid = true,
        };
    }
}

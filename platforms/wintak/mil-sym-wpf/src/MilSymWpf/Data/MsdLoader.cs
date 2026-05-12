// rtmx:req REQ-XW-025
using System.IO;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace MilSymWpf.Data;

/// <summary>
/// A single symbol definition from msd.json.
/// </summary>
public record SymbolDefinition
{
    [JsonPropertyName("ss")]
    public string SymbolSet { get; init; } = "";

    [JsonPropertyName("e")]
    public string Entity { get; init; } = "";

    [JsonPropertyName("et")]
    public string EntityType { get; init; } = "";

    [JsonPropertyName("est")]
    public string EntitySubType { get; init; } = "";

    [JsonPropertyName("code")]
    public string Code { get; init; } = "";

    [JsonPropertyName("versions")]
    public string Versions { get; init; } = "";
}

/// <summary>
/// Loads MIL-STD-2525 symbol definitions from the embedded msd.json resource.
/// </summary>
public class MsdLoader
{
    private readonly List<SymbolDefinition> _symbols;
    private readonly Dictionary<string, List<SymbolDefinition>> _bySymbolSet;
    private readonly Dictionary<string, SymbolDefinition> _byCode;

    private MsdLoader(List<SymbolDefinition> symbols)
    {
        _symbols = symbols;
        _bySymbolSet = symbols
            .Where(s => !string.IsNullOrEmpty(s.SymbolSet))
            .GroupBy(s => s.SymbolSet)
            .ToDictionary(g => g.Key, g => g.ToList());
        _byCode = new Dictionary<string, SymbolDefinition>();
        foreach (var s in symbols)
        {
            var key = $"{s.SymbolSet}:{s.Code}";
            _byCode.TryAdd(key, s);
        }
    }

    /// <summary>
    /// Load from the embedded msd.json resource.
    /// </summary>
    public static MsdLoader Load()
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = assembly.GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith("msd.json"))
            ?? throw new InvalidOperationException("msd.json embedded resource not found");

        using var stream = assembly.GetManifestResourceStream(resourceName)!;
        using var reader = new StreamReader(stream);
        var json = reader.ReadToEnd();

        var root = JsonSerializer.Deserialize<MsdRoot>(json)
            ?? throw new InvalidOperationException("Failed to parse msd.json");

        return new MsdLoader(root.Msd?.Symbols ?? []);
    }

    /// <summary>
    /// Load from an arbitrary JSON string (for testing).
    /// </summary>
    public static MsdLoader LoadFromJson(string json)
    {
        var root = JsonSerializer.Deserialize<MsdRoot>(json)
            ?? throw new InvalidOperationException("Failed to parse JSON");
        return new MsdLoader(root.Msd?.Symbols ?? []);
    }

    /// <summary>
    /// Get a symbol definition by symbol set and entity code.
    /// </summary>
    public SymbolDefinition? GetSymbol(string symbolSet, string entityCode)
    {
        return _byCode.GetValueOrDefault($"{symbolSet}:{entityCode}");
    }

    /// <summary>
    /// Get all symbols in a given symbol set.
    /// </summary>
    public IReadOnlyList<SymbolDefinition> GetSymbolSet(string symbolSet)
    {
        return _bySymbolSet.GetValueOrDefault(symbolSet) ?? (IReadOnlyList<SymbolDefinition>)[];
    }

    /// <summary>
    /// Get all loaded symbols.
    /// </summary>
    public IReadOnlyList<SymbolDefinition> All => _symbols;

    /// <summary>
    /// Total number of symbols loaded.
    /// </summary>
    public int Count => _symbols.Count;

    // Internal JSON model matching msd.json structure
    private record MsdRoot
    {
        [JsonPropertyName("msd")]
        public MsdContainer? Msd { get; init; }
    }

    private record MsdContainer
    {
        [JsonPropertyName("SYMBOL")]
        public List<SymbolDefinition>? Symbols { get; init; }
    }
}

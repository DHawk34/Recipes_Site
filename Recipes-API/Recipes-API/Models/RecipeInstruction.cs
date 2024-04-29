using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Recipes_API.Models;

public partial class RecipeInstruction
{
    [JsonIgnore]
    public int Recipe { get; set; }

    public int Step { get; set; }

    public int InstructionImage { get; set; }

    public string InstructionText { get; set; } = null!;

    [JsonIgnore]
    public virtual Image InstructionImageNavigation { get; set; } = null!;

    [JsonIgnore]
    public virtual Recipe RecipeNavigation { get; set; } = null!;
}

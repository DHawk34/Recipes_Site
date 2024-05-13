using System;
using System.Collections.Generic;

namespace Recipes_API.Scaffold;

public partial class RecipeInstruction
{
    public int Recipe { get; set; }

    public int Step { get; set; }

    public int InstructionImage { get; set; }

    public string InstructionText { get; set; } = null!;

    public virtual Image InstructionImageNavigation { get; set; } = null!;

    public virtual Recipe RecipeNavigation { get; set; } = null!;
}

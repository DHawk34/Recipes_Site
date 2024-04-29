using System;
using System.Collections.Generic;

namespace Recipes_API.Models;

public partial class Image
{
    public int Id { get; set; }

    public byte[] Data { get; set; } = null!;

    public string ContentType { get; set; } = null!;

    public virtual ICollection<RecipeInstruction> RecipeInstructions { get; set; } = new List<RecipeInstruction>();

    public virtual ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
}
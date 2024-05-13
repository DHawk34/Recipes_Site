using System;
using System.Collections.Generic;

namespace Recipes_API.Scaffold;

public partial class NationalCuisine
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
}

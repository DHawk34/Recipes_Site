using System;
using System.Collections.Generic;

namespace Recipes_API.Scaffold;

public partial class Ingredient
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<RecipeIngredient> RecipeIngredients { get; set; } = new List<RecipeIngredient>();
}

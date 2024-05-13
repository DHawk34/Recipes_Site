using System;
using System.Collections.Generic;

namespace Recipes_API.Scaffold;

public partial class RecipeIngredient
{
    public int Recipe { get; set; }

    public int Ingredient { get; set; }

    public int Amount { get; set; }

    public virtual Ingredient IngredientNavigation { get; set; } = null!;

    public virtual Recipe RecipeNavigation { get; set; } = null!;
}

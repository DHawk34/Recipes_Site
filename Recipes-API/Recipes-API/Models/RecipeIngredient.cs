using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Recipes_API.Models;

public partial class RecipeIngredient
{
    [JsonIgnore]
    public int Recipe { get; set; }

    public int Ingredient { get; set; }

    public int Amount { get; set; }

    public virtual Ingredient IngredientNavigation { get; set; } = null!;

    [JsonIgnore]
    public virtual Recipe RecipeNavigation { get; set; } = null!;
}

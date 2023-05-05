using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Recipes_API.Models;

public partial class RecipeIngredient
{
    [JsonIgnore]
    public long Recipe { get; set; }

    public long Ingredient { get; set; }

    public long Amount { get; set; }

    public virtual Ingredient IngridientNavigation { get; set; } = null!;
    [JsonIgnore]
    public virtual Recipe RecipeNavigation { get; set; } = null!;
}

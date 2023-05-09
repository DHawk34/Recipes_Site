using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Recipes_API.Models;

public partial class Recipe
{
    public long Id { get; set; }

    public long FinishImage { get; set; }

    public string Name { get; set; } = null!;

    [JsonIgnore]
    public long Group { get; set; }

    [JsonIgnore]
    public long? NationalCuisine { get; set; }

    public string CookTime { get; set; } = null!;

    public long PortionCount { get; set; }

    public long Difficult { get; set; }

    public long Hot { get; set; }

    public string CreationTime { get; set; } = null!;

    public virtual Image FinishImageNavigation { get; set; } = null!;

    public virtual RecipeGroup GroupNavigation { get; set; } = null!;

    public virtual NationalCuisine? NationalCuisineNavigation { get; set; }

    public virtual ICollection<RecipeIngredient> RecipeIngredients { get; set; } = new List<RecipeIngredient>();

    public virtual ICollection<RecipeInstruction> RecipeInstructions { get; set; } = new List<RecipeInstruction>();
}

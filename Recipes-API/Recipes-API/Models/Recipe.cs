using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Recipes_API.Models;

public partial class Recipe
{
    public int Id { get; set; }

    public int FinishImage { get; set; }

    public string Name { get; set; } = null!;

    [JsonIgnore]
    public int Group { get; set; }

    [JsonIgnore]
    public int? NationalCuisine { get; set; }

    public string CookTime { get; set; } = null!;

    public int PortionCount { get; set; }

    public int Difficult { get; set; }

    public int Hot { get; set; }

    public string CreationTime { get; set; } = null!;

    public virtual Image FinishImageNavigation { get; set; } = null!;

    public virtual RecipeGroup GroupNavigation { get; set; } = null!;

    public virtual NationalCuisine? NationalCuisineNavigation { get; set; }

    public virtual ICollection<RecipeIngredient> RecipeIngredients { get; set; } = new List<RecipeIngredient>();

    public virtual ICollection<RecipeInstruction> RecipeInstructions { get; set; } = new List<RecipeInstruction>();
}

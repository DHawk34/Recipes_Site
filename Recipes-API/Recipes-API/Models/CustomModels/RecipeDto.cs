using System.Text.Json.Serialization;

namespace Recipes_API.Models.CustomModels;

public record RecipeDtoMin
{
    public int Id { get; set; }

    public int FinishImage { get; set; }

    public string Name { get; set; } = null!;

    public string CookTime { get; set; } = null!;

    public virtual ICollection<RecipeIngredient> RecipeIngredients { get; set; } = new List<RecipeIngredient>();

}
public record RecipeDtoBase
{
    public int Id { get; set; }

    public int FinishImage { get; set; }

    public string Name { get; set; } = null!;

    public string CookTime { get; set; } = null!;

    public int PortionCount { get; set; }

    public int Difficult { get; set; }

    public int Hot { get; set; }

    public DateTime CreationTime { get; set; }

    public virtual Image FinishImageNavigation { get; set; } = null!;

    public virtual RecipeGroup GroupNavigation { get; set; } = null!;

    public virtual NationalCuisine? NationalCuisineNavigation { get; set; }

    public virtual ICollection<RecipeIngredient> RecipeIngredients { get; set; } = new List<RecipeIngredient>();

    public virtual ICollection<RecipeInstruction> RecipeInstructions { get; set; } = new List<RecipeInstruction>();

    public virtual ICollection<Mealtime> Mealtimes { get; set; } = new List<Mealtime>();
}

public record RecipeDtoUser : RecipeDtoBase
{
    public virtual UserDtoBase OwnerNavigation { get; set; } = null!;
    public bool IsOwner { get; set; } = false!;
    public bool IsFavorite { get; set; } = false!;
}
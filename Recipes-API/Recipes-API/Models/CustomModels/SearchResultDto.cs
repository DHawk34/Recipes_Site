namespace Recipes_API.Models.CustomModels;

public record SearchResultDto
{
    public required bool IsAdmin { get; set; }
    public required List<Recipe> Recipes { get; set; }
}

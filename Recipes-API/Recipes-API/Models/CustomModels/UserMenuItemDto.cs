namespace Recipes_API.Models.CustomModels;

public record UserMenuItemDto
{
    public int Day { get; set; }
    public virtual Mealtime MealtimeNavigation { get; set; } = null!;

    public virtual RecipeDtoMin RecipeNavigation { get; set; } = null!;

}

public record UserMenuDto
{
    public int NationalCuisine { get; set; }

    public virtual ICollection<UserMenuItemDto> Menu { get; set; } = new List<UserMenuItemDto>();
}

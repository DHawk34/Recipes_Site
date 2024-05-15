namespace Recipes_API.Models.CustomModels;

public record UserLoginDto
{
    public required string Username { get; init; }
    public required string Password { get; init; }
}

public record UserRegisterDto
{
    public required string Username { get; init; }
    public required string[] Password { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
}

public record UserDtoBase
{
    public Guid PublicId { get; set; }
    public string Name { get; set; } = null!;
}

public record UserDtoRecipe : UserDtoBase
{
    public virtual ICollection<RecipeDtoBase> Recipes { get; set; } = new List<RecipeDtoBase>();
}
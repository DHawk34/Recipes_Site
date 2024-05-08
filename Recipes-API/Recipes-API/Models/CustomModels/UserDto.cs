namespace Recipes_API.Models.CustomModels;

public record UserLoginDto
{
    public required string Login { get; init; }
    public required string Password { get; init; }
}

public record UserRegisterDto : UserLoginDto
{
    public required string Name { get; init; }
}

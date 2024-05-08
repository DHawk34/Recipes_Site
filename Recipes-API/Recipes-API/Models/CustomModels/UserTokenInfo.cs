namespace Recipes_API.Models.CustomModels;

public record UserTokenInfo
{
    public required Guid PublicID { get; set; }
}

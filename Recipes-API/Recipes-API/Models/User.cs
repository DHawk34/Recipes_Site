using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Recipes_API.Models;

public partial class User
{
    [JsonIgnore]
    public int Id { get; set; }

    public Guid PublicId { get; set; }

    [JsonIgnore]
    public string Login { get; set; } = null!;

    public string Name { get; set; } = null!;

    [JsonIgnore]
    public byte[] PasswordHash { get; set; } = null!;

    [JsonIgnore]
    public byte[] PasswordSalt { get; set; } = null!;

    [JsonIgnore]
    public string Email { get; set; } = null!;

    public virtual ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
    public virtual ICollection<UserMenu> UserMenus { get; set; } = new List<UserMenu>();
    public virtual ICollection<Recipe> FavoriteRecipes { get; set; } = new List<Recipe>();

    [JsonIgnore]
    public virtual ICollection<UserRefreshToken> UserRefreshTokens { get; set; } = new List<UserRefreshToken>();
}

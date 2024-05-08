using System;
using System.Collections.Generic;

namespace Recipes_API.Models;

public partial class User
{
    public int Id { get; set; }

    public Guid PublicId { get; set; }

    public string Login { get; set; } = null!;

    public string Name { get; set; } = null!;

    public byte[] PasswordHash { get; set; } = null!;

    public byte[] PasswordSalt { get; set; } = null!;

    public virtual ICollection<UserRefreshToken> UserRefreshTokens { get; set; } = new List<UserRefreshToken>();
}

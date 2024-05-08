using System;
using System.Collections.Generic;

namespace Recipes_API.Models;

public partial class UserRefreshToken
{
    public int UserId { get; set; }

    public Guid DeviceId { get; set; }

    public byte[] TokenHash { get; set; } = null!;

    public DateTime CreatedDate { get; set; }

    public DateTime ExpiresDate { get; set; }

    public virtual User User { get; set; } = null!;
}

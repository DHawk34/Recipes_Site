using System;
using System.Collections.Generic;

namespace Recipes_API.Models;

public partial class UserMenu
{
    public int User { get; set; }

    public int Day { get; set; }

    public int Mealtime { get; set; }

    public int Recipe { get; set; }

    public virtual Mealtime MealtimeNavigation { get; set; } = null!;

    public virtual Recipe RecipeNavigation { get; set; } = null!;

    public virtual User UserNavigation { get; set; } = null!;
}

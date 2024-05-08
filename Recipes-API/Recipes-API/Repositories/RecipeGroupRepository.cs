using Microsoft.EntityFrameworkCore;
using Recipes_API.DATA;
using Recipes_API.Models;

namespace Recipes_API.Repositories;

public class RecipeGroupRepository
{
    private readonly RecipeSiteContext dbContext;

    public RecipeGroupRepository(RecipeSiteContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<List<RecipeGroup>> GetAllGroupsAsync()
    {
        return await dbContext.RecipeGroups.ToListAsync();
    }
}

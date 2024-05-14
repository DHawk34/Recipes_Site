using Microsoft.EntityFrameworkCore;
using Recipes_API.DATA;
using Recipes_API.Models;

namespace Recipes_API.Repositories;

public class MealtimeRepository
{
    private readonly RecipeSiteContext dbContext;

    public MealtimeRepository(RecipeSiteContext dbContext)
    {
        this.dbContext = dbContext;
    }
    public async Task<List<Mealtime>> GetAllAsync()
    {
        return await dbContext.Mealtimes.ToListAsync();
    }
}

using Microsoft.EntityFrameworkCore;
using Recipes_API.DATA;
using Recipes_API.Models;

namespace Recipes_API.Repositories;


public class NationalCuisineRepository
{
    private readonly RecipeSiteContext dbContext;

    public NationalCuisineRepository(RecipeSiteContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<List<NationalCuisine>> GetAllAsync()
    {
        return await dbContext.NationalCuisines.ToListAsync();
    }

    public async Task<int> GetIdOrAddAsync(string nationalCuisine)
    {
        var n_nationalCuisine = await dbContext.NationalCuisines.FirstOrDefaultAsync((x) => x.Name == nationalCuisine);
        if (n_nationalCuisine != null)
            return n_nationalCuisine.Id;

        var new_nationalCuisine = await dbContext.NationalCuisines.AddAsync(new NationalCuisine()
        {
            Name = nationalCuisine
        });

        await dbContext.SaveChangesAsync();

        return new_nationalCuisine.Entity.Id;
    }
}


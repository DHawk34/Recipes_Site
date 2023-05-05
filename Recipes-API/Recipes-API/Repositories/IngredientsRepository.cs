using Microsoft.EntityFrameworkCore;
using Recipes_API.DATA;
using Recipes_API.Models;

namespace Recipes_API.Repositories;

public class IngredientsRepository
{
    private readonly RecipesSiteDbContext dbContext;

    public IngredientsRepository(RecipesSiteDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<List<Ingredient>> GetAllAsync()
    {
        return await dbContext.Ingredients.ToListAsync();
    }

    public async Task<long> GetIdOrAddAsync(string ingredientName)
    {
        var n_ingredient = await dbContext.Ingredients.FirstOrDefaultAsync((x) => x.Name == ingredientName);
        if (n_ingredient != null)
            return n_ingredient.Id;

        var new_ingredient = await dbContext.Ingredients.AddAsync(new Ingredient()
        {
            Name = ingredientName
        });

        await dbContext.SaveChangesAsync();

        return new_ingredient.Entity.Id;
    }

}

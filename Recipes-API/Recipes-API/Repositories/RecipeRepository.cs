using Microsoft.EntityFrameworkCore;
using Recipes_API.DATA;
using Recipes_API.Models;

namespace Recipes_API.Repositories;

public class RecipeRepository
{

    private readonly RecipesSiteDbContext dbContext;
    public RecipeRepository(RecipesSiteDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<long> AddNewRecipeAsync(long finishDishImage, string name, long? nationalCuisine, string cookTime, int portionCount, int difficult, int hot, string creationTime)
    {
        var new_recipe = await dbContext.Recipes.AddAsync(new Recipe()
        {
            Name = name,
            FinishImage = finishDishImage,
            NationalCuisine = nationalCuisine,
            CookTime = cookTime,
            PortionCount = portionCount,
            Difficult = difficult,
            Hot = hot,
            CreationTime = creationTime
        });

        await dbContext.SaveChangesAsync();
        return new_recipe.Entity.Id;
    }

    public async Task<List<Recipe>> GetAllAsync()
    {
        return await dbContext.Recipes.Include(x => x.NationalCuisineNavigation).Include(x => x.RecipeIngredients).ThenInclude(x => x.IngridientNavigation).ToListAsync();
    }

    public async Task<Recipe?> GetAsync(long id)
    {
        return await dbContext.Recipes.Include(x => x.NationalCuisineNavigation).Include(x => x.RecipeIngredients).ThenInclude(x => x.IngridientNavigation).Include(x => x.RecipeInstructions).FirstOrDefaultAsync(x=> x.Id == id);
    }
}


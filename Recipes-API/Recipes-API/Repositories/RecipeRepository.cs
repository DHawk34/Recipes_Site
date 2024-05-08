using Microsoft.EntityFrameworkCore;
using Recipes_API.DATA;
using Recipes_API.Models;

namespace Recipes_API.Repositories;

public class RecipeRepository
{

    private readonly RecipeSiteContext dbContext;
    public RecipeRepository(RecipeSiteContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<int> AddNewRecipeAsync(int finishDishImage, string name, int group, int? nationalCuisine, string cookTime, int portionCount, int difficult, int hot, string creationTime)
    {
        var new_recipe = await dbContext.Recipes.AddAsync(new Recipe()
        {
            Name = name,
            Group = group,
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

    public async Task<List<Recipe>> GetGroupsCatalogAsync()
    {
        IEnumerable<Recipe> query = await dbContext.Recipes.Include(x => x.GroupNavigation).ToListAsync();
        query = query.DistinctBy(x => x.Group);
        return query.ToList();
    }

    public async Task<List<Recipe>> GetNationalCuisineCatalogAsync()
    {
        IEnumerable<Recipe> query = await dbContext.Recipes.Include(x => x.NationalCuisineNavigation).Where(x => x.NationalCuisine != null).ToListAsync();
        query = query.DistinctBy(x => x.NationalCuisine);
        return query.ToList();
    }

    public async Task<List<Recipe>> GetNewsCatalogAsync(int count)
    {
        IEnumerable<Recipe> query = await dbContext.Recipes.ToListAsync();
        query = query.OrderByDescending(x => DateTime.Parse(x.CreationTime, null, System.Globalization.DateTimeStyles.RoundtripKind)).Take(count);
        return query.ToList();
    }

    public async Task<List<Recipe>> GetAllAsync()
    {
        return await dbContext.Recipes.Include(x => x.GroupNavigation).Include(x => x.NationalCuisineNavigation).Include(x => x.RecipeIngredients).ThenInclude(x => x.IngredientNavigation).ToListAsync();
    }

    public async Task<Recipe?> GetAsync(long id)
    {
        return await dbContext.Recipes.Include(x => x.GroupNavigation).Include(x => x.NationalCuisineNavigation).Include(x => x.RecipeIngredients).ThenInclude(x => x.IngredientNavigation).Include(x => x.RecipeInstructions).FirstOrDefaultAsync(x => x.Id == id);
    }
}


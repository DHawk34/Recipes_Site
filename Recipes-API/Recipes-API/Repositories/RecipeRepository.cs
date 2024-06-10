using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Recipes_API.Configuration;
using Recipes_API.DATA;
using Recipes_API.Models;
using Recipes_API.Models.CustomModels;

namespace Recipes_API.Repositories;

public class RecipeRepository
{

    private readonly RecipeSiteContext dbContext;
    public RecipeRepository(RecipeSiteContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<int> AddNewRecipeAsync(int finishDishImage, string name, int group, int[] mealtime, int? nationalCuisine, string cookTime, int portionCount, int difficult, int hot, int owner, DateTime creationTime)
    {
        var new_recipe = await dbContext.Recipes.AddAsync(new Recipe()
        {
            Name = name,
            Group = group,
            Mealtimes = dbContext.Mealtimes.Where(x => mealtime.Contains(x.Id)).ToList(),
            FinishImage = finishDishImage,
            NationalCuisine = nationalCuisine,
            CookTime = cookTime,
            PortionCount = portionCount,
            Difficult = difficult,
            Hot = hot,
            Owner = owner,
            CreationTime = creationTime,
            Verified = false
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
        query = query.OrderByDescending(x => x.CreationTime).Take(count);
        return query.ToList();
    }

    public async Task<List<Recipe>> GetAllAsync()
    {
        return await dbContext.Recipes.Include(x => x.GroupNavigation).Include(x => x.NationalCuisineNavigation).Include(x => x.RecipeIngredients).ThenInclude(x => x.IngredientNavigation).ToListAsync();
    }

    public async Task<RecipeDtoUser?> GetDtoAsync(int id)
    {
        var mapper = AutoMapperConfig.RecipeWithOwnerConfig.CreateMapper();

        var recipeEntity = await GetAsync(id);
        var recipeDto = mapper.Map<RecipeDtoUser>(recipeEntity);

        return recipeDto;
    }

    public async Task<Recipe?> GetAsync(int id)
    {
        var recipeEntity = await dbContext.Recipes.Include(x => x.GroupNavigation).Include(x => x.NationalCuisineNavigation).Include(x => x.OwnerNavigation).Include(x => x.Mealtimes).Include(x => x.RecipeIngredients).ThenInclude(x => x.IngredientNavigation).Include(x => x.RecipeInstructions).FirstOrDefaultAsync(x => x.Id == id);

        return recipeEntity;
    }
}


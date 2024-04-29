using Recipes_API.DATA;
using Recipes_API.Models;

namespace Recipes_API.Repositories;

public class RecipeIngredientsRepository
{
    private readonly RecipesSiteDbContext dbContext;
    public RecipeIngredientsRepository(RecipesSiteDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task AddIngredientToRecipeAsync(int recipeId, int ingredientId, int amount)
    {
        await dbContext.RecipeIngredients.AddAsync(new RecipeIngredient()
        {
            Recipe = recipeId,
            Ingredient = ingredientId,
            Amount = amount
        });

        await dbContext.SaveChangesAsync();
    }
    public List<RecipeIngredient> GetIngredientsFromRecipe(int recipeId)
    {
       return dbContext.RecipeIngredients.Where(x => x.Recipe == recipeId).ToList();
    }
}

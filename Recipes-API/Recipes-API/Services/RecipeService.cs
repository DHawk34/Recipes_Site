using Microsoft.EntityFrameworkCore;
using Recipes_API.DATA;
using Recipes_API.Models;
using Recipes_API.Models.CustomModels;
using Recipes_API.Repositories;
using System.Linq;
using System.Linq.Expressions;

namespace Recipes_API.Services;

public class RecipeService
{
    private readonly IngredientsRepository ingridientsRepo;
    private readonly NationalCuisineRepository nationalCuisineRepo;
    private readonly RecipeRepository recipeRepo;
    private readonly RecipeIngredientsRepository recipeIngredientsRepo;
    private readonly RecipeInstructionRepository recipeInstructionRepo;
    private readonly ImagesRepository imagesRepo;
    private readonly RecipesSiteDbContext dbContext;

    public RecipeService(IngredientsRepository ingridientsRepository, RecipesSiteDbContext dbContext, NationalCuisineRepository nationalCuisineRepo, RecipeRepository recipeRepo, RecipeIngredientsRepository recipeIngredientsRepo, RecipeInstructionRepository recipeInstructionRepo, ImagesRepository imagesRepo)
    {
        this.ingridientsRepo = ingridientsRepository;
        this.dbContext = dbContext;
        this.nationalCuisineRepo = nationalCuisineRepo;
        this.recipeRepo = recipeRepo;
        this.recipeIngredientsRepo = recipeIngredientsRepo;
        this.recipeInstructionRepo = recipeInstructionRepo;
        this.imagesRepo = imagesRepo;
    }

    public async Task<long> AddNewRecipeAsync(CustomRecipe recipe)
    {
        long? national_cuisine = null;

        using var transaction = await dbContext.Database.BeginTransactionAsync();

        if (recipe.nationalCuisine != null)
            national_cuisine = await nationalCuisineRepo.GetIdOrAddAsync(recipe.nationalCuisine);

        var finishDishImageId = await imagesRepo.AddImageAsync(recipe.finishDishImage.data, recipe.finishDishImage.contentType);
        var recipeId = await recipeRepo.AddNewRecipeAsync(finishDishImageId, recipe.name, recipe.group, national_cuisine, recipe.cookTime, recipe.portionCount, recipe.difficult, recipe.hot, recipe.creation_time);

        foreach (var ingridient in recipe.ingredients)
        {
            await recipeIngredientsRepo.AddIngredientToRecipeAsync(recipeId, await ingridientsRepo.GetIdOrAddAsync(ingridient.name), ingridient.amount);
        }

        for (int i = 0; i < recipe.instruction.Length; i++)
        {
            var instructionStep = recipe.instruction[i];
            var imageId = await imagesRepo.AddImageAsync(instructionStep.image.data, instructionStep.image.contentType);
            await recipeInstructionRepo.AddInstructionStepToRecipeAsync(recipeId, i + 1, imageId, instructionStep.instruction);
        }

        await transaction.CommitAsync();
        return recipeId;
    }

    public async Task<List<Recipe>> SearchRecipesAsync(string? name, long[]? a_ingr, long[]? r_ingr, long? n_cuisine, long? group, long? time, long? difficult, long? hot)
    {
        (int hours, int minutes) getTime(string x)
        {
            var time = x.Split(':');
            var hours = int.Parse(time[0]);
            var minutes = int.Parse(time[1]);

            return (hours, minutes);
        }

        IQueryable<Recipe> query = dbContext.Recipes.Include(x => x.GroupNavigation).Include(x => x.NationalCuisineNavigation).Include(x => x.RecipeIngredients).ThenInclude(x => x.IngredientNavigation.RecipeIngredients);

        if (name != null)
            query = query.Where(x => x.Name.Contains(name));

        if (n_cuisine != null)
            query = query.Where(x => x.NationalCuisine == n_cuisine);

        if (group != null)
            query = query.Where(x => x.Group == group);

        if(difficult != null)
        {
            switch (difficult)
            {
                case 0:
                    query = query.Where(x => x.Difficult > 0  && x.Difficult < 3);
                    break;
                case 1:
                    query = query.Where(x => x.Difficult > 2 && x.Difficult < 5);
                    break;
                case 2:
                    query = query.Where(x => x.Difficult == 5);
                    break;
                default:
                    break;
            }
        }

        if (hot != null)
        {
            switch (hot)
            {
                case 0:
                    query = query.Where(x => x.Hot == 0);
                    break;
                case 1:
                    query = query.Where(x => x.Hot > 0 && x.Hot < 3);
                    break;
                case 2:
                    query = query.Where(x => x.Hot > 2 && x.Hot < 5);
                    break;
                case 3:
                    query = query.Where(x => x.Hot == 5);
                    break;
                default:
                    break;
            }
        }

        IEnumerable<Recipe> finalQuery = await query.ToListAsync();

        if (time != null)
        {
            (int hours, int minutes) timeW = getTime("0:0");

            switch (time)
            {
                case 0:
                    finalQuery = finalQuery.Where(x => (timeW = getTime(x.CookTime)).minutes <= 30 && timeW.hours == 0);
                    break;
                case 1:
                    finalQuery = finalQuery.Where(x => (timeW = getTime(x.CookTime)).hours < 1);
                    break;
                case 2:
                    finalQuery = finalQuery.Where(x => (timeW = getTime(x.CookTime)).hours < 2);
                    break;
                case 3:
                    finalQuery = finalQuery.Where(x => (timeW = getTime(x.CookTime)).hours >= 2);
                    break;
                default: break;
            }
        }

        if (a_ingr != null)
        {
            finalQuery = finalQuery.Where(x => a_ingr.All(y => x.RecipeIngredients.Select(z => z.Ingredient).Contains(y)));
        }

        if (r_ingr != null)
        {
            finalQuery = finalQuery.Where(x => x.RecipeIngredients.All(y => !r_ingr.Contains(y.Ingredient)));
        }

        return finalQuery.ToList();
    }
}
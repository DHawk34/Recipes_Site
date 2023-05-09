using Microsoft.EntityFrameworkCore;
using Recipes_API.DATA;
using Recipes_API.Models;
using Recipes_API.Models.CustomModels;
using Recipes_API.Repositories;

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
}


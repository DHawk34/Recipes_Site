using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Recipes_API.DATA;
using Recipes_API.Extensions;
using Recipes_API.Models;
using Recipes_API.Models.CustomModels;
using Recipes_API.Repositories;
using System.ComponentModel;
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
    private readonly RecipeSiteContext dbContext;
    private readonly UsersRepository usersRepo;

    public RecipeService(IngredientsRepository ingridientsRepository, RecipeSiteContext dbContext, NationalCuisineRepository nationalCuisineRepo, RecipeRepository recipeRepo, RecipeIngredientsRepository recipeIngredientsRepo, RecipeInstructionRepository recipeInstructionRepo, ImagesRepository imagesRepo, UsersRepository usersRepository)
    {
        this.ingridientsRepo = ingridientsRepository;
        this.dbContext = dbContext;
        this.nationalCuisineRepo = nationalCuisineRepo;
        this.recipeRepo = recipeRepo;
        this.recipeIngredientsRepo = recipeIngredientsRepo;
        this.recipeInstructionRepo = recipeInstructionRepo;
        this.imagesRepo = imagesRepo;
        this.usersRepo = usersRepository;
    }

    public async Task<IResult> AddNewRecipeAsync(CustomRecipe recipe, HttpContext context)
    {
        int? national_cuisine = null;

        var userTokenInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);

        if (userTokenInfo == null)
            return Results.Unauthorized();

        using var transaction = await dbContext.Database.BeginTransactionAsync(); //начало транзакции SQL

        if (recipe.nationalCuisine != null)
            national_cuisine = await nationalCuisineRepo.GetIdOrAddAsync(recipe.nationalCuisine); //добавление национальной кухни в БД

        var finishDishImageId = await imagesRepo.AddImageAsync(recipe.finishDishImage.data, recipe.finishDishImage.contentType); //добавление картинки в БД
        var user = await usersRepo.GetUserByPublicIdAsync(userTokenInfo.PublicID);

        if (user == null)
            return Results.BadRequest();

        var recipeId = await recipeRepo.AddNewRecipeAsync(finishDishImageId, recipe.name, recipe.group, recipe.mealtime, national_cuisine, recipe.cookTime, recipe.portionCount, recipe.difficult, recipe.hot, user.Id, recipe.creation_time); //добавление рецепта в БД

        foreach (var ingridient in recipe.ingredients)
        {
            await recipeIngredientsRepo.AddIngredientToRecipeAsync(recipeId, await ingridientsRepo.GetIdOrAddAsync(ingridient.name), ingridient.amount); //добавление ингредиентов в БД
        }

        for (int i = 0; i < recipe.instruction.Length; i++)
        {
            var instructionStep = recipe.instruction[i];
            var imageId = await imagesRepo.AddImageAsync(instructionStep.image.data, instructionStep.image.contentType); //добавление картинок в БД
            await recipeInstructionRepo.AddInstructionStepToRecipeAsync(recipeId, i + 1, imageId, instructionStep.instruction); //добавление инструкции в БД
        }

        await transaction.CommitAsync(); //завершение транзакции SQL
        return Results.Ok(recipeId);
    }

    public async Task<IResult> EditRecipeAsync(int id, CustomRecipe recipe, HttpContext context)
    {
        var recipeDb = await dbContext.Recipes.Include(x => x.Mealtimes).FirstOrDefaultAsync(x => x.Id == id);

        if (recipeDb == null)
            return Results.BadRequest();

        var userTokenInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);

        if (userTokenInfo == null)
            return Results.Unauthorized();

        var user = await usersRepo.GetUserByPublicIdAsync(userTokenInfo.PublicID);

        if (user == null || recipeDb.Owner != user.Id | !user.Admin)
            return Results.BadRequest();

        using var transaction = await dbContext.Database.BeginTransactionAsync(); //начало транзакции SQL

        var instructions = dbContext.RecipeInstructions.Where(x => x.Recipe == id);
        List<long> imageIds = new(instructions.Count());
        foreach (var inst in instructions)
        {
            imageIds.Add(inst.InstructionImage);
        }

        var images = dbContext.Images.Where(x => imageIds.Contains(x.Id));

        var recipeIngr = dbContext.RecipeIngredients.Where(x => x.Recipe == id);

        dbContext.RecipeIngredients.RemoveRange(recipeIngr);
        dbContext.RecipeInstructions.RemoveRange(instructions);
        dbContext.Images.RemoveRange(images);

        var a = recipe.mealtime;

        recipeDb.Name = recipe.name;
        recipeDb.Difficult = recipe.difficult;
        recipeDb.CookTime = recipe.cookTime;
        recipeDb.Hot = recipe.hot;
        recipeDb.Group = recipe.group;
        recipeDb.Mealtimes = dbContext.Mealtimes.Where(x => recipe.mealtime.Contains(x.Id)).ToList();
        recipeDb.NationalCuisine = await nationalCuisineRepo.GetIdOrAddAsync(recipe.nationalCuisine);
        recipeDb.PortionCount = recipe.portionCount;

        await dbContext.SaveChangesAsync();

        await imagesRepo.EditImageAsync(recipeDb.FinishImage, recipe.finishDishImage.data, recipe.finishDishImage.contentType);

        foreach (var ingridient in recipe.ingredients)
        {
            await recipeIngredientsRepo.AddIngredientToRecipeAsync(recipeDb.Id, await ingridientsRepo.GetIdOrAddAsync(ingridient.name), ingridient.amount); //добавление ингредиентов в БД
        }

        for (int i = 0; i < recipe.instruction.Length; i++)
        {
            var instructionStep = recipe.instruction[i];
            var imageId = await imagesRepo.AddImageAsync(instructionStep.image.data, instructionStep.image.contentType); //добавление картинок в БД
            await recipeInstructionRepo.AddInstructionStepToRecipeAsync(recipeDb.Id, i + 1, imageId, instructionStep.instruction); //добавление инструкции в БД
        }

        await transaction.CommitAsync(); //завершение транзакции SQL
        return Results.Ok(recipeDb.Id);
    }

    public async Task<IResult> VerifyAsync(int id, HttpContext context)
    {
        var recipe = await dbContext.Recipes.FindAsync(id);
        if (recipe == null)
            return Results.BadRequest();

        var userTokenInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);

        if (userTokenInfo == null)
            return Results.Unauthorized();

        var user = await usersRepo.GetUserByPublicIdAsync(userTokenInfo.PublicID);

        if (user == null || !user.Admin)
            return Results.Unauthorized();

        recipe.Verified = true;

        var count = await dbContext.SaveChangesAsync();

        return Results.Ok(count > 0 ? "success" : "error");
    }

    public async Task<IResult> DeleteAsync(int id, HttpContext context)
    {
        var recipe = await dbContext.Recipes.FindAsync(id);
        if (recipe == null)
            return Results.BadRequest();

        var userTokenInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);

        if (userTokenInfo == null)
            return Results.Unauthorized();

        var user = await usersRepo.GetUserByPublicIdAsync(userTokenInfo.PublicID);

        if (user == null || recipe.Owner != user.Id | !user.Admin)
            return Results.BadRequest();

        var instructions = await dbContext.RecipeInstructions.Where(x => x.Recipe == id).ToArrayAsync();
        List<long> imageIds = new(instructions.Length + 1);
        foreach (var inst in instructions)
        {
            imageIds.Add(inst.InstructionImage);
        }
        imageIds.Add(recipe.FinishImage);

        var images = dbContext.Images.Where(x => imageIds.Contains(x.Id));

        dbContext.RecipeInstructions.RemoveRange(instructions);
        dbContext.Recipes.Remove(recipe);
        dbContext.Images.RemoveRange(images);

        var count = await dbContext.SaveChangesAsync();
        return Results.Ok(count > 0 ? "success" : "error");
    }

    public async Task<RecipeDtoUser?> GetAsync(int id, HttpContext context, AuthService authService)
    {
        var recipeDto = await recipeRepo.GetDtoAsync(id);

        var userTokenInfo = await authService.TryGetUserInfoFromHttpContextWithValidationAsync(context);

        if (userTokenInfo == null)
            return recipeDto;

        var user = await usersRepo.GetUserByPublicIdAsync(userTokenInfo.PublicID);

        if (recipeDto != null)
        {
            recipeDto.IsOwner = userTokenInfo.PublicID == recipeDto.OwnerNavigation.PublicId | user.Admin;
            recipeDto.IsFavorite = user.FavoriteRecipes.Any(x => x.Id == recipeDto.Id);
            recipeDto.IsAdmin = user.Admin;
        }

        return recipeDto;
    }

    public async Task<List<Recipe>> SearchRecipesAsync(bool isAdmin, string? name, int[]? a_ingr, int[]? r_ingr, int? n_cuisine, int? group, int? meal_t, long? time, int? difficult, int? hot, int? verification, string? userPublicId, int? count, int? page, List<Recipe>? recipeSource = null)
    {

        (int hours, int minutes) getTime(string x)
        {
            var time = x.Split(':');
            var hours = int.Parse(time[0]);
            var minutes = int.Parse(time[1]);

            return (hours, minutes);
        }


        IQueryable<Recipe> query = dbContext.Recipes.Include(x => x.GroupNavigation).Include(x => x.NationalCuisineNavigation).Include(x => x.RecipeIngredients).ThenInclude(x => x.IngredientNavigation.RecipeIngredients);

        if (recipeSource != null)
            query = query.Where(x => recipeSource.Contains(x));

        if (name != null)
            query = query.Where(x => x.Name.ToLower().Contains(name.ToLower()));

        if (n_cuisine != null)
            query = query.Where(x => x.NationalCuisine == n_cuisine);

        if (group != null)
            query = query.Where(x => x.Group == group);

        if (meal_t != null)
            query = query.Where(x => x.Mealtimes.Any(y => y.Id == meal_t));

        if (userPublicId != null)
            query = query.Where(x => x.OwnerNavigation != null ? x.OwnerNavigation.PublicId == Guid.Parse(userPublicId) : x.Owner == -1);

        if (isAdmin && verification != null)
            switch (verification)
            {
                case 0:
                    query = query.Where(x => x.Verified == true);
                    break;
                case 1:
                    query = query.Where(x => x.Verified == false);
                    break;
                default:
                    break;
            }

        if (!isAdmin)
            query = query.Where(x => x.Verified == true);

        if (difficult != null)
        {
            switch (difficult)
            {
                case 0:
                    query = query.Where(x => x.Difficult > 0 && x.Difficult < 3);
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

        if (count != null)
        {
            if (page != null)
            {
                finalQuery = finalQuery.Skip((int)((page - 1) * count));
            }

            finalQuery = finalQuery.Take((int)count);
        }

        return finalQuery.ToList();
    }
}
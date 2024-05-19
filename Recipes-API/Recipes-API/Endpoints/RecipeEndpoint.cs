using Microsoft.AspNetCore.Authorization;
using Recipes_API.Configuration;
using Recipes_API.Models;
using Recipes_API.Models.CustomModels;
using Recipes_API.Repositories;
using Recipes_API.Services;

namespace Recipes_API.Endpoints;

public static class RecipeEndpoint
{
    public static void MapRecipeEndpoints(this WebApplication app)
    {

        app.MapPost("/recipe/add", AddNewRecipeAsync)
            .RequireAuthorization()
            .Produces<int>();

        app.MapGet("/recipe/all", GetAllAsync)
            .Produces<List<Recipe>>();

        app.MapGet("/recipe", GetAsync)
            .Produces<RecipeDtoUser>();

        app.MapDelete("/recipe/delete", DeleteAsync)
            .RequireAuthorization()
            .Produces<string>();

        app.MapPut("/recipe/update", EditRecipeAsync)
            .RequireAuthorization()
            .Produces<int>();

        app.MapGet("/recipe/search", SearchRecipesAsync)
            .Produces<List<Recipe>>();

        app.MapGet("/recipe/search/favorite", SearchFavoriteRecipesAsync)
            .RequireAuthorization()
            .Produces<List<Recipe>>();
    }

    internal static async Task<IResult> AddNewRecipeAsync(CustomRecipe recipe, HttpContext context, RecipeService recipeService)
    {
        return await recipeService.AddNewRecipeAsync(recipe, context);
    }

    internal static async Task<IResult> GetAllAsync(RecipeRepository repo)
    {
        return Results.Ok(await repo.GetAllAsync());
    }

    internal static async Task<IResult> GetAsync(int id, HttpContext context, UsersRepository usersRepository, AuthService authService, RecipeService repo)
    {
        return Results.Ok(await repo.GetAsync(id, context, usersRepository, authService));
    }

    internal static async Task<IResult> DeleteAsync(int id, HttpContext context, RecipeService repo)
    {
        return await repo.DeleteAsync(id, context);
    }

    internal static async Task<IResult> EditRecipeAsync(CustomRecipe recipe, int id, HttpContext context, RecipeService recipeService)
    {
        return await recipeService.EditRecipeAsync(id, recipe, context);
    }

    internal static async Task<IResult> SearchRecipesAsync(string? name, int[]? a_ingr, int[]? r_ingr, int? n_cuisine, int? group, int? meal_t, long? time, int? difficult, int? hot, int[]? r_ids, int? page, int? count, RecipeService repo)
    {
        return Results.Ok(await repo.SearchRecipesAsync(name, a_ingr, r_ingr, n_cuisine, group, meal_t, time, difficult, hot, count, page));
    }

    internal static async Task<IResult> SearchFavoriteRecipesAsync(HttpContext context, UsersRepository usersRepository, string? name, int[]? a_ingr, int[]? r_ingr, int? n_cuisine, int? group, int? meal_t, long? time, int? difficult, int? hot, int[]? r_ids, int? page, int? count, RecipeService repo)
    {
        var userTokenInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);
        if (userTokenInfo == null)
            return Results.Unauthorized();

        var user = await usersRepository.GetUserByPublicIdAsync(userTokenInfo.PublicID);
        if (user == null)
            return Results.BadRequest();

        var favoriteList = user.FavoriteRecipes.ToList();

        if(favoriteList.Count == 0)
        {
            favoriteList.Add(new Recipe() { Id = -1});
        }

        return Results.Ok(await repo.SearchRecipesAsync(name, a_ingr, r_ingr, n_cuisine, group, meal_t, time, difficult, hot, count, page, favoriteList));
    }
}
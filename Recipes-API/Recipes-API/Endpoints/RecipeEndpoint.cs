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

        app.MapPut("/recipe/verify", VerifyAsync)
            .RequireAuthorization()
            .Produces<string>();

        app.MapPut("/recipe/update", EditRecipeAsync)
            .RequireAuthorization()
            .Produces<int>();

        app.MapGet("/recipe/search", SearchRecipesAsync)
            .Produces<SearchResultDto>();

        app.MapGet("/recipe/search/favorite", SearchFavoriteRecipesAsync)
            .RequireAuthorization()
            .Produces<SearchResultDto>();
    }

    internal static async Task<IResult> AddNewRecipeAsync(CustomRecipe recipe, HttpContext context, RecipeService recipeService)
    {
        return await recipeService.AddNewRecipeAsync(recipe, context);
    }

    internal static async Task<IResult> GetAllAsync(RecipeRepository repo)
    {
        return Results.Ok(await repo.GetAllAsync());
    }

    internal static async Task<IResult> GetAsync(int id, HttpContext context, AuthService authService, RecipeService repo)
    {
        return Results.Ok(await repo.GetAsync(id, context, authService));
    }

    internal static async Task<IResult> DeleteAsync(int id, HttpContext context, RecipeService repo)
    {
        return await repo.DeleteAsync(id, context);
    }

    internal static async Task<IResult> VerifyAsync(int id, HttpContext context, RecipeService repo)
    {
        return await repo.VerifyAsync(id, context);
    }

    internal static async Task<IResult> EditRecipeAsync(CustomRecipe recipe, int id, HttpContext context, RecipeService recipeService)
    {
        return await recipeService.EditRecipeAsync(id, recipe, context);
    }

    internal static async Task<IResult> SearchRecipesAsync(HttpContext context, AuthService authService, UsersRepository usersRepository, string? name, int[]? a_ingr, int[]? r_ingr, int? n_cuisine, int? group, int? meal_t, long? time, int? difficult, int? hot, int? verification, int[]? r_ids, string? user, int? page, int? count, RecipeService repo)
    {
        bool isAdmin = false;
        var userTokenInfo = await authService.TryGetUserInfoFromHttpContextWithValidationAsync(context);

        if (userTokenInfo != null)
        {
            var userObj = await usersRepository.GetUserByPublicIdAsync(userTokenInfo.PublicID);
            if (userObj != null)
                isAdmin = userObj.Admin;
        }

        var recipes = await repo.SearchRecipesAsync(isAdmin, name, a_ingr, r_ingr, n_cuisine, group, meal_t, time, difficult, hot, verification, user, count, page);
        SearchResultDto searchResultDto = new() { IsAdmin = isAdmin, Recipes = recipes };
        return Results.Ok(searchResultDto);
    }

    internal static async Task<IResult> SearchFavoriteRecipesAsync(HttpContext context, AuthService authService, UsersRepository usersRepository, string? name, int[]? a_ingr, int[]? r_ingr, int? n_cuisine, int? group, int? meal_t, long? time, int? difficult, int? hot, int? verification, int[]? r_ids, string? user, int? page, int? count, RecipeService repo)
    {
        var userTokenInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);
        if (userTokenInfo == null)
            return Results.Unauthorized();

        var userEntity = await usersRepository.GetUserByPublicIdAsync(userTokenInfo.PublicID);
        if (userEntity == null)
            return Results.BadRequest();

        var favoriteList = userEntity.FavoriteRecipes.ToList();

        if (favoriteList.Count == 0)
        {
            favoriteList.Add(new Recipe() { Id = -1 });
        }

        var recipes = await repo.SearchRecipesAsync(false, name, a_ingr, r_ingr, n_cuisine, group, meal_t, time, difficult, hot, verification, user, count, page, favoriteList);
        SearchResultDto searchResultDto = new() { IsAdmin = false, Recipes = recipes };

        return Results.Ok(searchResultDto);
    }
}
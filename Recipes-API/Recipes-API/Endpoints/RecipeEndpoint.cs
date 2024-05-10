using Microsoft.AspNetCore.Authorization;
using Recipes_API.Models.CustomModels;
using Recipes_API.Repositories;
using Recipes_API.Services;

namespace Recipes_API.Endpoints;

public static class RecipeEndpoint
{
    ///TODO: Переделать как в Auth Endpoint
    public static void MapRecipeEndpoints(this WebApplication app)
    {
        app.MapGet("/ingredients", async (IngredientsRepository repo) =>
        {
            return await repo.GetAllAsync();
        });

        app.MapGet("/recipe-groups", async (RecipeGroupRepository repo) =>
        {
            return await repo.GetAllGroupsAsync();
        });

        app.MapGet("/cuisines", async (NationalCuisineRepository repo) =>
        {
            return await repo.GetAllAsync();
        });

        app.MapPost("/recipe/add", async (HttpRequest request, HttpContext context, CustomRecipe recipe, RecipeService recipeService) =>
        {
            return await recipeService.AddNewRecipeAsync(recipe);
        });

        app.MapGet("/recipe/all", async (RecipeRepository repo) =>
        {
            return await repo.GetAllAsync();
        }).AllowAnonymous();

        app.MapGet("/recipe", async (int id, RecipeRepository repo) =>
        {
            return await repo.GetAsync(id);
        });

        app.MapDelete("/recipe/delete", async (int id, RecipeService repo) =>
        {
            return await repo.DeleteAsync(id);
        });

        app.MapPut("/recipe/update", async (HttpRequest request, HttpContext context, CustomRecipe recipe, int id, RecipeService recipeService) =>
        {
            return await recipeService.EditRecipeAsync(id, recipe);
        });

        app.MapGet("/recipe/search", async (string? name, int[]? a_ingr, int[]? r_ingr, int? n_cuisine, int? group, long? time, int? difficult, int? hot, int[]? r_ids, RecipeService repo) =>
        {
            return await repo.SearchRecipesAsync(name, a_ingr, r_ingr, n_cuisine, group, time, difficult, hot, r_ids);
        });
    }
}
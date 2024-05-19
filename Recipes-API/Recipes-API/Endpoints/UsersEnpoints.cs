using Recipes_API.Configuration;
using Recipes_API.Models;
using Recipes_API.Models.CustomModels;
using Recipes_API.Repositories;
using Recipes_API.Services;
using System.Net;

namespace Recipes_API.Endpoints;

public static class UsersEndpoints
{
    public static void MapUsersEndpoints(this WebApplication app)
    {
        app.MapGet("/users", GetAllUsersAsync)
            .Produces<List<User>>();

        app.MapGet("/user", GetUserAsync)
            .RequireAuthorization()
            .Produces<UserDtoRecipe>();

        app.MapGet("/user/favorite", GetFavoriteRecipesAsync)
            .RequireAuthorization()
            .Produces<List<RecipeDtoBase>>();

        app.MapPost("/user/favorite/add", AddFavoriteAsync)
            .RequireAuthorization();

        app.MapDelete("/user/favorite/delete", RemoveFavoriteAsync)
            .RequireAuthorization();

        app.MapGet("/user/{userPublicID}", GetUserByPublicIDAsync)
            .Produces<UserDtoRecipe>();

        app.MapDelete("/user", DeleteUserAsync);
    }



    internal static async Task<IResult> GetAllUsersAsync(UsersRepository usersRepository)
    {
        return Results.Ok(await usersRepository.GetAllUsersAsync());
    }

    internal static async Task<IResult> GetUserAsync(HttpContext context, UsersRepository usersRepository)
    {
        var userInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);
        if (userInfo is null) return Results.Unauthorized();

        var user = await usersRepository.GetUserDtoByPublicIdAsync(userInfo.PublicID);

        return user != null
            ? Results.Ok(user)
            : Results.NotFound("User not found");
    }

    internal static async Task<IResult> GetUserByPublicIDAsync(UsersRepository usersRepository, string userPublicID)
    {
        var user = await usersRepository.GetUserDtoByPublicIdAsync(Guid.Parse(userPublicID));

        return user != null
            ? Results.Ok(user)
            : Results.NotFound("User not found");
    }

    internal static async Task<IResult> DeleteUserAsync(HttpContext context, UsersRepository usersRepository, AuthService auth)
    {
        var userInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);
        if (userInfo is null) return Results.Unauthorized();

        var user = await usersRepository.GetUserByPublicIdAsync(userInfo.PublicID);
        if (user is null)
            return Results.BadRequest("Could not delete. User not found");

        bool deleted = await usersRepository.DeleteAsync(user);
        if (deleted)
        {
            auth.DeleteTokenCookies(context.Response);
            return Results.Ok($"User `{user.Name}` was deleted");
        }

        return Results.BadRequest($"Could not delete user `{user.Name}`");
    }


    internal static async Task<IResult> AddFavoriteAsync(HttpContext context, UsersRepository usersRepository, RecipeRepository recipeRepository, int id)
    {
        var userTokenInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);
        if (userTokenInfo == null)
            return Results.Unauthorized();

        var user = await usersRepository.GetUserByPublicIdAsync(userTokenInfo.PublicID);
        if (user == null)
            return Results.BadRequest();

        var recipe = await recipeRepository.GetAsync(id);
        if (recipe == null)
            return Results.BadRequest();

        return await usersRepository.AddFavoriteAsync(user, recipe);
    }

    internal static async Task<IResult> RemoveFavoriteAsync(HttpContext context, UsersRepository usersRepository, RecipeRepository recipeRepository, int id)
    {
        var userTokenInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);
        if (userTokenInfo == null)
            return Results.Unauthorized();

        var user = await usersRepository.GetUserByPublicIdAsync(userTokenInfo.PublicID);
        if (user == null)
            return Results.BadRequest();

        var recipe = await recipeRepository.GetAsync(id);
        if (recipe == null)
            return Results.BadRequest();

        return await usersRepository.RemoveFavoriteAsync(user, recipe);
    }

    internal static async Task<IResult> GetFavoriteRecipesAsync(HttpContext context, UsersRepository usersRepository)
    {
        var userTokenInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);
        if (userTokenInfo == null)
            return Results.Unauthorized();

        var user = await usersRepository.GetUserByPublicIdAsync(userTokenInfo.PublicID);
        if (user == null)
            return Results.BadRequest();

        var mapper = AutoMapperConfig.RecipeToRecipeDTO.CreateMapper();

        var favoriteList = user.FavoriteRecipes.ToList();
        var favoriteListDto = mapper.Map<List<RecipeDtoBase>>(favoriteList);

        return Results.Ok(favoriteListDto);
    }
}
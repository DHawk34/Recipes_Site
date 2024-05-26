using Microsoft.AspNetCore.Mvc;
using Recipes_API.Models.CustomModels;
using Recipes_API.Repositories;
using Recipes_API.Services;

namespace Recipes_API.Endpoints;

public static class UserMenuEndpoint
{
    public static void MapUserMenuEndpoints(this WebApplication app)
    {
        app.MapGet("/usermenu", GetUserMenuAsync)
            .RequireAuthorization()
            .Produces<UserMenuDto>();

        app.MapPost("/usermenu/generate", GenerateUserMenuAsync)
            .RequireAuthorization()
            .Produces<UserMenuDto>();
    }

    internal static async Task<IResult> GetUserMenuAsync(HttpContext context, UserMenuRepository userMenuRepository)
    {
        var userTokenInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);
        if (userTokenInfo == null)
            return Results.Unauthorized();

        return Results.Ok(await userMenuRepository.GetMenuDtoByUserIdAsync(userTokenInfo.PublicID));
    }

    internal static async Task<IResult> GenerateUserMenuAsync(HttpContext context, UserMenuRepository userMenuRepository, int n_cuisine)
    {
        var userTokenInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);
        if (userTokenInfo == null)
            return Results.Unauthorized();

        return Results.Ok(await userMenuRepository.GenerateMenuToUser(userTokenInfo.PublicID, n_cuisine));
    }
}

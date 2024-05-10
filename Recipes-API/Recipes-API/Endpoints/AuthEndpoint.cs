using Recipes_API.Extensions;
using Recipes_API.Models.CustomModels;
using Recipes_API.Models;
using Recipes_API.Repositories;
using Recipes_API.Services;
using Recipes_API.Errors;

namespace Recipes_API.Endpoints
{
    public static class AuthEndpoint
    {
        ///TODO:Валидация

        public const string AUTH_PATH = "/auth";
        public const string REFRESH_TOKEN_PATH = AUTH_PATH + "/refresh";

        public static void MapAuthEndpoints(this WebApplication app)
        {
            // register & login & refresh
            app.MapPost(AUTH_PATH + "/register", RegisterAsync);
            //.AddEndpointFilter<ValidationFilter<UserRegisterDto>>()

            app.MapPost(AUTH_PATH + "/login", LoginAsync);
            //.AddEndpointFilter<ValidationFilter<UserLoginDto>>()

            app.MapPost(REFRESH_TOKEN_PATH, RefreshTokenAsync);

            // logout
            app.MapPost(AUTH_PATH + "/logout", LogoutAsync).RequireAuthorization();
            app.MapPost(AUTH_PATH + "/logout-from-all-devices", LogoutFromAllDevicesAsync).RequireAuthorization();
            app.MapPost(AUTH_PATH + "/logout-from-another-devices", LogoutFromAnotherDevicesAsync).RequireAuthorization();

            // other
            app.MapGet(AUTH_PATH + "/isAuthorized", IsAuthorized).RequireAuthorization();
            app.MapGet(AUTH_PATH + "/deviceCount", GetLoginDeviceCountAsync).RequireAuthorization();
        }

        internal static IResult IsAuthorized() => Results.Ok();

        internal static async Task<IResult> RegisterAsync(HttpContext context, AuthMapService auth, UserRegisterDto userDto)
        {
            return await auth.RegisterAsync(context, userDto);
        }

        internal static async Task<IResult> LoginAsync(HttpContext context, AuthMapService auth, UserLoginDto userDto)
        {
            return await auth.LoginAsync(context, userDto);
        }

        internal static async Task<IResult> RefreshTokenAsync(HttpContext context, AuthMapService auth)
        {
            return await auth.RefreshTokenAsync(context);
        }

        internal static async Task<IResult> GetLoginDeviceCountAsync(HttpContext context, AuthMapService auth)
        {
            return await auth.GetLoginDeviceCountAsync(context);
        }

        internal static async Task<IResult> LogoutAsync(HttpContext context, AuthMapService auth)
        {
            return await auth.LogoutAsync(context);
        }

        internal static async Task<IResult> LogoutFromAllDevicesAsync(HttpContext context, AuthMapService auth)
        {
            return await auth.LogoutFromAllDevicesAsync(context);
        }

        internal static async Task<IResult> LogoutFromAnotherDevicesAsync(HttpContext context, AuthMapService auth)
        {
            return await auth.LogoutFromAnotherDevicesAsync(context);
        }
    }
}
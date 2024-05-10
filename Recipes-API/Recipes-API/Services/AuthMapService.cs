using Recipes_API.Errors;
using Recipes_API.Extensions;
using Recipes_API.Models.CustomModels;
using Recipes_API.Models;
using Recipes_API.Repositories;
using Recipes_API.DATA;

namespace Recipes_API.Services;

public class AuthMapService
{
    private readonly UsersRepository usersRepository;
    private readonly AuthService authService;
    private readonly UserRefreshTokenRepository userRefreshTokenRepository;
    private readonly RecipeSiteContext dbContext;

    public AuthMapService(UsersRepository usersRepository, AuthService authService, RecipeSiteContext dbContext, UserRefreshTokenRepository userRefreshTokenRepository)
    {
        this.usersRepository = usersRepository;
        this.authService = authService;
        this.dbContext = dbContext;
        this.userRefreshTokenRepository = userRefreshTokenRepository;
    }

    public async Task<IResult> RegisterAsync(HttpContext context, UserRegisterDto userDto)
    {
        if (await usersRepository.GetUserByLoginAsync(userDto.Login) is not null)
            return AuthErrors.UserAlreadyExists(userDto.Login);

        authService.CreatePasswordHash(userDto.Password, out var passwordHash, out var passwordSalt);
        var user = new User
        {
            Login = userDto.Login,
            Name = userDto.Name,
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt
        };

        if (!await usersRepository.AddNewUserAsync(user))
            return UserErrors.CouldNotCreate(userDto.Login);

        if (!await authService.AddNewTokenPairToResponseCookies(context, user))
            return AuthErrors.CouldNotCreateTokenPair();

        return Results.Created($"/users/{user.Login}", user);
    }

    public async Task<IResult> LoginAsync(HttpContext context, UserLoginDto userDto)
    {
        var user = await usersRepository.GetUserByLoginAsync(userDto.Login);

        if (user is null || !authService.VerifyPasswordHash(userDto.Password, user.PasswordHash, user.PasswordSalt))
            return Results.NotFound("Invalid login or password");

        if (!await authService.AddNewTokenPairToResponseCookies(context, user))
            return Results.Problem("Could not add new token pair to cookies");

        return Results.Ok();
    }

    public async Task<IResult> RefreshTokenAsync(HttpContext context)
    {
        var providedAccessToken_str = context.Request.GetAccessTokenCookie();
        var providedAccessToken = await authService.ValidateAccessTokenAsync_DontCheckExpireDate(providedAccessToken_str);
        if (providedAccessToken is null) return Results.Unauthorized();

        var userTokenInfo = AuthService.GetUserInfoFromAccessToken(providedAccessToken);

        var providedRefreshToken = context.Request.GetRefreshTokenCookie();
        if (providedRefreshToken is null)
            return Results.BadRequest("Provided Refresh Token is null");

        var deviceID = context.Request.GetDeviceIdCookie();
        if (deviceID is null)
            return Results.BadRequest("Provided Device Guid is null");

        var deviceGuid = Guid.Parse(deviceID);



        // Get user's active refresh token
        var activeUserRefreshToken = await authService.GetUserRefreshTokenAsync(userTokenInfo.PublicID, deviceGuid);
        if (activeUserRefreshToken is null)
            return Results.BadRequest("This user does not have a Refresh Token for provided Device Guid");

        if (!RefreshToken.VerifyTokenHash(providedRefreshToken, activeUserRefreshToken.TokenHash))
        {
            // Something fishy is going on here
            // Database contains another refreshToken for provided user-deviceID pair, so someone is probably trying to fool me

            await authService.LogoutFromAllDevices(userTokenInfo.PublicID);
            return Results.BadRequest("Invalid refresh token. Suspicious activity detected");
        }

        if (activeUserRefreshToken.ExpiresDate < DateTime.UtcNow)
            return Results.BadRequest("Refresh Token expired");

        var refreshToken = await authService.UpdateUserRefreshTokenAsync(activeUserRefreshToken);
        if (refreshToken is null)
            return Results.Problem("Can not update refresh token");

        var accessToken = authService.CreateAccessToken(userTokenInfo.PublicID);
        authService.AddTokenCookiesToResponse(context.Response, deviceID, accessToken, refreshToken);

        return Results.Ok();
    }

    public async Task<IResult> LogoutAsync(HttpContext context)
    {
        var userTokenInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);
        if (userTokenInfo is null) return Results.Unauthorized();

        var deviceID = context.Request.GetDeviceIdCookie();
        if (deviceID is null) return Results.BadRequest("Provided Device Guid is null");

        if (!await authService.LogoutFromDevice(userTokenInfo.PublicID, Guid.Parse(deviceID)))
            return Results.Problem("Could not logout from this device");

        authService.DeleteTokenCookies(context.Response);
        return Results.Ok();
    }

    public async Task<IResult> LogoutFromAllDevicesAsync(HttpContext context)
    {
        var userInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);
        if (userInfo is null) return Results.Unauthorized();

        if (!await authService.LogoutFromAllDevices(userInfo.PublicID))
            return Results.Problem("Could not logout from all devices");

        authService.DeleteTokenCookies(context.Response);
        return Results.Ok();
    }

    public async Task<IResult> LogoutFromAnotherDevicesAsync(HttpContext context)
    {
        var userInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);
        if (userInfo is null) return Results.Unauthorized();

        var deviceID = context.Request.GetDeviceIdCookie();
        if (deviceID is null) return Results.BadRequest("Provided Device Guid is null");

        if (!await authService.LogoutFromAllDevices_ExceptOne(userInfo.PublicID, Guid.Parse(deviceID)))
            return Results.Problem("Could not logout from all devices except this one");

        return Results.Ok();
    }

    public async Task<IResult> GetLoginDeviceCountAsync(HttpContext context)
    {
        var userTokenInfo = await AuthService.TryGetUserInfoFromHttpContextAsync(context);
        if (userTokenInfo is null) return Results.Unauthorized();

        var deviceCount = await userRefreshTokenRepository.GetUserDeviceCount(userTokenInfo.PublicID);
        return Results.Ok(deviceCount);
    }
}

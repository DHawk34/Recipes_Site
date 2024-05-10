using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Recipes_API.Extensions;
using System.Text;

namespace Recipes_API.Configuration;

public static class AuthConfigurator
{
    public static void ConfigureAuthentication(this IServiceCollection services, IConfiguration config)
    {
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
        {
            options.TokenValidationParameters = GetJwtTokenValidationParameters(config);

            options.Events = new JwtBearerEvents()
            {
                OnMessageReceived = context =>
                {
                    context.Token = context.Request.GetAccessTokenCookie();
                    return Task.CompletedTask;
                }
            };
        });
    }

    public static TokenValidationParameters GetJwtTokenValidationParameters(IConfiguration config) => new()
    {
        ValidIssuer = config["Jwt:Issuer"],
        ValidAudience = config["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!)),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromSeconds(5),
        ValidateIssuerSigningKey = true,
    };



    public static void ConfigureAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization();
    }
}
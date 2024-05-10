namespace Recipes_API.Configuration;

public static class CorsConfigurator
{
    private const string CORS_POLICY_NAME = "CORSPolicy";

    public static void AddCORSPolicy(this IServiceCollection services, IConfiguration config)
    {
        services.AddCors(options =>
        {
            string[] origins = config.GetSection("CORSAllowedOrigins").Get<string[]>() ?? [];

            options.AddPolicy(CORS_POLICY_NAME,
                builder =>
                {
                    builder
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials()
                    .WithOrigins(origins);
                });
        });
    }

    public static void UseCORSPolicy(this WebApplication app)
    {
        app.UseCors(CORS_POLICY_NAME);
    }

}

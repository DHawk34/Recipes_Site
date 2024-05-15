using Microsoft.EntityFrameworkCore;
using Recipes_API.DATA;
using Recipes_API.Endpoints;
using Recipes_API.Models.CustomModels;
using Recipes_API.Repositories;
using Recipes_API.Services;
using FluentValidation;
using Recipes_API.Configuration;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.SwaggerGen;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<RecipeSiteContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddValidatorsFromAssemblyContaining<Program>();

//builder.Services.AddControllers().AddJsonOptions(x => x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddTransient<IngredientsRepository>();
builder.Services.AddTransient<RecipeRepository>();
builder.Services.AddTransient<NationalCuisineRepository>();
builder.Services.AddTransient<RecipeIngredientsRepository>();
builder.Services.AddTransient<RecipeInstructionRepository>();
builder.Services.AddTransient<ImagesRepository>();
builder.Services.AddTransient<RecipeGroupRepository>();
builder.Services.AddTransient<UserRefreshTokenRepository>();
builder.Services.AddTransient<UsersRepository>();
builder.Services.AddTransient<MealtimeRepository>();


builder.Services.AddTransient<RecipeService>();
builder.Services.AddTransient<AuthMapService>();

builder.Services.AddTransient<AuthService>();

builder.Services.ConfigureAuthentication(builder.Configuration);
builder.Services.ConfigureAuthorization();

builder.Services.AddCORSPolicy(builder.Configuration);

builder.Services.AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();


//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("CORSPolicy",
//        builder =>
//        {
//            builder
//            .AllowAnyOrigin()
//            .AllowAnyMethod()
//            .AllowAnyHeader();
//            //.WithOrigins("http://localhost:3000");
//        });
//});

var app = builder.Build();

app.UseCORSPolicy();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Redirect to swagger page
    app.Map("/", (HttpResponse response) =>
    {
        response.Redirect("/swagger");
    }).AllowAnonymous();
}


app.UseHttpsRedirection(); //Можно убрать
app.UseAuthentication();
app.UseAuthorization();
//app.UseSwagger();
//app.UseSwaggerUI();

//app.UseCors("CORSPolicy");

app.MapAuthEndpoints();
app.MapRecipeEndpoints();
app.MapUsersEndpoints();


app.MapGet("/image", async (int id, ImagesRepository imagesRepo) =>
{
    var content = await imagesRepo.GetImageAsync(id);
    if (!content.HasValue)
        return Results.NotFound();

    return Results.File(content.Value.data, contentType: content.Value.contentType);
});

app.MapGet("/mealtimes", async (MealtimeRepository repo) =>
{
    return await repo.GetAllAsync();
});

app.MapGet("/catalog/groups", async (RecipeRepository repo) =>
{
    return await repo.GetGroupsCatalogAsync();
});

app.MapGet("/catalog/cuisines", async (RecipeRepository repo) =>
{
    return await repo.GetNationalCuisineCatalogAsync();
});

app.MapGet("/catalog/news", async (int count, RecipeRepository repo) =>
{
    return await repo.GetNewsCatalogAsync(count);
});

app.Run();
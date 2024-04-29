using Microsoft.AspNetCore.Http.Metadata;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Recipes_API.DATA;
using Recipes_API.Models;
using Recipes_API.Models.CustomModels;
using Recipes_API.Repositories;
using Recipes_API.Services;
using System.Net;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<RecipesSiteDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

//builder.Services.AddControllers().AddJsonOptions(x => x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddTransient<IngredientsRepository>();
builder.Services.AddTransient<RecipeRepository>();
builder.Services.AddTransient<NationalCuisineRepository>();
builder.Services.AddTransient<RecipeIngredientsRepository>();
builder.Services.AddTransient<RecipeInstructionRepository>();
builder.Services.AddTransient<ImagesRepository>();
builder.Services.AddTransient<RecipeGroupRepository>();


builder.Services.AddTransient<RecipeService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CORSPolicy",
        builder =>
        {
            builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
            //.WithOrigins("http://localhost:3000");
        });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("CORSPolicy");

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

app.MapGet("/image", async (int id, ImagesRepository imagesRepo) =>
{
    var content = await imagesRepo.GetImageAsync(id);
    if (!content.HasValue)
        return Results.NotFound();

    return Results.File(content.Value.data, contentType: content.Value.contentType);
});

app.MapGet("/recipe/all", async (RecipeRepository repo) =>
{
    return await repo.GetAllAsync();
});

app.MapGet("/recipe", async (int id, RecipeRepository repo) =>
{
    return await repo.GetAsync(id);
});

app.MapDelete("/recipe/delete", async (int id, RecipeService repo) =>
{
    return await repo.DeleteAsync(id);
});

app.MapPut("/recipe/update", async (HttpRequest request, HttpContext context, CustomRecipe recipe, long id, RecipeService recipeService) =>
{
    return await recipeService.EditRecipeAsync(id, recipe);
});

app.MapGet("/recipe/search", async (string? name, int[]? a_ingr, int[]? r_ingr, int? n_cuisine, int? group, long? time, int? difficult, int? hot, int[]? r_ids, RecipeService repo) =>
{
    return await repo.SearchRecipesAsync(name, a_ingr, r_ingr, n_cuisine, group, time, difficult, hot, r_ids);
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
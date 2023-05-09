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
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
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
    //var a = files[0];
    //var b = recipe;
});

app.MapGet("/image", async (long id, ImagesRepository imagesRepo) =>
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

app.MapGet("/recipe", async (long id, RecipeRepository repo) =>
{
    return await repo.GetAsync(id);
});

app.Run();
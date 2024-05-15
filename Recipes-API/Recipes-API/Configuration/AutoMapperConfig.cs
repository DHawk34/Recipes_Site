using AutoMapper;
using Recipes_API.Models;
using Recipes_API.Models.CustomModels;

namespace Recipes_API.Configuration;

public static class AutoMapperConfig
{
    public static MapperConfiguration RecipeWithOwnerConfig = new MapperConfiguration(cfg => {
        cfg.CreateMap<Recipe, RecipeDtoUser>();
        cfg.CreateMap<User, UserDtoBase>();
    });

    public static MapperConfiguration UserWithRecipesConfig = new MapperConfiguration(cfg => {
        cfg.CreateMap<User, UserDtoRecipe>();
        cfg.CreateMap<Recipe, RecipeDtoBase>();
    });
}

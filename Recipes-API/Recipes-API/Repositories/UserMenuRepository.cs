using Microsoft.EntityFrameworkCore;
using Recipes_API.Configuration;
using Recipes_API.DATA;
using Recipes_API.Models;
using Recipes_API.Models.CustomModels;

namespace Recipes_API.Repositories;

public class UserMenuRepository
{
    private readonly RecipeSiteContext dbContext;
    public UserMenuRepository(RecipeSiteContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<UserMenuDto> GetMenuByUserIdAsync(int userID)
    {
        var userMenu = await dbContext.UserMenus.Include(x => x.RecipeNavigation).ThenInclude(x => x.RecipeIngredients).ThenInclude(x => x.IngredientNavigation).Include(x => x.MealtimeNavigation).Where(x => x.UserNavigation.Id == userID).ToListAsync();
        var mapper = AutoMapperConfig.UserMenuToUserMenuDTO.CreateMapper();


        UserMenuDto userMenuDto = new();
        userMenuDto.Menu = mapper.Map<List<UserMenuItemDto>>(userMenu);

        int? menu = userMenu.ElementAtOrDefault(0)?.UserNavigation.MenuCuisine;

        if(menu == null)
            menu = -1;

        userMenuDto.NationalCuisine = (int)menu;
        return userMenuDto;
    }

    public async Task<UserMenuDto> GetMenuDtoByUserIdAsync(Guid userPublicID)
    {
        var userMenu = await dbContext.UserMenus.Include(x => x.RecipeNavigation).ThenInclude(x => x.RecipeIngredients).ThenInclude(x => x.IngredientNavigation).Include(x => x.MealtimeNavigation).Include(x => x.UserNavigation).Where(x => x.UserNavigation.PublicId == userPublicID).ToListAsync();

        var mapper = AutoMapperConfig.UserMenuToUserMenuDTO.CreateMapper();

        UserMenuDto userMenuDto = new();
        userMenuDto.Menu = mapper.Map<List<UserMenuItemDto>>(userMenu);

        int? menu = userMenu.ElementAtOrDefault(0)?.UserNavigation.MenuCuisine;

        if (menu == null)
            menu = -1;

        userMenuDto.NationalCuisine = (int)menu;
        return userMenuDto;
    }

    public async Task<List<UserMenu>> GetMenuByUserIdAsync(Guid userPublicID)
    {
        var userMenu = await dbContext.UserMenus.Where(x => x.UserNavigation.PublicId == userPublicID).ToListAsync();
        return userMenu;
    }

    public async Task<UserMenuDto> GenerateMenuToUser(Guid userPublicID, int nationalCuisineId)
    {
        var oldMenu = await GetMenuByUserIdAsync(userPublicID);

        using var transaction = await dbContext.Database.BeginTransactionAsync();

        dbContext.RemoveRange(oldMenu);

        var userMenu = new List<UserMenu>();
        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.PublicId == userPublicID);

        if (user == null)
            return new UserMenuDto();

        var mealtimes = await dbContext.Mealtimes.ToListAsync();

        int? menu = nationalCuisineId;

        if (nationalCuisineId == -1)
            menu = null;

        user.MenuCuisine = menu;

        var recipes = await dbContext.Recipes.Include(x => x.Mealtimes).Include(x => x.NationalCuisineNavigation).Include(x => x.RecipeIngredients).ThenInclude(x => x.IngredientNavigation).Where(x => x.Verified == true).ToListAsync();
        var used_recipes = new List<Recipe>();

        for (int day = 1; day < 8; day++)
        {
            foreach (var mealtime in mealtimes)
            {
                userMenu.Add(new UserMenu() { Day = day, MealtimeNavigation = mealtime, UserNavigation = user, RecipeNavigation = GetRecipe(mealtime) });
            }
        }

        Recipe GetRecipe(Mealtime mealtime)
        {
            var rand = new Random();

            var tmpRecipes = recipes.Where(x => x.Mealtimes.Contains(mealtime));
            var tmpRecipesWithoutUsedRecipes = tmpRecipes.Where(x => x.NationalCuisine == nationalCuisineId);
            var tmpRecipesWithUsed = tmpRecipesWithoutUsedRecipes.Where(x => !used_recipes.Contains(x));

            var recipe = tmpRecipesWithUsed.ElementAtOrDefault(rand.Next(tmpRecipesWithUsed.Count()));

            if (recipe == null)
                recipe = tmpRecipesWithoutUsedRecipes.ElementAtOrDefault(rand.Next(tmpRecipesWithoutUsedRecipes.Count()));

            if (recipe == null)
                recipe = tmpRecipes.ElementAtOrDefault(rand.Next(tmpRecipes.Count()));

            if (recipe == null)
                recipe = new Recipe() { Id = -1 };

            return recipe;
        }

        dbContext.Update(user);

        await dbContext.AddRangeAsync(userMenu);
        await dbContext.SaveChangesAsync();

        await transaction.CommitAsync();

        var mapper = AutoMapperConfig.UserMenuToUserMenuDTO.CreateMapper();

        UserMenuDto userMenuDto = new();
        userMenuDto.Menu = mapper.Map<List<UserMenuItemDto>>(userMenu);

        userMenuDto.NationalCuisine = nationalCuisineId;

        return userMenuDto;
    }
}

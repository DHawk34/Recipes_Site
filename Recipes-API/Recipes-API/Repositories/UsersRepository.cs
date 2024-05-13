using Microsoft.EntityFrameworkCore;
using Recipes_API.DATA;
using Recipes_API.Models;

namespace Recipes_API.Repositories;

public class UsersRepository
{
    private readonly RecipeSiteContext dbContext;
    public UsersRepository(RecipeSiteContext dbContext)
    {
        this.dbContext = dbContext;
    }
    public Task<List<User>> GetAllUsersAsync() => dbContext.Users.ToListAsync();

    public async Task<User?> GetUserByIdAsync(long userID)
    {
        return await dbContext.Users.FindAsync(userID);
    }
    public async Task<User?> GetUserByPublicIdAsync(Guid publicID)
    {

        return await dbContext.Users.FirstOrDefaultAsync(x => x.PublicId == publicID);
    }
    public async Task<User?> GetUserByLoginAsync(string login)
    {

        return await dbContext.Users.FirstOrDefaultAsync(x => x.Login == login);
    }

    public async Task<long> GetUserIdByPublicID(Guid userPublicID)
    {
        return await dbContext.Users
            .Where(x => x.PublicId == userPublicID)
            .Select(x => x.Id)
            .SingleAsync();
    }



    public async Task<bool> AddNewUserAsync(User user)
    {
        user.PublicId = Guid.NewGuid();

        await dbContext.AddAsync(user);
        return await dbContext.SaveChangesAsync() > 0;

    }

    public async Task<bool> DeleteUserByPublicIdAsync(Guid userPublicID)
    {
        var userToRemove = await GetUserByPublicIdAsync(userPublicID);
        return await DeleteAsync(userToRemove);
    }

    public async Task<bool> DeleteUserByIdAsync(int userID)
    {
        var userToRemove = await GetUserByIdAsync(userID);
        return await DeleteAsync(userToRemove);
    }

    public async Task<bool> DeleteAsync(User? userToRemove)
    {
        if (userToRemove is null)
            return false;

        try
        {
            dbContext.Users.Remove(userToRemove);
            return await dbContext.SaveChangesAsync() > 0;
        }
        catch (Exception)
        {
            return false;
        }
    }
}

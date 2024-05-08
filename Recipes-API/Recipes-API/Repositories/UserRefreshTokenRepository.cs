using Microsoft.EntityFrameworkCore;
using Recipes_API.DATA;
using Recipes_API.Models;
using Recipes_API.Models.CustomModels;

namespace Recipes_API.Repositories;

public class UserRefreshTokenRepository
{
    private readonly RecipeSiteContext dbContext;
    public UserRefreshTokenRepository(RecipeSiteContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public Task<UserRefreshToken?> GetAsync(Guid userPublicID, Guid deviceID)
    {
        return dbContext.UserRefreshTokens
            .Include(x => x.User)
            .Where(x => x.User.PublicId == userPublicID && x.DeviceId == deviceID)
            .FirstOrDefaultAsync();
    }

    public Task<int> GetUserDeviceCount(Guid userPublicID)
    {
        return dbContext.UserRefreshTokens
            .Include(x => x.User)
            .CountAsync(x => x.User.PublicId == userPublicID);
    }

    public async Task<RefreshToken?> AddRefreshTokenAsync(int userID, Guid deviceID, RefreshToken token)
    {
        try
        {
            var existingEntry = await dbContext.UserRefreshTokens.FindAsync(userID, deviceID);
            var entry = existingEntry ?? new UserRefreshToken()
            {
                UserId = userID,
                DeviceId = deviceID,
            };

            entry.TokenHash = token.CreateHash();
            entry.CreatedDate = token.CreatedDate;
            entry.ExpiresDate = token.ExpiresDate;

            // if there was no entry, create new, otherwise update
            if (existingEntry is null)
                await dbContext.UserRefreshTokens.AddAsync(entry);

            return await dbContext.SaveChangesAsync() > 0 ? token : null;
        }
        catch (Exception)
        {
            return null;
        }
    }

    public async Task<RefreshToken?> UpdateRefreshTokenAsync(UserRefreshToken userToken, RefreshToken newToken)
    {
        try
        {
            bool needToAdd = !await dbContext.UserRefreshTokens.ContainsAsync(userToken);

            // update entry
            userToken.TokenHash = newToken.CreateHash();
            userToken.CreatedDate = newToken.CreatedDate;
            userToken.ExpiresDate = newToken.ExpiresDate;

            if (needToAdd)
                await dbContext.UserRefreshTokens.AddAsync(userToken);

            return await dbContext.SaveChangesAsync() > 0 ? newToken : null;
        }
        catch (Exception)
        {
            return null;
        }
    }



    public Task<bool> RemoveUserTokenDeviceAsync(Guid userPublicID, Guid deviceID)
    {
        var entriesToDelete = dbContext.UserRefreshTokens
            .Include(x => x.User)
            .Where(x => x.User.PublicId == userPublicID && x.DeviceId == deviceID);

        return RemoveEntriesAsync(entriesToDelete);
    }

    public Task<bool> RemoveUserTokensExceptOneDeviceAsync(Guid userPublicID, Guid deviceID)
    {
        var entriesToDelete = dbContext.UserRefreshTokens
                .Include(x => x.User)
                .Where(x => x.User.PublicId == userPublicID && x.DeviceId != deviceID);

        return RemoveEntriesAsync(entriesToDelete);
    }

    public Task<bool> RemoveAllUserTokensAsync(Guid userPublicID)
    {
        var entriesToDelete = dbContext.UserRefreshTokens
                .Include(x => x.User)
                .Where(x => x.User.PublicId == userPublicID);

        return RemoveEntriesAsync(entriesToDelete);
    }

    private async Task<bool> RemoveEntriesAsync(IQueryable<UserRefreshToken> entriesToDelete)
    {
        try
        {
            dbContext.UserRefreshTokens.RemoveRange(entriesToDelete);
            await dbContext.SaveChangesAsync();

            // return true even if deleted 0 entries
            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }
}

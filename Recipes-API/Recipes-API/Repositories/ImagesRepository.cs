using Recipes_API.DATA;
using Recipes_API.Models;

namespace Recipes_API.Repositories;

public class ImagesRepository
{
    private readonly RecipesSiteDbContext dbContext;

    public ImagesRepository(RecipesSiteDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<long> AddImageAsync(byte[] image, string contentType)
    {
        var newImage = await dbContext.Images.AddAsync(new Image()
        {
            Data = image,
            ContentType = contentType
        });

        await dbContext.SaveChangesAsync();

        return newImage.Entity.Id;
    }

    public async Task<(byte[] data, string contentType)?> GetImageAsync(long id)
    {
        var image = await dbContext.Images.FindAsync(id);
        if (image == null)
            return null;

        return (image.Data, image.ContentType);
    }
}

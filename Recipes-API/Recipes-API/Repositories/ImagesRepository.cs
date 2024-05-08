using Recipes_API.DATA;
using Recipes_API.Models;

namespace Recipes_API.Repositories;

public class ImagesRepository
{
    private readonly RecipeSiteContext dbContext;

    public ImagesRepository(RecipeSiteContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<int> AddImageAsync(byte[] image, string contentType)
    {
        var newImage = await dbContext.Images.AddAsync(new Image()
        {
            Data = image,
            ContentType = contentType
        });

        await dbContext.SaveChangesAsync();

        return newImage.Entity.Id;
    }

    public async Task<int> EditImageAsync(int id, byte[] image, string contentType)
    {
        var imageDb = dbContext.Images.FirstOrDefault(x => x.Id == id);
        imageDb.Data = image;
        imageDb.ContentType = contentType;
        
        await dbContext.SaveChangesAsync();

        return imageDb.Id;
    }

    public async Task<(byte[] data, string contentType)?> GetImageAsync(int id)
    {
        var image = await dbContext.Images.FindAsync(id);
        if (image == null)
            return null;

        return (image.Data, image.ContentType);
    }
}

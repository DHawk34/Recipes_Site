using Recipes_API.DATA;
using Recipes_API.Models;

namespace Recipes_API.Repositories;

public class RecipeInstructionRepository
{
    private readonly RecipesSiteDbContext dbContext;

    public RecipeInstructionRepository(RecipesSiteDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task AddInstructionStepToRecipeAsync(int recipeId, int step, int image, string instructionText)
    {
        await dbContext.RecipeInstructions.AddAsync(new RecipeInstruction()
        {
            Recipe = recipeId,
            Step = step,
            InstructionImage = image,
            InstructionText = instructionText
        });

        await dbContext.SaveChangesAsync();
    }
}

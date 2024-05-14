using System.Reflection;

namespace Recipes_API.Models.CustomModels
{

    public record CustomRecipe(string name, CustomRecipe.ImageWithType finishDishImage, int group, int[] mealtime, string? nationalCuisine, int difficult, int hot, string cookTime, int portionCount, CustomRecipe.Ingredient[] ingredients, CustomRecipe.Instruction_step[] instruction, DateTime creation_time)
    {

        public static async ValueTask<CustomRecipe?> BindAsync(HttpContext httpContext, ParameterInfo parameter)
        {
            var name = httpContext.Request.Form["name"];
            var finishDish = httpContext.Request.Form.Files.GetFile("finishDishImage");
            var nationalCuisine = httpContext.Request.Form["nationalCuisine"];
            if(!int.TryParse(httpContext.Request.Form["group"], out var group))
                return null;
            if (!int.TryParse(httpContext.Request.Form["difficult"], out var difficult))
                return null;
            if(!int.TryParse(httpContext.Request.Form["hot"], out var hot))
                return null;
            var mealtime = httpContext.Request.Form["mealtime"];
            var cookTime = httpContext.Request.Form["cookTime"];
            var ingredients_name = httpContext.Request.Form["ingredients_name"];
            var ingredients_amount = httpContext.Request.Form["ingredients_amount"];
            var instruction_steps_image = httpContext.Request.Form.Files.GetFiles("instruction_steps_image");
            var instruction_steps = httpContext.Request.Form["instruction_steps"];
            var creation_time = httpContext.Request.Form["creation_time"];
            if (!int.TryParse(httpContext.Request.Form["portionCount"], out var portionCount))
                return null;


            if (finishDish == null || mealtime.Count == 0 || name.Count == 0 || nationalCuisine.Count == 0 || cookTime.Count == 0 || ingredients_name.Count == 0 || creation_time.Count == 0
                || ingredients_amount.Count != ingredients_name.Count || instruction_steps_image.Count == 0 || instruction_steps.Count != instruction_steps_image.Count)
            {
                return null;
            }

            var t_meal = mealtime.ToArray();
            int[] m_mealtime = new int[t_meal.Count()];

            for (int i = 0; i < t_meal.Count(); i++)
            {
                if(!int.TryParse(t_meal[i], out var tmp))
                    return null;

                m_mealtime[i] = tmp;
            }

            var m_name = name[0];
            var m_nationalCuisine = nationalCuisine[0];
            var m_cookTime = cookTime[0];

            if (creation_time[0] == null)
                return null;

            var m_creationTime = DateTime.Parse(creation_time[0]);

            if (m_name == null || m_cookTime == null)
                return null;

            if (m_nationalCuisine == "")
                m_nationalCuisine = null;

            byte[] imageBytes = Array.Empty<byte>();
            using (var memoryStream = new MemoryStream())
            {
                await finishDish.CopyToAsync(memoryStream);
                imageBytes = memoryStream.ToArray();
            }

            var finishDishImage = new ImageWithType(imageBytes, finishDish.ContentType);

            var ingredients = new Ingredient[ingredients_name.Count];
            for (int i = 0; i < ingredients_name.Count; i++)
            {
                var i_name = ingredients_name[i];
                if (i_name == null)
                    return null;

                ingredients[i].name = i_name;
                int.TryParse(ingredients_amount[i], out var amount);
                ingredients[i].amount = amount;

            }

            var instruction = new Instruction_step[instruction_steps_image.Count];
            for (int i = 0; i < instruction_steps_image.Count; i++)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await instruction_steps_image[i].CopyToAsync(memoryStream);
                    instruction[i].image = new ImageWithType(memoryStream.ToArray(), instruction_steps_image[i].ContentType);
                }

                var i_step = instruction_steps[i];
                if (i_step == null)
                    return null;

                instruction[i].instruction = i_step;
            }

            // return the CreateTicketDto
            return
                new CustomRecipe(
                    m_name,
                    finishDishImage,
                    group,
                    m_mealtime,
                    m_nationalCuisine,
                    difficult,
                    hot,
                    m_cookTime,
                    portionCount,
                    ingredients,
                    instruction,
                    m_creationTime
                );

        }

        public struct Ingredient
        {
            public string name;
            public int amount;
        }

        public struct Instruction_step
        {
            public ImageWithType image;
            public string instruction;
        }

        public struct ImageWithType
        {
            public byte[] data;
            public string contentType;
            public ImageWithType(byte[] image, string contentType) : this()
            {
                this.data = image;
                this.contentType = contentType;
            }

        }
    }
}

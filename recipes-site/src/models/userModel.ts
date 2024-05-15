import RecipeModel from "./recipeModel"

export default interface UserModel {
    publicId: number
    name: string
    recipe: RecipeModel
}
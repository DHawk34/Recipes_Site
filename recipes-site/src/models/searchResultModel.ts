import RecipeModel from "./recipeModel";

export default interface SearchResultModel {
    isAdmin: boolean,
    recipes: Array<RecipeModel>
}
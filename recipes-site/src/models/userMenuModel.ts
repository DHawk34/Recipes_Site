import IdNameModel from "./idNameModel"
import RecipeModel from "./recipeModel"

export interface UserMenuItemModel {
    day: number
    mealtimeNavigation: IdNameModel
    recipeNavigation: RecipeModel
}

export default interface UserMenuModel {
    nationalCuisine: number
    menu: UserMenuItemModel[]
}
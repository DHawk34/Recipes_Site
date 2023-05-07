export default interface RecipeModel {
    id: number
    finishImage: number
    name: string
    nationalCuisineNavigation: { id: number, name: string }
    cookTime: string
    portionCount: number
    difficult: number
    hot: number
    creationTime: string
    recipeIngredients: { amount: number, ingredient: number, ingridientNavigation: { id: number, name: string } }[]
    recipeInstructions: { step: number, instructionImage: number, instructionText: string }[]

}
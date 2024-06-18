export default interface RecipeModel {
    id: number
    finishImage: number
    name: string
    groupNavigation : {id: number, name: string}
    ownerNavigation : {publicId: string, name: string}
    mealtimes : {id: number, name: string}[]
    nationalCuisineNavigation: { id: number, name: string }
    cookTime: string
    portionCount: number
    difficult: number
    hot: number
    creationTime: string
    isOwner: boolean
    isAdmin: boolean
    verified: boolean
    isFavorite: boolean
    recipeIngredients: { amount: number, ingredient: number, ingredientNavigation: { id: number, name: string } }[]
    recipeInstructions: { step: number, instructionImage: number, instructionText: string }[]
}
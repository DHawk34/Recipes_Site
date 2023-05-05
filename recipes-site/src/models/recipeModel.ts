export default class RecipeModel {
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

    constructor(
        id: number,
        finishImage: number,
        name: string,
        nationalCuisineNavigation: { id: number, name: string },
        cookTime: string,
        portionCount: number,
        difficult: number,
        hot: number,
        creationTime: string,
        recipeIngredients: { amount: number, ingredient: number, ingridientNavigation: { id: number, name: string } }[],
        recipeInstructions: { step: number, instructionImage: number, instructionText: string }[]
    ) {
        this.id = id
        this.finishImage = finishImage
        this.name = name
        this.nationalCuisineNavigation = nationalCuisineNavigation
        this.cookTime = cookTime
        this.portionCount = portionCount
        this.difficult = difficult
        this.hot = hot
        this.creationTime = creationTime
        this.recipeIngredients = recipeIngredients
        this.recipeInstructions = recipeInstructions
    }
}
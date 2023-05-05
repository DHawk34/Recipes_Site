import React, { useEffect, useState } from 'react';
import './Recipe.css';
import config from '../../config.json'
import RecipeModel from '../../models/recipeModel';
import { useParams } from 'react-router-dom';

export function Recipe() {
    const [recipe, setRecipe] = useState<RecipeModel>();
    const [ingredients, setIngredients] = useState<{ name: string, amountPerOne: number }[]>();
    const [portionCount, setPortionCount] = useState<number>(1);

    const params = useParams()
    const recipeId = params.id;
    useEffect(() => {
        console.log("reload")
        const request = new XMLHttpRequest();
        request.open("GET", config.apiServer + `recipe?id=${recipeId}`);
        request.responseType = 'json';
        request.send();

        request.onload = () => {
            var recipeFromServer: RecipeModel = Object.assign(RecipeModel.prototype, request.response)
            setRecipe(recipeFromServer)
            setPortionCount(recipeFromServer.portionCount)
            let ingredientsArr: { name: string, amountPerOne: number }[] = [];
            recipeFromServer?.recipeIngredients.forEach(ingr => {
                ingredientsArr.push({ name: ingr.ingridientNavigation.name, amountPerOne: ingr.amount / recipeFromServer.portionCount })
            });
            setIngredients(ingredientsArr);
        }

    }, [recipeId]);


    let ingredientsElements = ingredients?.map((ingredient: { name: string, amountPerOne: number }, index: number) => {
        return <tr key={index}>
            <td>{ingredient.name}</td>
            <td>{Math.round(ingredient.amountPerOne * portionCount * 10) / 10}  гр</td>
        </tr>
    })

    let instructionElements = recipe?.recipeInstructions.map((instruction_step: { step: number, instructionImage: number, instructionText: string }, index: number) => {
        return <div key={index}>
            <div className='instruction_step_header'>
                <h4 className='step_text'>Шаг {instruction_step.step}</h4>
            </div>
            <div className='instruction_step'>
                <img className='instruction_step_image' src={config.apiServer + `image?id=${instruction_step.instructionImage}`} alt={index.toString()}/>
                <p>{instruction_step.instructionText}</p>
            </div>
        </div>
    })


    return (
        <div id='recipe_container'>
            {recipe ? (
                <>
                    <img id='finish_image' src={config.apiServer + `image?id=${recipe.finishImage}`} alt={recipe.name} />
                    <h2>{recipe.name}</h2>

                    <h3>Ингредиенты</h3>
                    <table>
                        <tbody>
                            {ingredientsElements}
                        </tbody>
                    </table>
                    <div className='horizontal'>
                        <h4 className='margin-0 margin-right'>Порции</h4>
                        <button className='button increment_button' onClick={() => setPortionCount(portionCount - 1)}>-</button>
                        <p className='info_field'>{portionCount}</p>
                        <button className='button increment_button' onClick={() => setPortionCount(portionCount + 1)}>+</button>
                    </div>

                    <h3>Пошаговая инструкция</h3>
                    {instructionElements}
                </>
            ) : null}
        </div>
    );

}
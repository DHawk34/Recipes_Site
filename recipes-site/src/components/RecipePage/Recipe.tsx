import React, { useEffect, useState } from 'react';
import './Recipe.css';
import config from '../../config.json'
import RecipeModel from '../../models/recipeModel';
import { useParams } from 'react-router-dom';
import { Star } from '../icons/star';
import { Fire } from '../icons/fire';
import { Clock } from '../icons/clock';
import { EarthPlanet } from '../icons/earthPlanet';

export function Recipe() {
    const [recipe, setRecipe] = useState<RecipeModel>();
    const [ingredients, setIngredients] = useState<{ name: string, amountPerOne: number }[]>();
    const [portionCount, setPortionCount] = useState<number>(1);

    const params = useParams()
    const recipeId = params.id;
    useEffect(() => {
        // console.log("reload")
        const request = new XMLHttpRequest();
        request.open("GET", config.apiServer + `recipe?id=${recipeId}`);
        request.responseType = 'json';
        request.send();

        request.onload = () => {
            var recipeFromServer: RecipeModel = request.response
            setRecipe(recipeFromServer)
            setPortionCount(recipeFromServer.portionCount)
            let ingredientsArr: { name: string, amountPerOne: number }[] = [];
            recipeFromServer?.recipeIngredients.forEach(ingr => {
                ingredientsArr.push({ name: ingr.ingridientNavigation.name, amountPerOne: ingr.amount / recipeFromServer.portionCount })
            });
            setIngredients(ingredientsArr);
            document.title = recipeFromServer.name;
        }

    }, [recipeId]);

    function getCookTime() {
        var time = recipe?.cookTime.split(':');
        if (!time)
            return `-`

        let hours = time[0]
        let minutes = time[1]
        let finalStr = '';
        if (hours !== '0')
            finalStr += hours + ' час '
        if(minutes !== '0')
            finalStr += minutes + ' мин'

        return finalStr.trim();
    }

    let ingredientsElements = ingredients?.map((ingredient: { name: string, amountPerOne: number }, index: number) => {
        return <tr key={index}>
            <td className='ingredient_name'>{ingredient.name}</td>
            <td>{ingredient.amountPerOne !== 0 ? Math.round(ingredient.amountPerOne * portionCount * 10) / 10 + ' гр' : 'по вкусу'}</td>
        </tr>
    })

    let instructionElements = recipe?.recipeInstructions.map((instruction_step: { step: number, instructionImage: number, instructionText: string }, index: number) => {
        return <div key={index}>
            <div className='instruction_step_header'>
                <h4 className='step_text'>Шаг {instruction_step.step}</h4>
            </div>
            <div className='instruction_step'>
                <img className='instruction_step_image' src={config.apiServer + `image?id=${instruction_step.instructionImage}`} alt={index.toString()} />
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

                    <h3 className='margin-top-40'>Общая информация</h3>

                    <div id='dish_info'>
                        <div className='dish_info_block'>
                            <div className='horizontal'>
                                <Clock width='30px' height='30px'></Clock>
                                <p>{getCookTime()}</p>
                            </div>
                            <p>Время готовки</p>
                        </div>
                        <div className='dish_info_block'>
                            <div className='horizontal'>
                                <Star width='30px' height='30px'></Star>
                                <p>{recipe.difficult}/5</p>
                            </div>
                            <p>Сложность</p>
                        </div>
                        <div className='dish_info_block'>
                            <div className='horizontal'>
                                <Fire width='30px' height='30px'></Fire>
                                <p>{recipe.hot}/5</p>
                            </div>
                            <p>Острота</p>
                        </div>
                        <div className='dish_info_block'>
                            <div className='horizontal'>
                                <EarthPlanet width='30px' height='30px'></EarthPlanet>
                                <p className='underline clickable'>{recipe.nationalCuisineNavigation.name}</p>
                            </div>
                            <p>Кухня</p>
                        </div>
                    </div>

                    <h3 className='margin-top-40'>Ингредиенты</h3>
                    <table id='ingredient_table'>
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
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import './Recipe.css';
import ENDPOINTS from '@/endPoints';
import RecipeModel from '../../models/recipeModel';
import { useNavigate, useParams } from 'react-router-dom';
import { ReactComponent as Star } from '@/assets/star.svg';
import { ReactComponent as Fire } from '@/assets/fire.svg';
import { ReactComponent as Clock } from '@/assets/clock.svg';
import { ReactComponent as EarthPlanet } from '@/assets/earthPlanet.svg';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { addMeta, fetchData, instructionStepSortFunc } from '../../utils/utils';
import { ReactComponent as Printer } from '@/assets/printer.svg';
import { useCookies } from 'react-cookie';
import { ReactComponent as Trashcan } from '@/assets/trashcan.svg';
import { ReactComponent as Pencil } from '@/assets/pencil.svg';
import axios from 'axios';
import { isAuthorized } from '@/utils/auth';

export function Recipe() {
    // const [recipe, setRecipe] = useState<RecipeModel>();
    const [ingredients, setIngredients] = useState<{ id: number, name: string, amountPerOne: number }[]>();
    const [portionCount, setPortionCount] = useState<number>(1);
    const [isFavorite, setFavorite] = useState(false);

    const params = useParams()
    const recipeId = params.id;

    const navigate = useNavigate();

    const { data: isAuth} = useQuery(`is-auth`, () => isAuthorized(), {staleTime: 0, cacheTime: 0});
    console.log(isAuth)

    //recipes
    const { data: recipeFromServerResponse } = useQuery(`recipe-${recipeId}`, () => fetchData(`${ENDPOINTS.RECIPES.GET}?id=${recipeId}`));
    let recipe: RecipeModel = recipeFromServerResponse
    console.log(recipe)

    const componentRef = useRef(null);

    const reactToPrintContent = React.useCallback(() => {
        return componentRef.current;
    }, [componentRef.current]);

    const handlePrint = useReactToPrint({
        content: reactToPrintContent,
        documentTitle: "Рецепт-" + recipe?.name,
        removeAfterPrint: true
    });

    const handleFavorite = () => {
        if (isFavorite) {
            axios.delete(`${ENDPOINTS.USERS.DELETE_FAVORITE}?id=${recipe.id}`)
            .then(_ => console.log('delete from fav'))
            .catch(e => console.log(e))
        }
        else {
            axios.post(`${ENDPOINTS.USERS.ADD_FAVORITE}?id=${recipe.id}`)
            .then(_ => console.log('add to fav'))
            .catch(e => console.log(e))
        }

        setFavorite(!isFavorite);
    }

    const deleteRecipe = () => {
        if (window.confirm('Действительно удалить рецепт?')) {
            axios.delete(`${ENDPOINTS.RECIPES.DELETE}?id=${recipeId}`)
                .then(() => {
                    alert('Рецепт успешно удалён')
                    navigate('/recipes')
                })
                .catch(e => {
                    alert('Ошибка удаления')
                })
        }
    }

    const editRecipe = () => {
        navigate('edit')
    }

    useEffect(() => {
        if (!recipe)
            return

        console.log(recipe)
        recipe?.recipeInstructions.sort(instructionStepSortFunc)

        setPortionCount(recipe.portionCount)
        let ingredientsArr: { id: number, name: string, amountPerOne: number }[] = [];
        let ingrString = '';
        recipe?.recipeIngredients.forEach(ingr => {
            ingredientsArr.push({ id: ingr.ingredient, name: ingr.ingredientNavigation.name, amountPerOne: ingr.amount / recipe.portionCount })
            ingrString += ingr.ingredientNavigation.name + ', ';
        });
        setIngredients(ingredientsArr);

        document.title = recipe.name;
        addMeta('description', recipe.name);
        addMeta('keywords', ingrString);

        if (recipe.isFavorite) {
            setFavorite(true);
        }

        if(recipe.isOwner){
            document.getElementById('edit_btn')?.classList.remove('hide')
            document.getElementById('delete_btn')?.classList.remove('hide')
        }
        else{
            document.getElementById('edit_btn')?.classList.add('hide')
            document.getElementById('delete_btn')?.classList.add('hide')
        }

    }, [recipe])

    // useEffect(() => {
        if (isAuth)
            document.getElementById('fav_btn')?.classList.remove('hide')
    // }, [isAuth])

    function getCookTime() {
        var time = recipe?.cookTime.split(':');
        if (!time)
            return `-`

        let hours = time[0]
        let minutes = time[1]
        let finalStr = '';
        if (hours !== '0')
            finalStr += hours + ' час '
        if (minutes !== '0')
            finalStr += minutes + ' мин'

        return finalStr.trim();
    }

    let ingredientsElements = ingredients?.map((ingredient: { id: number, name: string, amountPerOne: number }, index: number) => {
        return <tr key={index}>
            <td> <Link className='ingredient_name' to={`/recipes?a_ingr=${ingredient.id}`}>{ingredient.name}</Link></td>
            <td className='inregient_amount'>{ingredient.amountPerOne !== 0 ? Math.round(ingredient.amountPerOne * portionCount * 10) / 10 + ' гр' : 'по вкусу'}</td>
        </tr>
    })

    let instructionElements = recipe?.recipeInstructions.map((instruction_step: { step: number, instructionImage: number, instructionText: string }, index: number) => {
        return <div key={index}>
            <div className='instruction_step_header'>
                <h4 className='step_text'>Шаг {instruction_step.step}</h4>
            </div>
            <div className='instruction_step'>
                <img className='instruction_step_image' src={`${ENDPOINTS.IMAGE.GET}?id=${instruction_step.instructionImage}`} alt={index.toString()} />
                <p>{instruction_step.instructionText}</p>
            </div>
        </div>
    })

    let meals = recipe?.mealtimes.map((meal: { id: number, name: string }, index: number) => {
        return <Link key={index} className='underline clickable grey_text meal' to={`/recipes?meal_t=${meal.id}`}>{meal.name}</Link>
    })

    return (
        <div id='recipe_container' ref={componentRef}>
            {recipe ? (
                <>
                    <img id='finish_image' src={`${ENDPOINTS.IMAGE.GET}?id=${recipe.finishImage}`} alt={recipe.name} />
                    <h2 id='recipe_name'>{recipe.name}</h2>

                    <div id='sub_info'>
                        <div className='horizontal'>
                            <Link className='underline clickable grey_text' to={`/recipes?group=${recipe.groupNavigation.id}`}>{recipe.groupNavigation.name}</Link>
                            <p>&nbsp; | &nbsp;</p>
                            {meals}
                        </div>
                        <div className='horizontal'>
                            <p>Автор:</p>
                            <Link className='underline clickable inherit_color' to={`/profile/${recipe.ownerNavigation.publicId}`}>{recipe.ownerNavigation.name}</Link>
                        </div>
                    </div>

                    <div className='print_hide margin_top' id='buttons_menu'>
                        <button id='fav_btn' className='button_inv hide' title="Добавить в избранное" onClick={handleFavorite}><Star width='30px' height='30px' color={isFavorite ? "gold" : "transparent"} strokeWidth='1px'></Star></button>
                        <button id='print_btn' className='button_inv' title='Распечатать рецепт' onClick={handlePrint}><Printer width='30px' height='30px'></Printer></button>
                        <button id='edit_btn' className='button_inv hide' title='Изменить рецепт' onClick={editRecipe}><Pencil width='30px' height='30px'></Pencil></button>
                        <button id='delete_btn' className='button_inv delete_ingredient_button hide' title='Удалить рецепт' onClick={deleteRecipe}><Trashcan width='30px' height='30px'></Trashcan></button>
                    </div>
                    <h3>Общая информация</h3>

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
                                <Star width='30px' height='30px' color='gold'></Star>
                                <p>{recipe.difficult}/5</p>
                            </div>
                            <p>Сложность</p>
                        </div>
                        <div className='dish_info_block'>
                            <div className='horizontal'>
                                <Fire width='30px' height='30px' color='brown'></Fire>
                                <p>{recipe.hot}/5</p>
                            </div>
                            <p>Острота</p>
                        </div>
                        <div className='dish_info_block'>
                            <div className='horizontal'>
                                <EarthPlanet width='30px' height='30px'></EarthPlanet>
                                {recipe.nationalCuisineNavigation ?
                                    <Link className='underline clickable link inherit_color' to={`/recipes?n_cuisine=${recipe.nationalCuisineNavigation.id}`}>{recipe.nationalCuisineNavigation.name}</Link>
                                    : <p>Не указано</p>}
                            </div>
                            <p>Кухня</p>
                        </div>
                    </div>

                    <h3 className='margin-top-40'>Ингредиенты</h3>
                    <table id='ingredient_table'>
                        <colgroup>
                            <col className="ingr_name_col" />
                            <col className="ingr_amount_col" />
                        </colgroup>
                        <tbody>
                            {ingredientsElements}
                        </tbody>
                    </table>
                    <div className='horizontal'>
                        <h4 className='margin-0 margin-right'>Порции</h4>
                        <button className='button increment_button print_hide' onClick={() => setPortionCount(portionCount - 1 >= 1 ? portionCount - 1 : portionCount)}>-</button>
                        <p className='info_field'>{portionCount}</p>
                        <button className='button increment_button print_hide' onClick={() => setPortionCount(portionCount + 1)}>+</button>
                    </div>

                    <h3 className='pagebreak print_margin_top'>Пошаговая инструкция</h3>
                    {instructionElements}
                </>
            ) : null}
        </div>
    );

}
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import './Recipe.css';
import ENDPOINTS from '@/endPoints';
import RecipeModel from '../../models/recipeModel';
import { useNavigate, useParams } from 'react-router-dom';
import { ReactComponent as Star} from '@/assets/star.svg';
import { ReactComponent as Fire} from '@/assets/fire.svg';
import { ReactComponent as Clock} from '@/assets/clock.svg';
import { ReactComponent as EarthPlanet} from '@/assets/earthPlanet.svg';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { addMeta } from '../../utils/utils';
import { ReactComponent as Printer} from '@/assets/printer.svg';
import { useCookies } from 'react-cookie';
import { ReactComponent as Trashcan} from '@/assets/trashcan.svg';
import { ReactComponent as Pencil} from '@/assets/pencil.svg';
import axios from 'axios';

export function Recipe() {
    // const [recipe, setRecipe] = useState<RecipeModel>();
    const [ingredients, setIngredients] = useState<{ id: number, name: string, amountPerOne: number }[]>();
    const [portionCount, setPortionCount] = useState<number>(1);
    const [cookies, setCookie, removeCookie] = useCookies(['favoriteDishes']);
    const [isFavorite, setFavorite] = useState(false);

    const params = useParams()
    const recipeId = params.id;

    const navigate = useNavigate();

    //recipes
    const { data: recipeFromServerResponse } = useQuery(`recipe-${recipeId}`, () => fetchData(`${ENDPOINTS.RECIPES.GET}?id=${recipeId}`));
    let recipe: RecipeModel = recipeFromServerResponse

    const fetchData = async (method: string) => {
        return axios.get(method)
            .then(res => res.data)
            .catch(e => {
                navigate('*')
            })
    }
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
        var favoriteDishes = cookies['favoriteDishes'] as number[];
        if (!favoriteDishes)
            favoriteDishes = [];

        console.log(favoriteDishes);
        if (isFavorite) {
            var index = favoriteDishes.indexOf(recipe.id);
            favoriteDishes.splice(index, 1);
            setCookie("favoriteDishes", favoriteDishes, { path: '/', maxAge: 1707109200 });
        }
        else {
            favoriteDishes.push(recipe.id);
            setCookie("favoriteDishes", favoriteDishes, { path: '/', maxAge: 1707109200 });
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

        function compareIndexFound(a: { step: number; instructionImage: number; instructionText: string; }, b: { step: number; instructionImage: number; instructionText: string; }) {
            if (a.step < b.step) { return -1; }
            if (a.step > b.step) { return 1; }
            return 0;
        }
        recipe?.recipeInstructions.sort(compareIndexFound)

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

        var favoriteDishes = cookies['favoriteDishes'] as number[];

        if (favoriteDishes?.includes(recipe.id)) {
            setFavorite(true);
        }
    }, [recipe])

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

    return (
        <div id='recipe_container' ref={componentRef}>
            {recipe ? (
                <>
                    <img id='finish_image' src={`${ENDPOINTS.IMAGE.GET}?id=${recipe.finishImage}`} alt={recipe.name} />
                    <h2 id='recipe_name'>{recipe.name}</h2>
                    <Link id='group_text' className='underline clickable link' to={`/recipes?group=${recipe.groupNavigation.id}`}>{recipe.groupNavigation.name}</Link>

                    <div className='print_hide margin_top' id='buttons_menu'>
                        <button className='button_inv' title="Добавить в избранное" onClick={handleFavorite}><Star width='30px' height='30px' color={isFavorite ? "gold" : "transparent"} strokeWidth='1px'></Star></button>
                        <button className='button_inv' title='Распечатать рецепт' onClick={handlePrint}><Printer width='30px' height='30px'></Printer></button>
                        <button className='button_inv' title='Изменить рецепт' onClick={editRecipe}><Pencil width='30px' height='30px'></Pencil></button>
                        <button className='button_inv delete_ingredient_button' title='Удалить рецепт' onClick={deleteRecipe}><Trashcan width='30px' height='30px'></Trashcan></button>
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
                                    <Link className='underline clickable link' to={`/recipes?n_cuisine=${recipe.nationalCuisineNavigation.id}`}>{recipe.nationalCuisineNavigation.name}</Link>
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
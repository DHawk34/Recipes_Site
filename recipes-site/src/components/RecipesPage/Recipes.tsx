import React, { useEffect, useRef, useState } from 'react';
import './Recipes.css';
import config from '../../config.json'
import RecipeModel from '../../models/recipeModel';
import { useNavigate } from 'react-router-dom';
import { Magnifier } from '../icons/magnifier';
import Select, { Theme } from 'react-select';
import { Fire } from '../icons/fire';
import { Refresh } from '../icons/refresh';
import { Star } from '../icons/star';
import { SelectStyle } from '../../styles';

// type MyState = {
//   recipes: Array<Recipe>,
//   canOpenRecipe: boolean
// }

export function Recipes() {

  const [recipes, setRecipes] = useState(Array<RecipeModel>());
  const [showExtraSearch, setShowExtraSearch] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const isLongPress = useRef<boolean>();
  //const []
  // constructor(props: any) {
  //   super(props);
  //   this.state = {
  //     recipes: [],
  //     canOpenRecipe: true
  //   }

  // }

  useEffect(() => {
    const request = new XMLHttpRequest();
    request.open("GET", config.apiServer + "recipe/all");
    request.responseType = 'json';
    request.send();

    request.onload = () => {
      var recipesFromServer: Array<RecipeModel> = request.response
      setRecipes(recipesFromServer)
    }
    document.title = 'Рецепты'
  }, []);

  const getIngredientsText = (recipe: RecipeModel) => {
    var finalStr = "";
    recipe.recipeIngredients.forEach(ingredients => {
      finalStr += ingredients.ingredientNavigation.name + ", "
    });

    finalStr = finalStr.slice(0, -2)
    return finalStr
  }

  const navigate = useNavigate();

  const openRecipe = (e:React.MouseEvent<HTMLAnchorElement, MouseEvent>, recipeId: number) => {
    e.preventDefault()
    if (isLongPress.current)
      return;
    navigate(`${recipeId}`)
  }

  const startPressTimer = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (e.nativeEvent.button !== 0)
      return;
    e.currentTarget.classList.add('selected')

    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
    }, 300);
  }

  const clearPressTimer = (element: HTMLElement) => {
    element.classList.remove('selected')
    clearTimeout(timerRef.current);
  }

  const handleShowExtra = () => {
    var extraSearchContainer = document.getElementById('search_container')
    if (showExtraSearch)
      extraSearchContainer?.classList.remove('height-0')
    else
      extraSearchContainer?.classList.add('height-0')

    setShowExtraSearch(!showExtraSearch)
  }

  const resetHot = () => {
    var hotButtons = document.getElementsByName(`hot`) as NodeListOf<HTMLInputElement>;

    hotButtons.forEach(button => {
      button.checked = false;
    });
  }

  const resetDifficult = () => {
    var difficultButtons = document.getElementsByName(`difficult`) as NodeListOf<HTMLInputElement>;

    difficultButtons.forEach(button => {
      button.checked = false;
    });
  }


  // const aquaticCreatures = [
  //   { label: 'Shark', value: 'Shark' },
  //   { label: 'Dolphin', value: 'Dolphin' },
  //   { label: 'Whale', value: 'Whale' },
  //   { label: 'Octopus', value: 'Octopus' },
  //   { label: 'Crab', value: 'Crab' },
  //   { label: 'Lobster', value: 'Lobster' },
  // ];


  // const options: MyOptionType[] = [
  //   { value: "chocolate", label: "Chocolate" },
  //   { value: "strawberry", label: "Strawberry" },
  //   { value: "vanilla", label: "Vanilla" }
  // ];

  let recipeItems = recipes.map((recipe: RecipeModel, index: number) => {
    return <a className='recipe_card' href={`recipes/${recipe.id}`} key={index} onClick={(e) => openRecipe(e, recipe.id)} onMouseDown={(e) => startPressTimer(e)} onMouseUp={(e) => clearPressTimer(e.currentTarget)}>
      <div className='flip-card-inner'>
        <div className='recipe_preview'>
          <img src={config.apiServer + `image?id=${recipe.finishImage}`} alt={recipe.name} />
          <p>{recipe.name}</p>
        </div>
        <div className='recipe_info'>
          <p>Ингредиенты:</p>
          <p>{getIngredientsText(recipe)}</p>
        </div>
      </div>
    </a>
  })

  return (
    <div id='recipes_container'>
      <h3>Поиск</h3>
      <div className='search_field_recipe'><input type="search" name="recipe_search" id='recipe_search_field' placeholder="Название рецепта" /><button type='submit'><Magnifier width='20px' height='20px' /></button></div>
      <button id='show_more_button' onClick={handleShowExtra}>Расширенный поиск</button>
      <div id='search_container' className='height-0'>
        <h4>Содержит ингредиент</h4>
        {/* <Select options={options} isMulti name='add_ingredient' placeholder='Выберите ингредиент' styles={mySelectStyle} noOptionsMessage={() => 'Ингредиент не найден'}></Select> */}
        <h4>Не содержит ингредиент</h4>
        {/* <Select options={options} isMulti name='remove_ingredient' placeholder='Выберите ингредиент' styles={mySelectStyle} noOptionsMessage={() => 'Ингредиент не найден'}></Select> */}
        <h4>Кухня мира</h4>
        {/* <Select options={options} isMulti name='nationalCuisine' placeholder='Выберите кухню' styles={mySelectStyle} noOptionsMessage={() => 'Кухня не найдена'}></Select> */}
        <h4 className='margin-right con_width horizontal'>Сложность <button id='reset_button' onClick={resetDifficult}><Refresh width='20px' height='20px' /></button></h4>
        <div className='horizontal-center'>
          <div className='radio_group' id='difficult_group'>
            <input type="radio" name="difficult" id="difficult-5" value={5} />
            <label htmlFor="difficult-5"><Star width='30px' height='30px' /></label>
            <input type="radio" name="difficult" id="difficult-4" value={4} />
            <label htmlFor="difficult-4"><Star width='30px' height='30px' /></label>
            <input type="radio" name="difficult" id="difficult-3" value={3} />
            <label htmlFor="difficult-3"><Star width='30px' height='30px' /></label>
            <input type="radio" name="difficult" id="difficult-2" value={2} />
            <label htmlFor="difficult-2"><Star width='30px' height='30px' /></label>
            <input type="radio" name="difficult" id="difficult-1" defaultChecked value={1} />
            <label htmlFor="difficult-1"><Star width='30px' height='30px' /></label>
          </div>
        </div>
        <h4 className='margin-right con_width horizontal'>Острота <button id='reset_button' onClick={resetHot}><Refresh width='20px' height='20px' /></button></h4>
        <div className='horizontal-center'>

          <div className='radio_group' id='hot_group'>
            <input type="radio" name="hot" id="hot-5" value={5} />
            <label htmlFor="hot-5"><Fire width='30px' height='30px' /></label>
            <input type="radio" name="hot" id="hot-4" value={4} />
            <label htmlFor="hot-4"><Fire width='30px' height='30px' /></label>
            <input type="radio" name="hot" id="hot-3" value={3} />
            <label htmlFor="hot-3"><Fire width='30px' height='30px' /></label>
            <input type="radio" name="hot" id="hot-2" value={2} />
            <label htmlFor="hot-2"><Fire width='30px' height='30px' /></label>
            <input type="radio" name="hot" id="hot-1" value={1} />
            <label htmlFor="hot-1"><Fire width='30px' height='30px' /></label>
          </div>
        </div>
      </div>
      <h3>Все рецепты</h3>

      <div id='recipes_grid'>
        {recipeItems}
      </div>
    </div>
  );
  //}
}
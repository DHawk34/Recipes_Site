import React, { useEffect, useRef, useState } from 'react';
import './Recipes.css';
import config from '../../config.json'
import RecipeModel from '../../models/recipeModel';
import { useNavigate } from 'react-router-dom';
import { Magnifier } from '../icons/magnifier';
import Select, { Theme } from 'react-select';

// type MyState = {
//   recipes: Array<Recipe>,
//   canOpenRecipe: boolean
// }

export function Recipes() {

  const [recipes, setRecipes] = useState(Array<RecipeModel>());
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
      finalStr += ingredients.ingridientNavigation.name + ", "
    });

    finalStr = finalStr.slice(0, -2)
    return finalStr
  }

  const navigate = useNavigate();

  const openRecipe = (recipeId: number) => {
    if (isLongPress.current)
      return;
    navigate(`${recipeId}`)
  }

  const startPressTimer = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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

  // const aquaticCreatures = [
  //   { label: 'Shark', value: 'Shark' },
  //   { label: 'Dolphin', value: 'Dolphin' },
  //   { label: 'Whale', value: 'Whale' },
  //   { label: 'Octopus', value: 'Octopus' },
  //   { label: 'Crab', value: 'Crab' },
  //   { label: 'Lobster', value: 'Lobster' },
  // ];

  type MyOptionType = {
    label: string;
    value: string;
  };

  const options: MyOptionType[] = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" }
  ];

  let recipeItems = recipes.map((recipe: RecipeModel, index: number) => {
    return <div className='recipe_card' key={index} onClick={() => openRecipe(recipe.id)} onMouseDown={(e) => startPressTimer(e)} onMouseUp={(e) => clearPressTimer(e.currentTarget)}>
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
    </div>
  })

  const selectTheme = (theme: Theme) => ({
    ...theme,
    colors: {
      ...theme.colors,
      primary25: 'lightgray',
      primary: 'black',
    },
  })

  return (
    <div id='recipes_container'>
      <h3>Поиск</h3>
      <div className='search_field_recipe'><input type="search" name="recipe_search" id='recipe_search_field' placeholder="Название рецепта" /><button type='submit'><Magnifier width='20px' height='20px' /></button></div>
      <button id='show_more_button'>Расширенный поиск</button>
      <div id='search_container'>
        <h4>Добавить ингредиент</h4>
        <Select options={options} isMulti name='add_ingredient' placeholder='Выберите ингредиент' theme={selectTheme}></Select>
        <h4>Исключить ингредиент</h4>
        <Select options={options} isMulti name='remove_ingredient' placeholder='Выберите ингредиент' theme={selectTheme}></Select>
        <h4>Кухня мира</h4>
        <Select options={options} isMulti name='nationalCuisine' placeholder='Выберите кухню' theme={selectTheme}></Select>
      </div>
      <h3>Все рецепты</h3>

      <div id='recipes_grid'>
        {recipeItems}
      </div>
    </div>
  );
  //}
}
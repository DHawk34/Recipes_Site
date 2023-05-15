import React, { useEffect, useRef, useState } from 'react';
import './Recipes.css';
import config from '../../config.json'
import RecipeModel from '../../models/recipeModel';
import { useNavigate } from 'react-router-dom';
import { Magnifier } from '../icons/magnifier';
import Select from 'react-select';
import { SelectStyle } from '../../styles';
import { useQuery } from 'react-query';
import IdNameModel from '../../models/idNameModel';

// type MyState = {
//   recipes: Array<Recipe>,
//   canOpenRecipe: boolean
// }

type MyOptionTypeInt = {
  label: string;
  value: number;
};

const mySelectStyle = SelectStyle<MyOptionTypeInt>()


export function Recipes() {

  // const [recipes, setRecipes] = useState(Array<RecipeModel>());
  const [showExtraSearch, setShowExtraSearch] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const isLongPress = useRef<boolean>();


  //recipes
  const { data: recipesFromServerResponse } = useQuery('recipes', () => fetchData('recipe/all'));
  var recipes: Array<RecipeModel> = recipesFromServerResponse

  //groups
  const { data: groupsFromServerResponse } = useQuery('groups', () => fetchData('recipe-groups'));
  var groups: MyOptionTypeInt[] = [];

  var groupsFromServer: Array<IdNameModel> = groupsFromServerResponse

  groupsFromServer?.forEach(element => {
    groups.push({ value: element.id, label: element.name });
  });

  //ingredients

  const { data: ingredientsFromServerResponse } = useQuery('ingredients', () => fetchData('ingredients'));
  var ingredients: MyOptionTypeInt[] = [];

  var ingredientsFromServer: Array<IdNameModel> = ingredientsFromServerResponse

  ingredientsFromServer?.forEach(element => {
    ingredients.push({ value: element.id, label: element.name });
  });

  //cuisines
  const { data: cuisinesFromServerResponse } = useQuery('cuisines', () => fetchData('cuisines'));
  var allCuisines: MyOptionTypeInt[] = [];

  var cuisinesFromServer: Array<IdNameModel> = cuisinesFromServerResponse

  cuisinesFromServer?.forEach(element => {
    allCuisines.push({ value: element.id, label: element.name });
  });


  const fetchData = async (method: string) => {
    return fetch(config.apiServer + method)
      .then(res => res.json())
  }

  //const []
  // constructor(props: any) {
  //   super(props);
  //   this.state = {
  //     recipes: [],
  //     canOpenRecipe: true
  //   }

  // }

  useEffect(() => {
    // const request = new XMLHttpRequest();
    // request.open("GET", config.apiServer + "recipe/all");
    // request.responseType = 'json';
    // request.send();

    // request.onload = () => {
    //   var recipesFromServer: Array<RecipeModel> = request.response
    //   setRecipes(recipesFromServer)
    // }
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

  const openRecipe = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, recipeId: number) => {
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
    console.log(showExtraSearch)
    var extraSearchContainer = document.getElementById('search_container')
    if (!showExtraSearch)
      extraSearchContainer?.classList.remove('height-0')
    else
      extraSearchContainer?.classList.add('height-0')

    setShowExtraSearch(!showExtraSearch)
  }

  let recipeItems = recipes?.map((recipe: RecipeModel, index: number) => {
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
        <Select options={ingredients} isMulti name='add_ingredient' placeholder='Выберите ингредиент' styles={mySelectStyle} noOptionsMessage={() => 'Ингредиент не найден'}></Select>
        <h4>Не содержит ингредиент</h4>
        <Select options={ingredients} isMulti name='remove_ingredient' placeholder='Выберите ингредиент' styles={mySelectStyle} noOptionsMessage={() => 'Ингредиент не найден'}></Select>
        <h4>Кухня мира</h4>
        <Select options={allCuisines} name='nationalCuisine' placeholder='Выберите кухню' styles={mySelectStyle} noOptionsMessage={() => 'Кухня не найдена'}></Select>
        <h4>Группа</h4>
        <Select options={groups} name='groups' placeholder='Выберите кухню' styles={mySelectStyle} noOptionsMessage={() => 'Группа не найдена'}></Select>
        <h4>Время готовки</h4>
        <div className='selector' id='time_selector'>
        <label>
            <input type="radio" name="time" defaultChecked />
            <span>Любое</span>
          </label>
          <label>
            <input type="radio" name="time" />
            <span>до 30 мин</span>
          </label>
          <label>
            <input type="radio" name="time" />
            <span>до 1 часа</span>
          </label>
          <label>
            <input type="radio" name="time" />
            <span>до 2 часов</span>
          </label>
          <label>
            <input type="radio" name="time" />
            <span>Более 2 часов</span>
          </label>
        </div>
        <h4>Сложность</h4>
        <div className='selector' id='difficult_selector'>
          <label>
            <input type="radio" name="difficult" defaultChecked />
            <span>Любая</span>
          </label>
          <label>
            <input type="radio" name="difficult" />
            <span>Легкая</span>
          </label>
          <label>
            <input type="radio" name="difficult" />
            <span>Средняя</span>
          </label>
          <label>
            <input type="radio" name="difficult" />
            <span>Тяжелая</span>
          </label>
        </div>
        <h4>Острота</h4>
        <div className='selector' id='hot_selector'>
          <label>
            <input type="radio" name="hot" defaultChecked />
            <span>Любая</span>
          </label>
          <label>
            <input type="radio" name="hot" />
            <span>Немного острое</span>
          </label>
          <label>
            <input type="radio" name="hot" />
            <span>Средней остроты</span>
          </label>
          <label>
            <input type="radio" name="hot" />
            <span>Очень острое</span>
          </label>
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
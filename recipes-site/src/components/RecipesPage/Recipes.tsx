import React, { useEffect, useRef, useState } from 'react';
import './Recipes.css';
import config from '../../config.json'
import RecipeModel from '../../models/recipeModel';
import { useNavigate } from 'react-router-dom';

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

  // componentDidMount(): void {
  //   const request = new XMLHttpRequest();
  //   request.open("GET", config.apiServer + "recipe/all");
  //   request.responseType = 'json';
  //   request.send();

  //   request.onload = () => {
  //     var recipesFromServer: Array<Recipe> = Object.assign(new Array<Recipe>(), request.response)
  //     this.setState({ recipes: recipesFromServer })
  //   }
  // }
  useEffect(() => {
    const request = new XMLHttpRequest();
    request.open("GET", config.apiServer + "recipe/all");
    request.responseType = 'json';
    request.send();

    request.onload = () => {
      var recipesFromServer: Array<RecipeModel> = Object.assign(new Array<RecipeModel>(), request.response)
      setRecipes(recipesFromServer)
    }
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

  const startPressTimer = () => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
    }, 300);
  }

  const clearPressTimer = () => {
    clearTimeout(timerRef.current);
  }



  //return {
  let recipeItems = recipes.map((recipe: RecipeModel, index: number) => {
    return <div className='recipe_card' key={index} onClick={() => openRecipe(recipe.id)} onMouseDown={() => startPressTimer()} onMouseUp={clearPressTimer}>
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

  return (
    <div id='recipes_container'>
      <h3>Все рецепты</h3>

      <div id='recipes_grid'>
        {recipeItems}
      </div>
    </div>
  );
  //}
}
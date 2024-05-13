import React, { useEffect, useRef, useState } from 'react';
import styles from './Recipes.module.css'
import ENDPOINTS from '@/endPoints';
import RecipeModel from '../../models/recipeModel';
import { useLocation, useNavigate, useSearchParams, useMatch } from 'react-router-dom';
import { ReactComponent as Magnifier } from '@/assets/magnifier.svg';
import Select from 'react-select';
import { SelectStyle } from '../../styles';
import { useQuery } from 'react-query';
import IdNameModel from '../../models/idNameModel';
import { ReactComponent as Clock } from '@/assets/clock.svg';
import { addMeta, fetchData } from '../../utils/utils';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { RecipeCard } from '../RecipeCard/RecipeCard';
import { MyOptionTypeInt } from '@/models/optionType';

// type MyState = {
//   recipes: Array<Recipe>,
//   canOpenRecipe: boolean
// }


const mySelectStyle = SelectStyle<MyOptionTypeInt>()

export function Recipes() {

  // const [recipes, setRecipes] = useState(Array<RecipeModel>());
  const [showExtraSearch, setShowExtraSearch] = useState<boolean>(false);
  const [cookies, setCookie, removeCookie] = useCookies(['favoriteDishes']);
  const match = useMatch('/recipes/:fav');
  const [searchHeader, setHeader] = useState<string>(match ? 'Избранное' : 'Все рецепты')

  const timerRef = useRef<NodeJS.Timeout>();
  const isLongPress = useRef<boolean>();
  const location = useLocation()
  const navigate = useNavigate();

  const myState = location.state
  const [searchParams, setSearchParams] = useSearchParams();
  const favoriteDishes = cookies["favoriteDishes"] as string[];


  function resetStates() {
    setShowExtraSearch(false)
    var extraSearchContainer = document.getElementById(styles.search_container)
    extraSearchContainer?.classList.add(styles.height_0)

    if (match) {
      setHeader('Избранное')
    }
    else {
      setHeader('Все рецепты')
    }
    recipeRefetch()
  }
  // let addIngredientSelect: any = null;



  //recipes
  const { data: recipesFromServerResponse, refetch: recipeRefetch } = useQuery(['recipes', searchParams.toString()], fetchRecipe);
  var recipes: Array<RecipeModel> = recipesFromServerResponse

  //groups
  const { data: groupsFromServerResponse } = useQuery('groups', () => fetchData(ENDPOINTS.RECIPE_GROUPS.ALL), {
  });
  var groups: MyOptionTypeInt[] = [{ label: 'Любая', value: -1 }];

  var groupsFromServer: Array<IdNameModel> = groupsFromServerResponse

  groupsFromServer?.forEach(element => {
    groups.push({ value: element.id, label: element.name });
  });

  //ingredients

  const { data: ingredientsFromServerResponse } = useQuery('ingredients', () => fetchData(ENDPOINTS.INGREDIENTS.ALL), {
  });


  var ingredients: MyOptionTypeInt[] = [];

  var ingredientsFromServer: Array<IdNameModel> = ingredientsFromServerResponse

  ingredientsFromServer?.forEach(element => {
    ingredients.push({ value: element.id, label: element.name });
  });

  //cuisines
  const { data: cuisinesFromServerResponse } = useQuery('cuisines', () => fetchData(ENDPOINTS.CUISINES.ALL), {
  });
  var allCuisines: MyOptionTypeInt[] = [{ label: 'Любая', value: -1 }];

  var cuisinesFromServer: Array<IdNameModel> = cuisinesFromServerResponse

  cuisinesFromServer?.forEach(element => {
    allCuisines.push({ value: element.id, label: element.name });
  });

  async function fetchRecipe() {
    let url = new URL(ENDPOINTS.RECIPES.SEARCH)
    let name = searchParams.get('recipe_search')
    let a_ingr = searchParams.getAll('a_ingr')
    let r_ingr = searchParams.getAll('r_ingr')
    let n_cuisine = searchParams.get('n_cuisine')
    let group = searchParams.get('group')
    let time = searchParams.get('time')
    let difficult = searchParams.get('difficult')
    let hot = searchParams.get('hot')

    if (name)
      url.searchParams.append('name', name)

    if (n_cuisine)
      url.searchParams.append('n_cuisine', n_cuisine)

    if (group)
      url.searchParams.append('group', group)

    if (time)
      url.searchParams.append('time', time)

    if (difficult)
      url.searchParams.append('difficult', difficult)

    if (hot)
      url.searchParams.append('hot', hot)


    a_ingr.forEach(ingr => {
      url.searchParams.append('a_ingr', ingr)
    });

    r_ingr.forEach(ingr => {
      url.searchParams.append('r_ingr', ingr)
    });

    if (Array.from(url.searchParams).length > 0)
      setHeader('Результаты поиска')

    if (match != null) {
      if (favoriteDishes)
        favoriteDishes?.forEach(element => {
          url.searchParams.append('r_ids', element)
        });

      if (!favoriteDishes || favoriteDishes.length === 0)
        url.searchParams.append('r_ids', '-1')
    }

    return axios.get(url.toString())
      .then(res => res.data)
  }


  const setupIngredients = (ref: any, ids: string[]) => {
    var ingredients = getIngredietsByIds(ids)
    ref?.setValue(ingredients)
    return ingredients;
  }

  const setupSingleSelect = (ref: any, id: string, source: MyOptionTypeInt[]) => {
    let option = source.find(x => String(x.value) === id);
    ref?.setValue(option)
  }


  useEffect(() => {
    if (myState != null && myState.myState.refresh) {
      // console.log('reset')
      resetStates()
    }

    document.title = 'Рецепты'
    addMeta('description', 'Рецепты')
    addMeta('keywords', 'выпечка, гарниры, вторые блюда, супы, сладости, напитки')
  }, [myState]);

  const handleShowExtra = () => {
    var extraSearchContainer = document.getElementById(styles.search_container)
    if (!showExtraSearch)
      extraSearchContainer?.classList.remove(styles.height_0)
    else
      extraSearchContainer?.classList.add(styles.height_0)

    setShowExtraSearch(!showExtraSearch)
  }

  const getIngredietsByIds = (ids: string[], data?: MyOptionTypeInt[]) => {
    let options: MyOptionTypeInt[] = []

    let source = ingredients;
    if (data !== undefined)
      source = data

    ids.forEach(id => {
      let option = source.find(x => String(x.value) === id);
      if (option)
        options.push(option)
    });
    return options
  }

  const submitForm = (e: any) => {
    e.preventDefault()
    let formElement = e.target[0].form
    let formData = new FormData(formElement)

    let keys = Array.from(formData.keys());

    let uniqueKeys = Object.values(keys.reduce((acc, next) => ({
      ...acc,
      [next]: next
    }), {})) as string[];

    var searchParams = new URLSearchParams()

    uniqueKeys.forEach(key => {
      let values = formData.getAll(key) as string[];

      if ((values.length > 1) || (values.length === 1 && values[0] !== '-1' && values[0] !== '')) {
        values.forEach(value => {
          searchParams.append(key, value);
        });
      }
    });

    //setSearchParams(searchParams)
    navigate('?' + searchParams.toString())

    setShowExtraSearch(false)
    var extraSearchContainer = document.getElementById(styles.search_container)
    extraSearchContainer?.classList.add(styles.height_0)
  }

  useEffect(() => {
    recipeRefetch()


    let time = searchParams.get('time')
    let timeRadio = document.getElementById(`time-${time}`) as HTMLInputElement;

    if (timeRadio)
      timeRadio.checked = true;
    else
      (document.getElementById(`time--1`) as HTMLInputElement).checked = true;

    let difficult = searchParams.get('difficult')
    let difficultRadio = document.getElementById(`difficult-${difficult}`) as HTMLInputElement;

    if (difficultRadio)
      difficultRadio.checked = true;
    else
      (document.getElementById(`difficult--1`) as HTMLInputElement).checked = true;

    let hot = searchParams.get('hot')
    let hotRadio = document.getElementById(`hot-${hot}`) as HTMLInputElement;

    if (hotRadio)
      hotRadio.checked = true;
    else
      (document.getElementById(`hot--1`) as HTMLInputElement).checked = true;

    let recipe_search = searchParams.get('recipe_search')
    let searchElement = (document.getElementById('recipe_search_field') as HTMLInputElement)
    // console.log(recipe_search)
    if (searchElement)
      searchElement.value = recipe_search ?? '';

  }, [searchParams])

  let recipeItems = recipes?.map((recipe: RecipeModel, index: number) => {
    return <RecipeCard recipe={recipe} key={index} />
  })

  return (
    <div id={styles.recipes_container}>
      <h3>Поиск</h3>
      <form onSubmit={submitForm}>
        <div id={styles.search_block}>
          <div className={styles.search_field_recipe}><input type="search" name="recipe_search" id='recipe_search_field' placeholder="Название рецепта" /><button className='button' type='submit'><Magnifier width='20px' height='20px' /></button></div>
          <input type='button' id={styles.show_more_button} onClick={handleShowExtra} value={'Расширенный поиск'}></input>
          <div id={styles.search_container} className={styles.height_0}>
            <h4>Содержит ингредиент</h4>
            <Select ref={(ref) => setupIngredients(ref, searchParams.getAll('a_ingr'))} options={ingredients} isMulti name='a_ingr' placeholder='Выберите ингредиент' styles={mySelectStyle} noOptionsMessage={() => 'Ингредиент не найден'}></Select>
            <h4>Не содержит ингредиент</h4>
            <Select ref={(ref) => setupIngredients(ref, searchParams.getAll('r_ingr'))} options={ingredients} isMulti name='r_ingr' placeholder='Выберите ингредиент' styles={mySelectStyle} noOptionsMessage={() => 'Ингредиент не найден'}></Select>
            <h4>Кухня мира</h4>
            <Select ref={(ref) => setupSingleSelect(ref, searchParams.get('n_cuisine') ?? '-1', allCuisines)} options={allCuisines} name='n_cuisine' placeholder='Выберите кухню' styles={mySelectStyle} defaultValue={allCuisines[0]} noOptionsMessage={() => 'Кухня не найдена'}></Select>
            <h4>Группа</h4>
            <Select ref={(ref) => setupSingleSelect(ref, searchParams.get('group') ?? '-1', groups)} options={groups} name='group' placeholder='Выберите кухню' styles={mySelectStyle} defaultValue={groups[0]} noOptionsMessage={() => 'Группа не найдена'}></Select>
            <h4>Время готовки</h4>
            <div className='selector' id={styles.time_selector}>
              <label>
                <input type="radio" name="time" id='time--1' defaultChecked value={-1} />
                <span>Любое</span>
              </label>
              <label>
                <input type="radio" name="time" id='time-0' value={0} />
                <span>до 30 мин</span>
              </label>
              <label>
                <input type="radio" name="time" id='time-1' value={1} />
                <span>до 1 часа</span>
              </label>
              <label>
                <input type="radio" name="time" id='time-2' value={2} />
                <span>до 2 часов</span>
              </label>
              <label>
                <input type="radio" name="time" id='time-3' value={3} />
                <span>Более 2 часов</span>
              </label>
            </div>
            <h4>Сложность</h4>
            <div className='selector' id={styles.difficult_selector}>
              <label>
                <input type="radio" name="difficult" id='difficult--1' defaultChecked value={-1} />
                <span>Любая</span>
              </label>
              <label>
                <input type="radio" name="difficult" id='difficult-0' value={0} />
                <span>Низкая</span>
              </label>
              <label>
                <input type="radio" name="difficult" id='difficult-1' value={1} />
                <span>Средняя</span>
              </label>
              <label>
                <input type="radio" name="difficult" id='difficult-2' value={2} />
                <span>Высокая</span>
              </label>
            </div>
            <h4>Острота</h4>
            <div className='selector' id={styles.hot_selector}>
              <label>
                <input type="radio" name="hot" id='hot--1' defaultChecked value={-1} />
                <span>Любая</span>
              </label>
              <label>
                <input type="radio" name="hot" id='hot-0' value={0} />
                <span>Не острое</span>
              </label>
              <label>
                <input type="radio" name="hot" id='hot-1' value={1} />
                <span>Немного острое</span>
              </label>
              <label>
                <input type="radio" name="hot" id='hot-2' value={2} />
                <span>Средней остроты</span>
              </label>
              <label>
                <input type="radio" name="hot" id='hot-3' value={3} />
                <span>Очень острое</span>
              </label>
            </div>
            <button type="submit" className={`button ${styles.margin_top}`}>Найти</button>
          </div>
        </div>
      </form>
      <h3>{searchHeader}</h3>
      {recipeItems?.length > 0 ?
        <div id={styles.recipes_grid}>
          {recipeItems}
        </div>
        : favoriteDishes?.length > 0 ? 'По вашему запросу ничего не найдено' : 'Нет избранных рецептов'}
    </div>
  );
  //}
}
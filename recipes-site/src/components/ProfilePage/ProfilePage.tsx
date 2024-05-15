import React, { useEffect, useReducer, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import styles from './ProfilePage.module.css'
import { ReactComponent as Profile } from '@/assets/profile.svg';
import axios from 'axios';
import { useQuery } from 'react-query';
import ENDPOINTS from '@/endPoints';
import UserModel from '@/models/userModel';
import { SelectStyle } from '@/styles';
import { MyOptionTypeInt } from '@/models/optionType';
import Select from 'react-select';
import { div, fetchData } from '@/utils/utils';
import IdNameModel from '@/models/idNameModel';
import RecipeModel from '@/models/recipeModel';
import { RecipeCard } from '../RecipeCard/RecipeCard';

const mySelectStyle = SelectStyle<MyOptionTypeInt>()

export function ProfilePage() {

  const location = useLocation();
  const params = useParams()
  const userID = params.uid;

  useEffect(() => {
    document.title = 'Профиль'
  }, [])

  const { data: UserFromServerResponse } = useQuery(['dif-profile', userID], () => fetchData(userID ? `${ENDPOINTS.USERS.GET}${userID}` : `${ENDPOINTS.USERS.INFO}`));
  let user: UserModel = UserFromServerResponse

  useEffect(() => {
    if (!user || userID)
      return;

    console.log(user)

    window.history.replaceState(null, '', `${location.pathname}/${user.publicId}`)
  }, [user, userID])

  if (!userID && user) {
    window.history.replaceState(null, '', `${location.pathname}/${user.publicId}`)
  }

  const { data: cuisinesFromServerResponse } = useQuery('cuisines', () => fetchData(ENDPOINTS.CUISINES.ALL), {
  });
  var allCuisines: MyOptionTypeInt[] = [{ label: 'Любая', value: -1 }];

  var cuisinesFromServer: Array<IdNameModel> = cuisinesFromServerResponse

  cuisinesFromServer?.forEach(element => {
    allCuisines.push({ value: element.id, label: element.name });
  });

  async function fetchRecipe() {
    let url = new URL(ENDPOINTS.RECIPES.SEARCH)

    return axios.get(url.toString())
      .then(res => res.data)
  }

  const { data: recipesFromServerResponse, refetch: recipeRefetch } = useQuery(['recipes'], fetchRecipe);
  var recipes: Array<RecipeModel> = recipesFromServerResponse

  var days = ['Завтрак', 'Обед', 'Ужин']

  let recipeItems = recipes?.map((recipe: RecipeModel, index: number) => {
    let row = div(index, 7) + 2
    let column = (index) - (row - 2) * 7 + 2

    // console.log({ row, column })

    return <RecipeCard mini recipe={recipe} key={index} className={styles.row_gap} style={{ gridArea: `${row} / ${column} / ${row + 1} / ${column + 1}` }} />
    // return <RecipeCard recipe={recipe} key={index} />
  })

  return (
    <div id={styles.profile_container}>
      {user ? (
        <>
          <div id={styles.profile_icon}>
            <Profile width='150px' height='150px' />
            <p>{user.name}</p>
          </div>

          <h3>Ваши рецепты</h3>

          <div id={styles.menu_label}>
            <h3>Ваше меню</h3>

            <div id={styles.cuisine_div}>
              <p>Кухня</p>
              <Select id={styles.cuisine_select} options={allCuisines} name='n_cuisine' placeholder='Выберите кухню' styles={mySelectStyle} noOptionsMessage={() => 'Кухня не найдена'} />
            </div>
          </div>

          <div id={styles.menu_table}>
            <div className={styles.mealtime_div} style={{ gridArea: '1 / 1 / 3 / 2' }} />

            <div className={styles.mealtime_div} style={{ gridArea: '2 / 1 / 3 / 2' }}>
              <p className={styles.mealtime}>Завтрак</p>
            </div>
            <div className={styles.mealtime_div} style={{ gridArea: '3 / 1 / 4 / 2' }}>
              <p className={styles.mealtime} >Обед</p>
            </div>
            <div className={styles.mealtime_div} style={{ gridArea: '4 / 1 / 5 / 2' }}>
              <p className={styles.mealtime} >Перекус</p>
            </div>
            <div className={styles.mealtime_div} style={{ gridArea: '5 / 1 / 6 / 2' }}>
              <p className={styles.mealtime} >Ужин</p>
            </div>

            <p style={{ gridArea: '1 / 2 / 2 / 3' }}>ПН</p>
            <p style={{ gridArea: '1 / 3 / 2 / 4' }}>ВТ</p>
            <p style={{ gridArea: '1 / 4 / 2 / 5' }}>СР</p>
            <p style={{ gridArea: '1 / 5 / 2 / 6' }}>ЧТ</p>
            <p style={{ gridArea: '1 / 6 / 2 / 7' }}>ПТ</p>
            <p style={{ gridArea: '1 / 7 / 2 / 8' }}>СБ</p>
            <p style={{ gridArea: '1 / 8 / 2 / 9' }}>ВС</p>

            {recipes ? recipeItems : null}
          </div>
          {/* <div id={styles.menu_div}>

          </div> */}
        </>
      ) : null}
    </div>
  );
  //}
}

import React, { useEffect, useReducer, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import styles from './ProfilePage.module.css'
import { ReactComponent as Profile } from '@/assets/profile.svg';
import { ReactComponent as Refresh } from '@/assets/refresh.svg';
import axios from 'axios';
import { useQuery } from 'react-query';
import ENDPOINTS from '@/endPoints';
import UserModel from '@/models/userModel';
import { SelectStyle } from '@/styles';
import { MyOptionTypeInt } from '@/models/optionType';
import Select, { MultiValue, SingleValue } from 'react-select';
import { div, fetchData } from '@/utils/utils';
import IdNameModel from '@/models/idNameModel';
import { RecipeCard } from '../RecipeCard/RecipeCard';
import RecipeModel from '@/models/recipeModel';
import UserMenuModel, { UserMenuItemModel } from '@/models/userMenuModel';

const mySelectStyle = SelectStyle<MyOptionTypeInt>()

export function ProfilePage() {

  const location = useLocation();
  const params = useParams()
  const userID = params.uid;
  const [cuisineOption, setCuisineOption] = useState<MyOptionTypeInt | undefined>(undefined);
  const [userMenu, setUserMenu] = useState<UserMenuModel | undefined>(undefined)

  useEffect(() => {
    document.title = 'Профиль'
  }, [])

  const { data: UserFromServerResponse } = useQuery(['dif-profile', userID], () => fetchData(userID ? `${ENDPOINTS.USERS.GET}${userID}` : `${ENDPOINTS.USERS.INFO}`));
  let user: UserModel = UserFromServerResponse

  useEffect(() => {
    if (!user || userID)
      return;

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

  const handleCuisineChange = (selectedOption?: MultiValue<MyOptionTypeInt> | SingleValue<MyOptionTypeInt>) => {
    let newVal: MyOptionTypeInt | undefined = undefined
    if (typeof (selectedOption) === 'number') {
      newVal = allCuisines.at(selectedOption as any)
      setCuisineOption(newVal);
    }
    else {
      newVal = selectedOption as MyOptionTypeInt
      setCuisineOption(selectedOption as MyOptionTypeInt);
    }

    if (!newVal)
      return

    axios.post(`${ENDPOINTS.USERMENU.GENERATE}?n_cuisine=${newVal.value}`)
      .then((res) => setUserMenu(res.data))
  }

  const regenerateMenu = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!cuisineOption)
      return

    axios.post(`${ENDPOINTS.USERMENU.GENERATE}?n_cuisine=${cuisineOption.value}`)
      .then((res) => setUserMenu(res.data))
  }


  const { data: usermenuOldFromServerResponse } = useQuery(['usermenu-old'], () => fetchData(ENDPOINTS.USERMENU.GET));
  var oldUserMenu: UserMenuModel = usermenuOldFromServerResponse

  useEffect(() => {
    if (!oldUserMenu)
      return

    setUserMenu(oldUserMenu)
    console.log(oldUserMenu)

    setCuisineOption(allCuisines.find(x => x.value === oldUserMenu.nationalCuisine))
  }, [oldUserMenu])

  let recipeItems = userMenu?.menu.map((menu: UserMenuItemModel, index: number) => {
    let row = menu.mealtimeNavigation.id + 1
    let column = menu.day + 1

    return <RecipeCard mini recipe={menu.recipeNavigation} key={index} className={styles.row_gap} style={{ gridArea: `${row} / ${column} / ${row + 1} / ${column + 1}` }} />
  })

  let userRecipes = user?.recipes.map((recipe: RecipeModel, index: number) => {
    return <RecipeCard mini recipe={recipe} key={index} />
  })

  return (
    <div id={styles.profile_container}>
      {user && <>
        <div id={styles.profile_icon}>
          <Profile width='150px' height='150px' />
          <p>{user.name}</p>
        </div>

        <div id={styles.user_recipe_label}>
          <h3>{user.isMe ? 'Ваши рецепты' : 'Рецепты пользователя'}</h3>
          <NavLink to={`/recipes?user=${user.publicId}`} className='underline clickable inherit_color'>{'Подробнее →'}</NavLink>
        </div>

        {userRecipes?.length > 0 &&
          <div id={styles.user_recipes}>
            {userRecipes}
          </div>
        }

        {user.isMe && <>
          <div id={styles.menu_label}>
            <div className='horizontal'>
              <h3>Ваше меню</h3>
              <button id={styles.reset_button} onClick={regenerateMenu}><Refresh width='20px' height='20px' /></button>
            </div>

            <div id={styles.cuisine_div}>
              <p>Кухня</p>
              <Select onChange={handleCuisineChange} id={styles.cuisine_select} value={cuisineOption} options={allCuisines} name='n_cuisine' placeholder='Выберите кухню' styles={mySelectStyle} noOptionsMessage={() => 'Кухня не найдена'} />
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

            {userMenu ? recipeItems : null}
          </div>
        </>}
      </>}
    </div>
  );
  //}
}

import React, { useState } from 'react';
import styles from './NavPanel.module.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { ReactComponent as SpoonAndFork } from '@/assets/spoonAndFork.svg';
import { ReactComponent as Magnifier } from '@/assets/magnifier.svg';
import { ReactComponent as Hamburger } from '@/assets/hamburger.svg';
import { ReactComponent as Cross } from '@/assets/cross.svg';
import { ReactComponent as Profile } from '@/assets/profile.svg';

export function NavPanel() {
  const [clicked, setClicked] = useState<boolean>(false);
  const navigate = useNavigate();

  function getButtons() {
    return <>
      <NavLink className={`button ${styles.nav_button}`} to={'/recipes'} onClick={hideMenu} state={{ refresh: true }}>Рецепты</NavLink>
      <NavLink className={`button ${styles.nav_button}`} to={'/recipes/favorite'} onClick={hideMenu} state={{ refresh: true }}>Избранное</NavLink>
      <NavLink className={`button ${styles.nav_button}`} to={'/recipes/new'} onClick={hideMenu} state={{ refresh: true }  }>Добавить рецепт</NavLink>
    </>
  }

  const handleClick = () => {
    setClicked(!clicked)
    var container = document.getElementById(styles.mobile_nav_container);
    var background = document.getElementById(styles.nav_background);
    if (clicked) {
      container?.classList.add(styles.width_0)
      background?.classList.add(styles.hidden)
    }
    else {
      container?.classList.remove(styles.width_0)
      background?.classList.remove(styles.hidden)
    }
  }

  const hideMenu = () => {
    var mobile = document.getElementById(styles.mobile);
    if (!mobile?.classList.contains(styles.hidden)) {
      setClicked(false)
      var container = document.getElementById(styles.mobile_nav_container);
      var background = document.getElementById(styles.nav_background);
      container?.classList.add(styles.width_0)
      background?.classList.add(styles.hidden)
    }
  }

  const searchRecipe = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key !== 'Enter')
      return;

    let searchInput = document.getElementById('recipe_search_field') as HTMLInputElement
    navigate(`/recipes?recipe_search=${searchInput.value}`)
  }

  const searchRecipeButt = () => {
    console.log('fire')
    let searchInput = document.getElementById('recipe_search_field') as HTMLInputElement
    navigate(`/recipes?recipe_search=${searchInput.value}`)
  }

  return (
    <div id={styles.nav_container} className='print_hide'>
      <div id={styles.mobile}>
        <button id={styles.menu_icon} onClick={handleClick}>
          {clicked ? <Cross width='35px' height='35px' /> : <Hamburger width='35px' height='35px' />}
        </button>

        <div id={styles.nav_background} className={styles.hidden} onClick={handleClick}></div>
        <div id={styles.mobile_nav_container} className={styles.width_0}>
          {getButtons()}
        </div>
      </div>

      <NavLink className={`button ${styles.nav_button}`} to={'/home'} id={styles.mainMenuButton}><SpoonAndFork width='35px' height='35px' /></NavLink>
      <div className={styles.search_field}><input type="search" name={styles.recipe_search} placeholder="Найти рецепт" id='recipe_search_field' onKeyDown={searchRecipe} /><button className='button' type='submit' onClick={searchRecipeButt}><Magnifier width='20px' height='20px' /></button></div>
      <div id={styles.pc}>
        {getButtons()}
      </div>
      <NavLink className={`button ${styles.nav_button}`} to={'/profile'} id={styles.profile_button}><Profile width='35px' height='35px' /></NavLink>
    </div>

  );
}
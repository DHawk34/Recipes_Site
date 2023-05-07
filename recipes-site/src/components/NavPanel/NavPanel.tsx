import React, { useState } from 'react';
import './NavPanel.css';
import { NavLink } from 'react-router-dom';
import { SpoonAndFork } from '../icons/spoonAndFork';
import { Magnifier } from '../icons/magnifier';
import { Hamburger } from '../icons/hamburger';
import { Cross } from '../icons/cross';

export function NavPanel() {
  const [clicked, setClicked] = useState<boolean>(false);

  function getButtons() {
    return <>
      {/* <NavLink className='button nav_button' to={'/search'}>Расширенный поиск</NavLink> */}
      <NavLink className='button nav_button' to={'/recipes'} onClick={hideMenu}>Рецепты</NavLink>
      <NavLink className='button nav_button' to={'/recipes/new'} onClick={hideMenu}>Добавить рецепт</NavLink>
    </>
  }

  const handleClick = () => {
    setClicked(!clicked)
    var container = document.getElementById('mobile_nav_container');
    var background = document.getElementById('nav_background');
    if (clicked) {
      container?.classList.add('width-0')
      background?.classList.add('hidden')
    }
    else {
      container?.classList.remove('width-0')
      background?.classList.remove('hidden')
    }
  }

  const hideMenu = () => {
    var mobile = document.getElementById('mobile');
    if (!mobile?.classList.contains('hidden')) {
      setClicked(false)
      var container = document.getElementById('mobile_nav_container');
      var background = document.getElementById('nav_background');
      container?.classList.add('width-0')
      background?.classList.add('hidden')
    }
  }

  return (
    <div id='nav_container'>
      <div id='mobile'>
        <div id='menu_icon' onClick={handleClick}>
          {clicked ? <Cross width='35px' height='35px' /> : <Hamburger width='35px' height='35px' />}
        </div>

        <div id='nav_background' className='hidden' onClick={handleClick}></div>
        <div id='mobile_nav_container' className='width-0'>
          {getButtons()}
        </div>
      </div>

      <NavLink className='button nav_button' to={'/home'} id='mainMenuButton'><SpoonAndFork width='35px' height='35px' /></NavLink><div className='search_field'><input type="search" name="recipe_search" placeholder="Найти рецепт" /><button type='submit'><Magnifier width='20px' height='20px' /></button></div>
      <div id='pc'>
        {getButtons()}
      </div>
    </div>

  );
}
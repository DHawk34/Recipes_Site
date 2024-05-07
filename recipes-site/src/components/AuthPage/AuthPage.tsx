import React, { useEffect, useReducer, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom'
import styles from './AuthPage.module.css'


export function AuthPage() {
  let a = 1

  const location = useLocation();
  const isLogin = location.pathname === "/login"

  useEffect(() => {
    console.log(isLogin)
    document.title = isLogin ? 'Авторизация' : 'Регистрация'
  }, [])

  return (
    <div id={styles.registerForm_container}>
      <h2>{isLogin ? 'Авторизация' : 'Регистрация'}</h2>
      <form className={styles.auth_form} autoComplete="on">
        {!isLogin && (<>
            <label htmlFor="name">Имя</label>
            <input type='text' id='name' className={styles.input_field} required></input>
          </>)}

        <label htmlFor="username">Логин</label>
        <input type='text' id='username' autoComplete='username' className={styles.input_field} required></input>

        <label htmlFor="password">Пароль</label>
        <input type='password' name='password' autoComplete={isLogin ? 'current-password' : 'new-password'} required className={styles.input_field}></input>

        {!isLogin && (<>
            <label htmlFor="password">Повторите пароль</label>
            <input type='password' name='password' autoComplete='new-password' required className={styles.input_field}></input>
          </>)}
          
        <button className='button' id={styles.submit_button} type='submit'>{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
      </form>

      <NavLink to={isLogin ? '/register' : '/login'} id={styles.redirect_but}>{isLogin ? 'Ещё нет аккаунта? Регистрируйся' :'Уже есть аккаунт? Заходи'}</NavLink>
    </div>
  );
  //}
}
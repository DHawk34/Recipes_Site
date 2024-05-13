import React, { useEffect, useReducer, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { REDIRECT_QUERY_PARAM_NAME } from '../RequireAuth/RequireAuth'
import styles from './AuthPage.module.css'
import { formToJson } from '@/utils/utils';
import ENDPOINTS from '@/endPoints';
import axios from 'axios';


export function AuthPage() {
  let a = 1

  const location = useLocation();
  const isLogin = location.pathname === "/login"

  const [searchParams] = useSearchParams()
  const redirectAfterLogin = searchParams.get(REDIRECT_QUERY_PARAM_NAME) ?? '/'

  const navigate = useNavigate()

  useEffect(() => {
    document.title = isLogin ? 'Авторизация' : 'Регистрация'
  }, [])

  const regOrLog = (e: React.FormEvent<HTMLFormElement>) => {
    if (isLogin)
      login(e)
    else
      register(e)
  }

  const register = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    var jsonObj = formToJson(formData)
    var json = JSON.stringify(jsonObj);

    axios.post(ENDPOINTS.AUTH.REGISTER, jsonObj).then((response) => {
      console.log(response)
      console.log('registered: ' + jsonObj.username)
      setTimeout(() => navigate(redirectAfterLogin), 1000)
    }).catch(e => {
      console.error(e?.response?.data || e?.message || e)
      // showWarningText(getErrorMessage(e))
    })
  }

  const login = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    var jsonObj = formToJson(formData)
    var json = JSON.stringify(jsonObj);

    console.log(jsonObj)

    axios.post(ENDPOINTS.AUTH.LOGIN, jsonObj, { withCredentials: true }).then((response) => {
      console.log(response)
      console.log('logged in as: ' + jsonObj.username)
      setTimeout(() => navigate(redirectAfterLogin), 1000)
    }).catch(e => {
      console.error(e?.response?.data || e?.message || e)
      // showWarningText(getErrorMessage(e))
    })
  }

  return (
    <div id={styles.registerForm_container}>
      <h2>{isLogin ? 'Авторизация' : 'Регистрация'}</h2>
      <form className={styles.auth_form} autoComplete="on" onSubmit={regOrLog}>
        {!isLogin && (<>
          <label htmlFor="name">Имя</label>
          <input type='text' id='name' name='name' className={styles.input_field} required></input>
        </>)}

        <label htmlFor="username">Логин</label>
        <input type='text' id='username' autoComplete='username' name='username' className={styles.input_field} required></input>

        {!isLogin && (<>
          <label htmlFor="email">Почта</label>
          <input type='email' name='email' id='email' required className={styles.input_field}></input>
        </>)}

        <label htmlFor="password">Пароль</label>
        <input type='password' name='password' autoComplete={isLogin ? 'current-password' : 'new-password'} required className={styles.input_field}></input>

        {!isLogin && (<>
          <label htmlFor="password">Повторите пароль</label>
          <input type='password' name='password' autoComplete='new-password' required className={styles.input_field}></input>
        </>)}

        <button className='button' id={styles.submit_button} type='submit'>{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
      </form>

      <NavLink to={isLogin ? `/register?redirect=${redirectAfterLogin}` : `/login?redirect=${redirectAfterLogin}`} id={styles.redirect_but}>{isLogin ? 'Ещё нет аккаунта? Регистрируйся' : 'Уже есть аккаунт? Заходи'}</NavLink>
    </div>
  );
  //}
}
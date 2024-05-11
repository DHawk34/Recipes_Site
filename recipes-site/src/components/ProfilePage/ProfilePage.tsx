import React, { useEffect, useReducer, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom'
import styles from './Profile.module.css'
import { formToJson } from '@/utils/utils';
import ENDPOINTS from '@/endPoints';


export function ProfilePage() {
  let a = 1

  const location = useLocation();
  const isLogin = location.pathname === "/login"

  useEffect(() => {
    document.title = 'Профиль'
  }, [])

  return (
    <div id={styles.profile_container}>
    </div>
  );
  //}
}
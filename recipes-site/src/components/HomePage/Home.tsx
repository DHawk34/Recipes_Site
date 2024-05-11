import React, { useEffect } from 'react';
import styles from './Home.module.css';
import ENDPOINTS from '@/endPoints';
import RecipeModel from '../../models/recipeModel';
import { useQuery } from 'react-query';
import { Link, NavLink } from 'react-router-dom';
import { addMeta } from '../../utils/utils';
import axios from 'axios';

export function Home() {

  const fetchData = async (method: string) => {
    return axios.get(method)
      .then(res => res.data)
  }

  useEffect(() => {
    document.title = 'Главная'
    addMeta('description', 'Главная')
    addMeta('keywords', 'новинки, кухни мира, группы рецептов')
  }, [])
  //groups
  const { data: recipesCatalogFromServerResponse } = useQuery('catalog_groups', () => fetchData(ENDPOINTS.CATALOG.GROUPS));
  const recipeGroups: Array<RecipeModel> = recipesCatalogFromServerResponse

  //cuisines
  const { data: cuisinesCatalogFromServerResponse } = useQuery('catalog_cuisines', () => fetchData(ENDPOINTS.CATALOG.CUISINES));
  const recipeCuisines: Array<RecipeModel> = cuisinesCatalogFromServerResponse

  //news
  const { data: newsCatalogFromServerResponse } = useQuery('catalog_news', () => fetchData(`${ENDPOINTS.CATALOG.NEWS}?count=4`));
  const recipeNews: Array<RecipeModel> = newsCatalogFromServerResponse


  let groupItems = recipeGroups?.map((recipe: RecipeModel, index: number) => {
    return <Link className={styles.catalog_card} to={`$/recipes/?group=${recipe.groupNavigation.id}`} key={index} >
      <img src={`${ENDPOINTS.IMAGE.GET}?id=${recipe.finishImage}`} alt={recipe.name} />
      <p>{recipe.groupNavigation.name}</p>
    </Link>
  })

  let cuisinesItems = recipeCuisines?.map((recipe: RecipeModel, index: number) => {
    return <Link className={styles.catalog_card} to={`/recipes/?n_cuisine=${recipe.nationalCuisineNavigation.id}`} key={index} >
      <img src={`${ENDPOINTS.IMAGE.GET}?id=${recipe.finishImage}`} alt={recipe.name} />
      <p>{recipe.nationalCuisineNavigation.name}</p>
    </Link>
  })

  let newsItems = recipeNews?.map((recipe: RecipeModel, index: number) => {
    return <Link className={styles.catalog_card} to={`/recipes/${recipe.id}`} key={index} >
      <img src={`${ENDPOINTS.IMAGE.GET}?id=${recipe.finishImage}`} alt={recipe.name} />
      <p>{recipe.name}</p>
    </Link>
  })

  return (
    <div id={styles.home_container}>
      <h3>Новые рецепты</h3>
      <div className={styles.card_grid}>
        {newsItems}
      </div>
      <h3>Группы</h3>
      <div className={styles.card_grid}>
        {groupItems}
      </div>
      <h3>Национальные кухни</h3>
      <div className={styles.card_grid}>
        {cuisinesItems}
      </div>
    </div>
  );

}
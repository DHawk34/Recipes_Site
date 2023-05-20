import React, { useEffect } from 'react';
import styles from './Home.module.css';
import config from '../../config.json'
import RecipeModel from '../../models/recipeModel';
import { useQuery } from 'react-query';
import { Link, NavLink } from 'react-router-dom';

export function Home() {

  const fetchData = async (method: string) => {
    return fetch(config.apiServer + method)
      .then(res => res.json())
  }

  useEffect(() => {
    document.title = 'Главная'
  }, [])
  //groups
  const { data: recipesCatalogFromServerResponse } = useQuery('catalog_groups', () => fetchData('catalog/groups'));
  const recipeGroups: Array<RecipeModel> = recipesCatalogFromServerResponse

  //cuisines
  const { data: cuisinesCatalogFromServerResponse } = useQuery('catalog_cuisines', () => fetchData('catalog/cuisines'));
  const recipeCuisines: Array<RecipeModel> = cuisinesCatalogFromServerResponse

  //news
  const { data: newsCatalogFromServerResponse } = useQuery('catalog_news', () => fetchData('catalog/news?count=4'));
  const recipeNews: Array<RecipeModel> = newsCatalogFromServerResponse


  let groupItems = recipeGroups?.map((recipe: RecipeModel, index: number) => {
    return <Link className={styles.catalog_card} to={`/recipes/?group=${recipe.groupNavigation.id}`} key={index} >
      <img src={config.apiServer + `image?id=${recipe.finishImage}`} alt={recipe.name} />
      <p>{recipe.groupNavigation.name}</p>
    </Link>
  })

  let cuisinesItems = recipeCuisines?.map((recipe: RecipeModel, index: number) => {
    return <Link className={styles.catalog_card} to={`/recipes/?n_cuisine=${recipe.nationalCuisineNavigation.id}`} key={index} >
      <img src={config.apiServer + `image?id=${recipe.finishImage}`} alt={recipe.name} />
      <p>{recipe.nationalCuisineNavigation.name}</p>
    </Link>
  })

  let newsItems = recipeNews?.map((recipe: RecipeModel, index: number) => {
    return <Link className={styles.catalog_card} to={`/recipes/${recipe.id}`} key={index} >
      <img src={config.apiServer + `image?id=${recipe.finishImage}`} alt={recipe.name} />
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
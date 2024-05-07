import React from 'react';
import './App.css';
import { NavPanel } from './components/NavPanel/NavPanel'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Home } from './components/HomePage/Home';
import { Recipes } from './components/RecipesPage/Recipes';
import { NotFound } from './components/NotFoundPage/NotFound';
import { AddRecipe } from './components/AddRecipePage/AddRecipe';
import { Recipe } from './components/RecipePage/Recipe';
import { AuthPage } from './components/AuthPage/AuthPage';
export class App extends React.Component {
  render(): React.ReactNode {
    return (
      <BrowserRouter>
        <NavPanel />

        <Routes>
          <Route path='/' element={<Navigate to='/home' />} />
          <Route path='/home' element={<Home />} />
          <Route path='/recipes' element={<Recipes key='recipes' />} />
          <Route path='/register' element={<AuthPage key='register' />} />
          <Route path='/login' element={<AuthPage key='login' />} />
          <Route path='/recipes/favorite' element={<Recipes key='fav_recipes' />} />
          <Route path='/recipes/:id' element={<Recipe />} />
          <Route path='/recipes/:id/edit' element={<AddRecipe key='editRecipe' />} />
          <Route path='/recipes/new' element={<AddRecipe key='addRecipe' />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

      </BrowserRouter>
    );
  }
}

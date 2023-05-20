import React from 'react';
import './App.css';
import { NavPanel } from './components/NavPanel/NavPanel'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Home } from './components/HomePage/Home';
import { Recipes } from './components/RecipesPage/Recipes';
import { NotFound } from './components/NotFoundPage/NotFound';
import { AddRecipe } from './components/AddRecipePage/AddRecipe';
import { Recipe } from './components/RecipePage/Recipe';
export class App extends React.Component {
  render(): React.ReactNode {
    return (
      <BrowserRouter>
        <NavPanel />

        <Routes>
          <Route path='/' element={<Navigate to='/home' />} />
          <Route path='/home' element={<Home />} />
          <Route path='/recipes' element={<Recipes />} />
          <Route path='/recipes/:id' element={<Recipe />} />
          <Route path='/recipes/new' element={<AddRecipe />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

      </BrowserRouter>
    );
  }
}

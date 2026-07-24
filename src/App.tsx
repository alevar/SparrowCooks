import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Home from './components/Home/Home';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import RecipeDetail from './components/RecipeDetail/RecipeDetail';

const Layout: React.FC = () => (
  <>
    <Header />
    <Outlet /> {/* This will render the matched child route component */}
    <Footer />
  </>
);

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/recipes/:recipeId', element: <RecipeDetail /> },
    ]
  }
];

const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;

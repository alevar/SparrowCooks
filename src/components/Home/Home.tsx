import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Clock } from 'react-bootstrap-icons';
import RecipeFilter from '../RecipeFilter/RecipeFilter';
import "./Home.css";

interface Recipe {
  id: string;
  title: string;
  description: string;
  date: string;
  thumbnail: string;
  tags: string[];
}

const Home: React.FC = () => {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch recipes from GitHub
    const fetchRecipes = async () => {
      try {
        // This would be replaced with your GitHub API call
        // For demonstration, we'll use sample data
        
        const sampleRecipes: Recipe[] = [
          {
            id: 'chocolate-cake',
            title: 'Chocolate Cake',
            description: 'Rich and moist chocolate cake with ganache frosting',
            date: '2025-03-28',
            thumbnail: `${import.meta.env.BASE_URL}recipes/chocolate-cake/assets/thumbnail.png`,
            tags: ['dessert', 'chocolate', 'baking']
          },
          {
            id: 'pasta-carbonara',
            title: 'Pasta Carbonara',
            description: 'Classic Italian pasta with egg, cheese, and pancetta',
            date: '2025-03-15',
            thumbnail: `${import.meta.env.BASE_URL}recipes/pasta-carbonara/assets/thumbnail.png`,
            tags: ['pasta', 'italian', 'dinner']
          },
          {
            id: 'avocado-toast',
            title: 'Avocado Toast',
            description: 'Simple and nutritious breakfast with avocado and sourdough',
            date: '2025-03-01',
            thumbnail: `${import.meta.env.BASE_URL}recipes/avocado-toast/assets/thumbnail.png`,
            tags: ['breakfast', 'healthy', 'quick']
          }
        ];
        
        // Sort recipes by date (newest first)
        const sortedRecipes = sampleRecipes.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setAllRecipes(sortedRecipes);
        setFilteredRecipes(sortedRecipes);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load recipes');
        setIsLoading(false);
        console.error('Error fetching recipes:', err);
      }
    };

    fetchRecipes();
  }, []);

  const handleFilterChange = (recipes: Recipe[]) => {
    setFilteredRecipes(recipes);
  };

  if (isLoading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4 text-center">My Cooking Adventures</h1>
      <p className="lead text-center mb-5">
        A collection of my favorite recipes and cooking experiments
      </p>
      
      {/* Recipe Filter Component */}
      <RecipeFilter recipes={allRecipes} onFilterChange={handleFilterChange} />
      
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredRecipes.map(recipe => (
          <Col key={recipe.id}>
            <Card className="h-100 shadow-sm hover-shadow">
              <Card.Img 
                variant="top" 
                src={recipe.thumbnail} 
                alt={recipe.title}
                style={{ height: '200px', objectFit: 'cover' }} 
              />
              <Card.Body>
                <Card.Title>{recipe.title}</Card.Title>
                <Card.Text>{recipe.description}</Card.Text>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <small className="text-muted">
                    <Clock className="me-1" />
                    {new Date(recipe.date).toLocaleDateString()}
                  </small>
                  <div>
                    {recipe.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="badge bg-light text-dark me-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Card.Body>
              <Card.Footer className="bg-white border-0">
                <Link 
                  to={`/recipes/${recipe.id}`} 
                  className="btn btn-outline-primary w-100"
                >
                  View Recipe
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
      
      {filteredRecipes.length === 0 && (
        <div className="text-center my-5">
          <p className="text-muted">No recipes found matching your criteria.</p>
          {allRecipes.length > 0 && (
            <button 
              className="btn btn-outline-secondary mt-2"
              onClick={() => setFilteredRecipes(allRecipes)}
            >
              Show All Recipes
            </button>
          )}
        </div>
      )}
    </Container>
  );
};

export default Home;
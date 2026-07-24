// src/components/Home/Home.tsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Clock } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import * as commons from '../../utils/common';
import "./Home.css";

const Home: React.FC = () => {
  const [allRecipes, setAllRecipes] = useState<commons.Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const recipes = await commons.fetchAllRecipes();
        setAllRecipes(recipes);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load recipes:', error);
        setError('Failed to load recipes from GitHub. Please try again later.');
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, []);

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
      <h1 className="mb-4 text-center">SparrowCooks</h1>
      <p className="lead text-center mb-5">
        A collection of favorite recipes and cooking experiments
      </p>

      <Row xs={1} md={2} lg={3} className="g-4">
        {allRecipes.map(recipe => (
          <Col key={recipe.id}>
            <Card className="h-100 shadow-sm hover-shadow">
              {recipe.thumbnail && (
                <Card.Img
                  variant="top"
                  src={recipe.thumbnail}
                  alt={recipe.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <Card.Body>
                <Card.Title>{recipe.title}</Card.Title>
                <Card.Text>{recipe.description}</Card.Text>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <small className="text-muted">
                    <Clock className="me-1" /> {new Date(recipe.date).toLocaleDateString()}
                  </small>
                  <div>
                    {recipe.tags.map(tag => (
                      <span key={tag} className="badge bg-light text-dark me-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Card.Body>
              <Card.Footer className="bg-white border-0">
                <Link to={`/recipes/${recipe.id}`} className="btn btn-outline-primary w-100">
                  View Recipe
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Home;
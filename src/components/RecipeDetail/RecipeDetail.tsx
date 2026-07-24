import React, { useState, useEffect } from "react";
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { Clock, ArrowLeft } from 'react-bootstrap-icons';
import * as commons from '../../utils/common';
import ReactMarkdown from 'react-markdown';
import ImageCarousel from "../ImageCarousel/ImageCarousel";
import "./RecipeDetail.css";

const RecipeDetail: React.FC = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const [recipe, setRecipe] = useState<commons.Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecipe = async () => {
      if (!recipeId) {
        setError('Recipe not found');
        setIsLoading(false);
        return;
      }

      try {
        const recipeData = await commons.fetchRecipeById(recipeId);
        if (!recipeData) {
          setError('Recipe not found');
          setIsLoading(false);
          return;
        }
        setRecipe(recipeData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load recipe:', error);
        setError('Failed to load recipe. Please try again later.');
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    loadRecipe();
  }, [recipeId]);

  if (isLoading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (error || !recipe) {
    return (
      <Container className="my-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Recipe not found'}
        </div>
        <Link to="/" className="btn btn-primary mt-3">
          <ArrowLeft className="me-2" /> Back to Recipes
        </Link>
      </Container>
    );
  }

  const splitContent = (markdown: string): (string | JSX.Element)[] => {
    const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g;
    const lines = markdown.split('\n');
    const result: (string | JSX.Element)[] = [];

    let buffer: string[] = [];
    let imageGroup: { src: string; alt: string }[] = [];

    const flushText = () => {
      if (buffer.length > 0) {
        result.push(buffer.join('\n'));
        buffer = [];
      }
    };

    const flushImages = () => {
      if (imageGroup.length > 0) {
        result.push(<ImageCarousel images={imageGroup} key={result.length} />);
        imageGroup = [];
      }
    };

    for (const line of lines) {
      const match = [...line.matchAll(imageRegex)];
      if (match.length > 0 && line.trim() === match.map(m => m[0]).join('').trim()) {
        // Line contains only image(s)
        flushText();
        match.forEach(m => {
          imageGroup.push({ alt: m[1], src: m[2] });
        });
      } else {
        flushImages();
        buffer.push(line);
      }
    }

    flushText();
    flushImages();

    return result;
  };

  const renderedContent = splitContent(recipe.content || '');

  return (
    <Container className="my-5 recipe-detail">
      <Link to="/" className="btn btn-outline-secondary mb-4">
        <ArrowLeft className="me-2" /> Back to Recipes
      </Link>
      
      <Row className="mb-4">
        <Col>
          <h1 className="mb-3">{recipe.title}</h1>
          
          <div className="d-flex flex-wrap align-items-center mb-3">
            <div className="me-3 text-muted">
              <Clock className="me-1" /> {new Date(recipe.date).toLocaleDateString()}
            </div>
            <div>
              {recipe.tags.map(tag => (
                <Badge bg="light" text="dark" key={tag} className="me-2 mb-2">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <p className="lead">{recipe.description}</p>
        </Col>
      </Row>
      
      <Row>
        <Col className="recipe-content">
          {renderedContent.map((block, index) =>
            typeof block === 'string' ? (
              <ReactMarkdown
                key={index}
                components={{
                  h2: ({ node, ...props }) => (
                    <h2 className="mt-5 mb-3" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="mt-4 mb-3" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="mb-3" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="mb-4" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="mb-4" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="mb-2" {...props} />
                  ),
                }}
              >
                {block}
              </ReactMarkdown>
            ) : (
              block // JSX <ImageCarousel />
            )
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default RecipeDetail;

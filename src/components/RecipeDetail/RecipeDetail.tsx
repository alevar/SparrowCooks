import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Card, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Github } from 'react-bootstrap-icons';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import GitHubComments from '../GitHubComments/GitHubComments';

// ... rest of the component as before ...

const RecipeDetail: React.FC = () => {
  // ... existing code ...

  return (
    <Container className="my-5">
      {/* ... existing code ... */}
      
      <div 
        ref={contentRef} 
        className="recipe-content" 
        dangerouslySetInnerHTML={{ __html: processContent() }}
      />
      
      {/* GitHub Comments Integration */}
      <Row className="mt-5">
        <Col>
          <GitHubComments 
            owner="yourusername" 
            repo="yourrepo" 
            recipeId={recipeId || ''} 
            recipeTitle={recipe?.title || ''}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default RecipeDetail;
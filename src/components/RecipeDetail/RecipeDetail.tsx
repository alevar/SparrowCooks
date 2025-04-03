import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { Clock, ArrowLeft, Calendar, People, Star } from 'react-bootstrap-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './RecipeDetail.css';

interface RecipeParams {
  id: string;
}

interface RecipeFrontmatter {
  title: string;
  description: string;
  date: string;
  tags: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  difficulty?: string;
}

const RecipeDetail: React.FC = () => {
  const { id } = useParams<RecipeParams>();
  const [markdown, setMarkdown] = useState<string>('');
  const [frontmatter, setFrontmatter] = useState<RecipeFrontmatter | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // GitHub repository information
        const username = 'your-github-username'; // Replace with your GitHub username
        const repo = 'cooking-blog'; // Replace with your repository name

        // Fetch README.md for the recipe
        const readmeURL = `https://raw.githubusercontent.com/${username}/${repo}/main/recipes/${id}/README.md`;
        const response = await fetch(readmeURL);

        if (!response.ok) {
          throw new Error(`Could not fetch recipe: ${response.status}`);
        }

        const content = await response.text();

        // Parse frontmatter from markdown
        const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);

        if (match) {
          const frontmatterText = match[1];
          const bodyText = match[2];

          // Parse frontmatter into key-value pairs
          const attributes: Record<string, any> = {};
          frontmatterText.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length) {
              const value = valueParts.join(':').trim();

              // Parse arrays (tags)
              if (value.startsWith('[') && value.endsWith(']')) {
                attributes[key.trim()] = value
                  .substring(1, value.length - 1)
                  .split(',')
                  .map(item => item.trim());
              } else {
                attributes[key.trim()] = value;
              }
            }
          });

          setFrontmatter(attributes as RecipeFrontmatter);
          
          // Process image paths in markdown to use correct BASE_URL
          const processedMarkdown = bodyText.replace(
            /!\[(.*?)\]\((\.\/assets\/.*?)\)/g, 
            `![$1](${import.meta.env.BASE_URL}recipes/${id}/$2)`
          );
          
          setMarkdown(processedMarkdown);
        } else {
          setMarkdown(content);
        }

        setIsLoading(false);
      } catch (err) {
        setError('Failed to load recipe');
        setIsLoading(false);
        console.error('Error fetching recipe:', err);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  if (isLoading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          {error}
        </Alert>
        <div className="text-center mt-4">
          <Link to="/" className="btn btn-outline-primary">
            <ArrowLeft className="me-2" />
            Back to Recipes
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-5 recipe-detail">
      <Link to="/" className="btn btn-outline-secondary mb-4">
        <ArrowLeft className="me-2" />
        Back to Recipes
      </Link>

      {frontmatter && (
        <div className="recipe-header mb-4">
          <h1 className="mb-3">{frontmatter.title}</h1>
          <p className="lead">{frontmatter.description}</p>
          
          <div className="recipe-meta d-flex flex-wrap gap-3 mb-4">
            {frontmatter.date && (
              <div className="recipe-meta-item">
                <Calendar className="me-1" />
                <span>Published: {new Date(frontmatter.date).toLocaleDateString()}</span>
              </div>
            )}
            
            {frontmatter.prepTime && (
              <div className="recipe-meta-item">
                <Clock className="me-1" />
                <span>Prep: {frontmatter.prepTime}</span>
              </div>
            )}
            
            {frontmatter.cookTime && (
              <div className="recipe-meta-item">
                <Clock className="me-1" />
                <span>Cook: {frontmatter.cookTime}</span>
              </div>
            )}
            
            {frontmatter.servings && (
              <div className="recipe-meta-item">
                <People className="me-1" />
                <span>Serves: {frontmatter.servings}</span>
              </div>
            )}
            
            {frontmatter.difficulty && (
              <div className="recipe-meta-item">
                <Star className="me-1" />
                <span>Difficulty: {frontmatter.difficulty}</span>
              </div>
            )}
          </div>
          
          <div className="recipe-tags mb-4">
            {frontmatter.tags && frontmatter.tags.map(tag => (
              <Badge 
                key={tag} 
                bg="light" 
                text="dark" 
                className="me-2 p-2"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="recipe-content">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeRaw]}
          components={{
            img: ({ node, ...props }) => (
              <img 
                className="img-fluid rounded my-3" 
                {...props} 
                alt={props.alt || 'Recipe image'} 
              />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="mt-4 mb-3" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="my-3" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="my-3" {...props} />
            )
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
      
      <div className="text-center mt-5">
        <Link to="/" className="btn btn-outline-primary">
          <ArrowLeft className="me-2" />
          Back to All Recipes
        </Link>
      </div>
    </Container>
  );
};

export default RecipeDetail;
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

// Function to parse frontmatter from markdown content
const parseFrontmatter = (content: string) => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { attributes: {}, body: content };
  }
  
  const frontmatter = match[1];
  const body = match[2];
  
  // Parse frontmatter into key-value pairs
  const attributes: Record<string, any> = {};
  frontmatter.split('\n').forEach(line => {
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
  
  return { attributes, body };
};

const Home: React.FC = () => {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch recipes from GitHub
    const fetchRecipes = async () => {
      try {
        // GitHub repository information
        const username = 'your-github-username'; // Replace with your GitHub username
        const repo = 'cooking-blog'; // Replace with your repository name
        
        // Fetch recipe directories from GitHub
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/recipes`);
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const directories = await response.json();
        
        // Process each recipe directory
        const recipes = await Promise.all(directories
          .filter((item: any) => item.type === 'dir')
          .map(async (dir: any) => {
            // Fetch README.md for each recipe
            const readmeURL = `https://raw.githubusercontent.com/${username}/${repo}/main/recipes/${dir.name}/README.md`;
            const readmeResponse = await fetch(readmeURL);
            
            if (!readmeResponse.ok) {
              console.warn(`Could not fetch README for ${dir.name}`);
              return null;
            }
            
            const content = await readmeResponse.text();
            
            // Parse frontmatter from markdown
            const { attributes, body } = parseFrontmatter(content);
            
            return {
              id: dir.name,
              title: attributes.title || dir.name,
              description: attributes.description || '',
              date: attributes.date || new Date().toISOString(),
              thumbnail: `${import.meta.env.BASE_URL}recipes/${dir.name}/assets/thumbnail.png`,
              tags: attributes.tags || []
            };
          }));
        
        // Filter out any null values (failed fetches)
        const validRecipes = recipes.filter(recipe => recipe !== null) as Recipe[];
        
        // Sort recipes by date (newest first)
        const sortedRecipes = validRecipes.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setAllRecipes(sortedRecipes);
        setFilteredRecipes(sortedRecipes);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load recipes');
        setIsLoading(false);
        console.error('Error fetching recipes:', err);
    
        setAllRecipes([]);
        setFilteredRecipes([]);
        setIsLoading(false);
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
import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Row, Col, Badge, Button } from 'react-bootstrap';
import { Search, XCircle, Tag } from 'react-bootstrap-icons';

interface RecipeFilterProps {
  recipes: any[];
  onFilterChange: (filteredRecipes: any[]) => void;
}

const RecipeFilter: React.FC<RecipeFilterProps> = ({ recipes, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // Extract all unique tags from recipes
  useEffect(() => {
    if (recipes && recipes.length > 0) {
      const allTags = recipes.flatMap(recipe => recipe.tags || []);
      const uniqueTags = [...new Set(allTags)].sort();
      setAvailableTags(uniqueTags);
    }
  }, [recipes]);
  
  // Filter recipes whenever search term or selected tags change
  useEffect(() => {
    const filterRecipes = () => {
      if (!recipes) return [];
      
      return recipes.filter(recipe => {
        // Filter by search term
        const matchesSearch = searchTerm === '' || 
          recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
          
        // Filter by selected tags
        const matchesTags = selectedTags.length === 0 || 
          selectedTags.every(tag => recipe.tags && recipe.tags.includes(tag));
          
        return matchesSearch && matchesTags;
      });
    };
    
    const filteredRecipes = filterRecipes();
    onFilterChange(filteredRecipes);
  }, [searchTerm, selectedTags, recipes, onFilterChange]);
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag)
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag]
    );
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };
  
  return (
    <div className="mb-4">
      <Row>
        <Col md={8}>
          <Form.Group>
            <InputGroup>
              <InputGroup.Text>
                <Search />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search recipes by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search recipes"
              />
              {(searchTerm || selectedTags.length > 0) && (
                <Button 
                  variant="outline-secondary"
                  onClick={clearFilters}
                >
                  <XCircle />
                </Button>
              )}
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>
      
      {availableTags.length > 0 && (
        <div className="mt-3">
          <div className="d-flex align-items-center mb-2">
            <Tag className="me-2" />
            <span>Filter by tags:</span>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <Badge
                key={tag}
                bg={selectedTags.includes(tag) ? "primary" : "light"}
                text={selectedTags.includes(tag) ? "white" : "dark"}
                className="px-3 py-2 cursor-pointer"
                style={{ cursor: 'pointer' }}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && (
                  <XCircle className="ms-1" size={12} />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeFilter;
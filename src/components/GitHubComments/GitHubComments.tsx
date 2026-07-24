import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { Github, ChatFill, Person, Calendar } from 'react-bootstrap-icons';

interface Comment {
  id: number;
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  created_at: string;
  body: string;
  html_url: string;
}

interface GitHubCommentsProps {
  owner: string;
  repo: string;
  recipeId: string;
  recipeTitle: string;
}

const GitHubComments: React.FC<GitHubCommentsProps> = ({ owner, repo, recipeId, recipeTitle }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [issueNumber, setIssueNumber] = useState<number | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        
        // First, search for an issue with the recipe name
        const searchResponse = await fetch(
          `https://api.github.com/search/issues?q=repo:${owner}/${repo}+label:recipe-comment+${recipeId}+in:title`
        );
        
        if (!searchResponse.ok) {
          throw new Error('Failed to search for recipe issue');
        }
        
        const searchData = await searchResponse.json();
        
        // If an issue exists for this recipe
        if (searchData.items && searchData.items.length > 0) {
          const issue = searchData.items[0];
          setIssueNumber(issue.number);
          
          // Fetch comments for this issue
          const commentsResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/issues/${issue.number}/comments`
          );
          
          if (!commentsResponse.ok) {
            throw new Error('Failed to fetch comments');
          }
          
          const commentsData = await commentsResponse.json();
          setComments(commentsData);
        } else {
          // No issue exists yet for this recipe
          setComments([]);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('Error loading comments');
        setIsLoading(false);
        console.error('Error fetching comments:', err);
      }
    };
    
    fetchComments();
  }, [owner, repo, recipeId]);

  const handleNewComment = () => {
    // If an issue already exists, direct to that issue
    if (issueNumber) {
      window.open(
        `https://github.com/${owner}/${repo}/issues/${issueNumber}#new_comment_field`,
        '_blank'
      );
    } else {
      // Create a new issue
      const title = `Comments for recipe: ${recipeTitle} [${recipeId}]`;
      const body = `This issue is for comments on the recipe "${recipeTitle}". Please add your comments below!`;
      const labels = 'recipe-comment';
      
      window.open(
        `https://github.com/${owner}/${repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent(labels)}`,
        '_blank'
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Function to render Markdown content
  const renderMarkdown = (text: string) => {
    // In a full implementation, you would use a Markdown renderer here
    // For simplicity, we'll just return the plain text in this example
    return text;
  };

  return (
    <div className="my-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <ChatFill className="me-2" />
            Comments ({comments.length})
          </h5>
          <Button 
            variant="outline-primary" 
            onClick={handleNewComment}
          >
            <Github className="me-1" />
            {issueNumber ? 'Add Comment' : 'Start Discussion'}
          </Button>
        </Card.Header>
        
        <Card.Body>
          {isLoading ? (
            <div className="text-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading comments...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : comments.length === 0 ? (
            <div className="text-center my-4">
              <p className="text-muted">No comments yet. Be the first to comment!</p>
              <p className="small">Comments are powered by GitHub Issues.</p>
            </div>
          ) : (
            <div className="comments-list">
              {comments.map(comment => (
                <Card key={comment.id} className="mb-3">
                  <Card.Header className="bg-light">
                    <div className="d-flex align-items-center">
                      <img 
                        src={comment.user.avatar_url} 
                        alt={comment.user.login}
                        className="rounded-circle me-2"
                        width="32"
                        height="32"
                      />
                      <div>
                        <a 
                          href={comment.user.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="fw-bold text-decoration-none"
                        >
                          {comment.user.login}
                        </a>
                        <div className="text-muted small">
                          <Calendar className="me-1" />
                          {formatDate(comment.created_at)}
                        </div>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div className="comment-content">
                      {renderMarkdown(comment.body)}
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-white text-end">
                    <a 
                      href={comment.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-link text-decoration-none"
                    >
                      View on GitHub
                    </a>
                  </Card.Footer>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
        
        {issueNumber && (
          <Card.Footer className="bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Comments are powered by GitHub Issues
              </small>
              <a
                href={`https://github.com/${owner}/${repo}/issues/${issueNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-secondary"
              >
                View All on GitHub
              </a>
            </div>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
};

export default GitHubComments;
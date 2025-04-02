import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <div className="bg-light border-top">
            <footer className="footer mt-auto py-3">
                <Container>
                    <Row className="align-items-center">
                        
                        <Col md={4} className="text-center">
                            <ul className="nav">
                                <li className="nav-item">
                                    <Link to="/" className="nav-link px-2 text-body-secondary">Home</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/contact" className="nav-link px-2 text-body-secondary">Contact Us</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/about" className="nav-link px-2 text-body-secondary">About</Link>
                                </li>
                            </ul>

                        </Col>

                        <Col md={3}>
                            <a href="/privacy-policy">Privacy Policy</a> | <a href="/terms-of-service">Terms of Service</a>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </div>
    );
};

export default Footer;

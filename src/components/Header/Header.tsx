import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import 'bootstrap-icons/font/bootstrap-icons.css';

import sparrow_logo from '../../assets/sparrow.logo.svg';

import './Header.css';

const Header: React.FC = () => {

    return (
        <div className="bg-light border-bottom shadow-sm">
            <header className="header py-3">
                <Container>
                    <Row className="align-items-center">
                        <Col md={4}>
                            <Link to="https://alevar.github.io" className="d-flex align-items-center">
                                <div>
                                    <img src={sparrow_logo} alt="Ales Varabyou Logo" style={{ height: '80px', marginRight: '15px' }} />
                                </div>
                                <h1 className="text-dark text-center" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}></h1>
                            </Link>
                        </Col>
                    </Row>
                </Container>
            </header>
        </div>
    );
};

export default Header;

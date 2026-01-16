import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero" id="home">
            <div className="hero-content">
                <h1 className="hero-title">
                    The Future of <br />
                    <span className="text-highlight">Customer Service</span>
                </h1>
                <p className="hero-subtitle">
                    Join the revolution with Amber. Experience the power of AI-driven support
                    in a stunning, immersive environment.
                </p>
                <div className="hero-cta">
                    <button className="btn btn-primary">Get Started</button>
                    <button className="btn btn-outline">Learn More</button>
                </div>
            </div>
            <div className="hero-background">
                <div className="glow glow-1"></div>
                <div className="glow glow-2"></div>
            </div>
        </section>
    );
};

export default Hero;

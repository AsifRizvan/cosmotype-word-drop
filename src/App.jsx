import React, { useEffect } from 'react';
import './App.css';
import GameBoard from './Components/GameBoard';

const App = () => {
    useEffect(() => {
        const starContainer = document.querySelector('.starry-background');
        const starCount = 100; // Adjust for more or fewer stars

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.classList.add('star');

            // Randomize star position and animation duration
            star.style.left = `${Math.random() * 100}vw`;
            star.style.top = `${Math.random() * -100}vh`; // Start above the viewport
            star.style.animationDuration = `${5 + Math.random() * 5}s`; // Between 5s and 10s

            starContainer.appendChild(star);
        }
    }, []);

    return (
        <div className="App">
            <div className="starry-background"></div>
            <GameBoard />
        </div>
    );
};

export default App;

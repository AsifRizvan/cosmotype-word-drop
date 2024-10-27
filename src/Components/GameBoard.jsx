import React, { useEffect, useRef, useState } from 'react';
import HUD from './HUD';
import { words } from './Word';

function GameBoard() {
    const [score, setScore] = useState(0);
    const [wave, setWave] = useState(1);
    const [input, setInput] = useState("");
    const [fallingWords, setFallingWords] = useState([]);
    const [usedWords, setUsedWords] = useState(new Set());
    const [gameStarted, setGameStarted] = useState(false);
    const [showWaveIndicator, setShowWaveIndicator] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [fadeOut, setFadeOut] = useState(false); // For fade effect on start button
    const [fadeOutWelcome, setFadeOutWelcome] = useState(false);
    const [currentStarCount, setCurrentStarCount] = useState(0);
    const maxStars = 1; // Set the maximum number of stars
    
    const inputRef = useRef(null);

    useEffect(() => {
        if (gameStarted) {
            startWave();
        }
    }, [wave, gameStarted]);

    useEffect(() => {
        const checkFallingWords = setInterval(() => {
            const fallingElements = document.querySelectorAll('.falling-word');
            fallingElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const endpoint = document.querySelector('.endpoint-line').getBoundingClientRect();

                if (rect.bottom >= endpoint.top) {
                    setGameOver(true);
                }
            });
        }, 100);

        return () => clearInterval(checkFallingWords);
    }, [fallingWords, score]);

    useEffect(() => {
        const starContainer = document.querySelector('.starry-background');
        
        function createStar() {
            if (currentStarCount >= maxStars) return; // Limit the number of stars
        
            const star = document.createElement('div');
            star.className = 'star';
        
            // Set random position and animation duration
            const xPos = Math.random() * 10; // Random position in percentage
            const duration = Math.random() * 3 + 2; // Random duration between 2s and 5s
            const delay = Math.random() * 5; // Random delay for staggered falling
        
            star.style.left = `${xPos}vw`; // Set horizontal position
            star.style.animationDuration = `${duration}s`; // Set falling speed
            star.style.animationDelay = `${delay}s`; // Delay for staggered effect
        
            starContainer.appendChild(star); // Add star to the container
            setCurrentStarCount(prev => prev + 1); // Increase the star count
        
            // Remove star after it falls
            setTimeout(() => {
                star.remove();
                setCurrentStarCount(prev => prev - 1); // Decrease the star count when the star is removed
            }, (duration + delay) * 1000); // Remove after the fall
        }

        // Create one star every 1000 ms (1 second)
        const starCreationInterval = setInterval(createStar, 1000);

        return () => clearInterval(starCreationInterval); // Clean up interval on component unmount
    }, [currentStarCount, maxStars]); // Add dependencies for useEffect

    const resetGame = () => {
        setScore(0);
        setWave(1);
        setInput("");
        setFallingWords([]);
        setUsedWords(new Set());
        setGameStarted(false);
        setGameOver(false);
    };

    const startGame = () => {
        resetGame();
        setFadeOutWelcome(true);
        setFadeOut(true); // Start fading out the button
        setTimeout(() => {
            setGameStarted(true);
            setFadeOut(false); 
            setFadeOutWelcome(false);// Fade out completed
            setShowWaveIndicator(false);
            inputRef.current.focus();
            startWave(1);
        }, 1000); // Wait for fade out to complete before starting the game
    };

    const generateUniqueWord = () => {
        let word;
        do {
            word = words[Math.floor(Math.random() * words.length)];
        } while (usedWords.has(word) || fallingWords.some(({ word: fallingWord }) => fallingWord === word));
    
        setUsedWords(prev => new Set(prev).add(word));
        return word;
    };

    const startWave = (waveNo) => {
        const newWordsCount = waveNo === 1 ? 1 : waveNo; // Ensures only 1 word for wave 1
        let wordIndex = 0;
    
        setShowWaveIndicator(true);
        setTimeout(() => {
            setShowWaveIndicator(false);
            spawnWords(newWordsCount, wordIndex);
        }, 2000);
    };
    
    const spawnWords = (newWordsCount, wordIndex) => {
        const spawnWord = () => {
            if (wordIndex < newWordsCount) {
                const newWord = {
                    word: generateUniqueWord(),
                    position: 10 + Math.random() * 50,
                    duration: 10 + Math.random() * 1
                };
    
                setFallingWords(prevWords => [...prevWords, newWord]);
                wordIndex++;
    
                setTimeout(spawnWord, 1000);
            }
        };
    
        spawnWord();
    };

    const handleInputChange = (e) => {
        const inputValue = e.target.value.trim().toLowerCase();
        setInput(inputValue);

        if (fallingWords.some(({ word }) => word.toLowerCase() === inputValue)) {
            setScore(score + 10);
            setFallingWords(prevWords => prevWords.filter(({ word }) => word.toLowerCase() !== inputValue));
            setInput('');
        }

        if (fallingWords.length === 1 && fallingWords[0].word.toLowerCase() === inputValue) {
            setWave(prevWave => prevWave + 1);
            startWave(wave + 1);
        }
    };

    const handlePlayAgain = () => { // Reset the game state and start a new game
        setGameOver(false);
        inputRef.current.focus();
        setWave(1)
        setScore(0);
        setInput("");
        setFallingWords([]);
        setUsedWords(new Set());
        startWave(1);
    };

    const handleQuit = () => {
        resetGame(); // Reset the game state and go back to the welcome message
    };

    return (
        <>
            <div className="starry-background"></div>

            <div className="game-board">
                {!gameStarted && !gameOver && (
                   <div className={`welcome-message ${fadeOutWelcome ? 'fade-out' : ''}`} style={{marginLeft:'20px', textAlign:'center'}}>
                   <h1>Welcome to the Universe!</h1>
                   <button className='start-button' onClick={startGame}>Start Game</button>
               </div>
                )}
                
                <HUD 
                    score={score} 
                    wave={wave} 
                    input={input} 
                    handleInputChange={handleInputChange} 
                    onStartGame={startGame} 
                />
                
                {showWaveIndicator && (
                    <div className="wave-indicator fade-in-out">Wave {wave}</div>
                )}
                
                {gameOver && (
                    <div className="game-over-message" >
                        <h2>Game Over!</h2>
                        <p style={{marginTop:'15px'}}>Your Score:{score}</p>
                        <button className="play-again-button" style={{marginRight:'20px'}} onClick={handlePlayAgain}>Play Again</button>
                        <button className="quit-button" onClick={handleQuit}>Quit</button>
                    </div>
                )}
                
                <div className="endpoint-line"></div>
                
                {fallingWords.map((fallingWord) => (
                    <div 
                        key={fallingWord.word}
                        className="falling-word"
                        style={{
                            left: `${fallingWord.position}%`,
                            animationDuration: `${fallingWord.duration}s`
                        }}
                    >
                        {fallingWord.word}
                    </div>
                ))}
                
                <div className="input-container">
                    <input
                        ref={inputRef}
                        className="game-input"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type the word here..."
                    />
                </div>
            </div>
        </>
    );
}

export default GameBoard;

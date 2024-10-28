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

    const generateUniqueWordsForWave = (newWordsCount) => {
        const uniqueWords = new Set(); // Use a Set to ensure uniqueness
        let attempts = 0; // Track the number of attempts to generate unique words
        const maxAttempts = words.length * 2; // Allow a reasonable number of attempts
    
        while (uniqueWords.size < newWordsCount && attempts < maxAttempts) {
            const word = words[Math.floor(Math.random() * words.length)];
            if (!usedWords.has(word)) { // Ensure the word hasn't been used yet
                uniqueWords.add(word);
            }
            attempts++;
        }
    
        // Check if we ran out of unique words
        if (uniqueWords.size < newWordsCount) {
            alert("Not enough unique words available! Please reset the game or add more words."); // Alert the user
          
        }
    
        // Add the new unique words to the usedWords set
        uniqueWords.forEach(word => {
            setUsedWords(prev => {
                const updatedSet = new Set(prev);
                updatedSet.add(word);
                return updatedSet;
            });
        });
    
        return Array.from(uniqueWords); // Convert the Set back to an array
    };
    
    
    const startWave = (waveNo) => {
        // const newWordsCount = waveNo === 1 ? 1 : waveNo; // Ensures only 1 word for wave 1
        const newWordsCount = 2 + (waveNo - 1); // Ensures only 1 word for wave 1
        const uniqueWordsForWave = generateUniqueWordsForWave(newWordsCount); // Get unique words for this wave
        let wordIndex = 0;
        
        setShowWaveIndicator(true);
        setTimeout(() => {
            setShowWaveIndicator(false);
            spawnWords(uniqueWordsForWave, wordIndex); // Pass the words to spawnWords
        }, 2000);
    };
    
    const spawnWords = (wordsArray, wordIndex) => {
        const spawnWord = () => {
            if (wordIndex < wordsArray.length) {
                const newWord = {
                    word: wordsArray[wordIndex], // Use the pre-generated word
                    position: 10 + Math.random() * 50,
                    duration: 25 + Math.random() * 1
                };
    
                setFallingWords(prevWords => [...prevWords, newWord]);
                wordIndex++;
    
                setTimeout(spawnWord, 1000); // Drop the next word after 1 second
            }
        };
    
        spawnWord();
    };

    const handleInputChange = (e) => {
        const inputValue = e.target.value.trim().toLowerCase();
        setInput(inputValue);
    
        // Filter out all matching words instead of just one instance
        const wordMatches = fallingWords.filter(({ word }) => word.toLowerCase() === inputValue);
        
        if (wordMatches.length > 0) {
            // Update the score for each matching word and remove them from the screen
            setScore(score + (10 * wordMatches.length));
            setFallingWords(prevWords => prevWords.filter(({ word }) => word.toLowerCase() !== inputValue));
            setInput('');
        }
    
        // Trigger the next wave if the last word in the wave has been typed correctly
        if (fallingWords.length === 1 && wordMatches.length === 1) {
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
        setUsedWords(new Set()); // Clear used words for a fresh game
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

// HUD.js
import React from 'react';

function HUD({ score, wave }) {
    return (
        <div className="hud d-flex justify-content-between">
            <div className="hud-item">Score : {score}</div>
            <div className="hud-item">Wave : {wave}</div>
        </div>
    );
}

export default HUD;

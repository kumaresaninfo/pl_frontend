import { useState, useRef, useEffect } from 'react';

const PatternLock = ({ onPatternComplete, title = "Draw Your Pattern", minLength = 4 }) => {
  const [pattern, setPattern] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dotPositions, setDotPositions] = useState([]);

  useEffect(() => {
    // Calculate dot positions after component mounts
    const updateDotPositions = () => {
      if (containerRef.current) {
        const dots = containerRef.current.querySelectorAll('.pattern-dot');
        const positions = Array.from(dots).map(dot => {
          const rect = dot.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          return {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2
          };
        });
        setDotPositions(positions);
      }
    };

    updateDotPositions();
    window.addEventListener('resize', updateDotPositions);
    return () => window.removeEventListener('resize', updateDotPositions);
  }, []);

  useEffect(() => {
    drawPattern();
  }, [pattern, dotPositions]);

  const drawPattern = () => {
    const canvas = canvasRef.current;
    if (!canvas || dotPositions.length === 0) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (pattern.length < 2) return;

    // Draw lines between connected dots
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Add glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#667eea';

    ctx.beginPath();
    ctx.moveTo(dotPositions[pattern[0]].x, dotPositions[pattern[0]].y);

    for (let i = 1; i < pattern.length; i++) {
      ctx.lineTo(dotPositions[pattern[i]].x, dotPositions[pattern[i]].y);
    }

    ctx.stroke();
  };

  const handleDotMouseDown = (index) => {
    if (!pattern.includes(index)) {
      setPattern([index]);
      setIsDrawing(true);
    }
  };

  const handleDotMouseEnter = (index) => {
    if (isDrawing && !pattern.includes(index)) {
      setPattern(prev => [...prev, index]);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (pattern.length >= minLength) {
        const patternString = pattern.join('-');
        onPatternComplete(patternString);
      } else {
        // Pattern too short, reset
        setTimeout(() => {
          setPattern([]);
        }, 500);
      }
    }
  };

  const handleTouchStart = (index, e) => {
    e.preventDefault();
    if (!pattern.includes(index)) {
      setPattern([index]);
      setIsDrawing(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.classList.contains('pattern-dot')) {
      const index = parseInt(element.dataset.index);
      if (!pattern.includes(index)) {
        setPattern(prev => [...prev, index]);
      }
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const resetPattern = () => {
    setPattern([]);
    setIsDrawing(false);
  };

  return (
    <div className="pattern-container">
      <div className="pattern-title">{title}</div>
      <p className="pattern-instruction">
        Connect at least {minLength} dots
      </p>
      
      <div 
        className="pattern-lock" 
        ref={containerRef}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          className="pattern-canvas"
          width={300}
          height={300}
          style={{ width: '300px', height: '300px' }}
        />
        <div 
          className="pattern-grid"
          onTouchMove={handleTouchMove}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => (
            <div
              key={index}
              data-index={index}
              className={`pattern-dot ${pattern.includes(index) ? 'active' : ''}`}
              onMouseDown={() => handleDotMouseDown(index)}
              onMouseEnter={() => handleDotMouseEnter(index)}
              onTouchStart={(e) => handleTouchStart(index, e)}
            />
          ))}
        </div>
      </div>

      {pattern.length > 0 && (
        <button className="pattern-reset" onClick={resetPattern}>
          Reset Pattern
        </button>
      )}
    </div>
  );
};

export default PatternLock;

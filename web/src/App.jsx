import { useState, useEffect, useCallback } from 'react';
import Card from './components/Card';

const defaultDeck = Array.from({ length: 52 }, (_, i) => i);

const allowedChars = " .,-\"/abcdefghijklmnopqrstuvwxyz";

function sanitizeInput(value) {
  return value
    .toLowerCase()
    .split('')
    .filter((c) => allowedChars.includes(c))
    .join('')
    .slice(0, 45);
}

function App() {
  const [mode, setMode] = useState('encode');

  // encode states
  const [text, setText] = useState('');
  const [deck, setDeck] = useState([]);

  // decode states
  const [order, setOrder] = useState(Array.from({ length: 52 }, (_, i) => i));
  const [decodedText, setDecodedText] = useState('');
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  
  // touch drag states for mobile
  const [touchDragIdx, setTouchDragIdx] = useState(null);
  const [touchOverIdx, setTouchOverIdx] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // encryption
  const [useEncryption, setUseEncryption] = useState(false);
  const [key, setKey] = useState('');

  // misc
  const [elapsedMs, setElapsedMs] = useState(null);
  const [wasm, setWasm] = useState(null);

  // Load the WASM module once on mount
  useEffect(() => {
    if (!window.createModule) return;
    window.createModule().then((m) => setWasm(m));
  }, []);

  // ENCODE: compute deck when text/key changes
  useEffect(() => {
    if (mode !== 'encode' || !wasm) return;

    const sanitizedText = sanitizeInput(text);
    if (sanitizedText !== text) {
      setText(sanitizedText);
      return;
    }

    if (useEncryption && key.trim() === '') {
      setDeck(defaultDeck);
      return;
    }

    const sanitizedKey = sanitizeInput(key);

    // If no text, simply use default deck without calling WASM to avoid errors
    if (sanitizedText.length === 0) {
      setDeck(defaultDeck);
      return;
    }

    const start = performance.now();
    let wasmResult;
    try {
      wasmResult = useEncryption
        ? wasm.textToPackOfCardsEncrypted(sanitizedText, sanitizedKey)
        : wasm.textToPackOfCards(sanitizedText);
    } catch {
      // fallback to default deck on any error
      wasmResult = defaultDeck;
    }
    const jsArray = Array.from(wasmResult);
    if (jsArray.length !== 52) {
      setDeck(defaultDeck);
    } else {
      setDeck(jsArray);
    }
    setElapsedMs(performance.now() - start);
  }, [mode, text, key, useEncryption, wasm]);

  // DECODE: compute text when order/key changes
  useEffect(() => {
    if (mode !== 'decode' || !wasm) return;

    const sanitizedKey = sanitizeInput(key);
    const start = performance.now();
    const deckArray = Int32Array.from(order.length === 52 ? order : defaultDeck);
    let result;
    if (useEncryption) {
      console.log("encrypted", deckArray, sanitizedKey);
      result = wasm.packOfCardsToTextEncrypted(deckArray, sanitizedKey);
    } else {
      console.log("unencrypted", deckArray);
      result = wasm.packOfCardsToText(deckArray);
    }
    setElapsedMs(performance.now() - start);
    setDecodedText(result);
  }, [mode, order, key, useEncryption, wasm]);

  const handleChange = (e) => {
    setText(sanitizeInput(e.target.value));
  };

  const handleKeyChange = (e) => {
    setKey(sanitizeInput(e.target.value));
  };

  // drag handlers for decode reorder
  const handleDrop = useCallback(
    (targetIdx) => {
      const sourceIdx = dragIdx !== null ? dragIdx : touchDragIdx;
      setOrder((prev) => {
        if (sourceIdx === null || sourceIdx === targetIdx) return prev;
        const newOrder = [...prev];
        // Remove the dragged item from its current position
        const draggedItem = newOrder.splice(sourceIdx, 1)[0];
        // Insert it at the target position
        newOrder.splice(targetIdx, 0, draggedItem);
        return newOrder;
      });
      setDragIdx(null);
      setOverIdx(null);
      setTouchDragIdx(null);
      setTouchOverIdx(null);
      setIsDragging(false);
    },
    [dragIdx, touchDragIdx]
  );

  // touch event handlers for mobile
  const handleTouchStart = useCallback((e, idx) => {
    e.preventDefault();
    setTouchDragIdx(idx);
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || touchDragIdx === null) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (elementBelow) {
      const cardElement = elementBelow.closest('[data-card-index]');
      if (cardElement) {
        const targetIdx = parseInt(cardElement.getAttribute('data-card-index'));
        setTouchOverIdx(targetIdx);
      } else {
        setTouchOverIdx(null);
      }
    }
  }, [isDragging, touchDragIdx]);

  const handleTouchEnd = useCallback((e) => {
    if (!isDragging || touchDragIdx === null) {
      setIsDragging(false);
      setTouchDragIdx(null);
      setTouchOverIdx(null);
      return;
    }
    
    e.preventDefault();
    
    if (touchOverIdx !== null && touchOverIdx !== touchDragIdx) {
      handleDrop(touchOverIdx);
    } else {
      setTouchDragIdx(null);
      setTouchOverIdx(null);
      setIsDragging(false);
    }
  }, [isDragging, touchDragIdx, touchOverIdx, handleDrop]);

  const resetDecode = () => {
    setOrder(Array.from({ length: 52 }, (_, i) => i));
    setDecodedText('');
    setElapsedMs(null);
  };

  return (
    <div className="min-h-screen bg-[#1e1e2e] text-[#cdd6f4] p-4 flex flex-col">
      {/* Header with attribution */}
      <header className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-[#89b4fa] text-center sm:text-left">DeckCrypt 🃏</h1>
          
          <div className="text-sm text-[#a6adc8] text-center sm:text-right">
            <p>Made by <span className="text-[#89b4fa] font-medium">Asher Falcon</span></p>
            <a 
              href="https://github.com/ashfn/deckcrypt" 
              className="inline-flex items-center justify-center gap-1 text-[#a6adc8] hover:text-[#cdd6f4] transition-colors text-sm mb-2"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.62 11.108l-8.731-8.729a1.292 1.292 0 0 0-1.823 0L9.257 4.19l2.299 2.3a1.532 1.532 0 0 1 1.939 1.95l2.214 2.217a1.53 1.53 0 0 1 1.583 2.531c-.599.6-1.566.6-2.166 0a1.536 1.536 0 0 1-.337-1.662l-2.074-2.063V14.9a1.532 1.532 0 0 1 .384 2.462c-.599.599-1.566.599-2.165 0-.6-.6-.6-1.566 0-2.165a1.532 1.532 0 0 1 .398-.285V9.676a1.533 1.533 0 0 1-.398-.285c-.6-.599-.6-1.566 0-2.165L8.706 5.003 2.38 11.108a1.292 1.292 0 0 0 0 1.823l8.73 8.729a1.292 1.292 0 0 0 1.823 0l8.729-8.729a1.292 1.292 0 0 0 0-1.823"/>
              </svg>
              View Source Code
            </a>
            <p>
              <a 
                href="https://asherfalcon.com/blog/posts/3" 
                className="text-[#74c7ec] hover:text-[#89dceb] underline transition-colors"
              >
                Read the blog post to learn how it works
              </a>
            </p>
          </div>
        </div>
        
        <p className="mt-3 text-center text-[#a6adc8]">
          Convert your message into the order of a deck of playing cards and vice versa
        </p>

        {/* Mode Toggle - Segmented Control */}
        <div className="mt-6 flex justify-center">
          <div className="relative bg-[#313244] p-1 rounded-lg inline-flex">
            <button
              onClick={() => setMode('encode')}
              className={`
                relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 min-w-[80px]
                ${mode === 'encode' 
                  ? 'bg-[#89b4fa] text-[#1e1e2e] shadow-lg' 
                  : 'text-[#bac2de] hover:text-[#cdd6f4] hover:bg-[#45475a]'
                }
              `}
            >
              Encode
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`
                relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 min-w-[80px]
                ${mode === 'decode' 
                  ? 'bg-[#89b4fa] text-[#1e1e2e] shadow-lg' 
                  : 'text-[#bac2de] hover:text-[#cdd6f4] hover:bg-[#45475a]'
                }
              `}
            >
              Decode
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-grow overflow-y-auto">
        {/* encryption toggle & key */}
        <div className="mb-6 p-4 bg-[#313244] rounded-lg border border-[#45475a]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={useEncryption}
                onChange={(e) => setUseEncryption(e.target.checked)}
                className="sr-only"
              />
              <div className={`
                w-11 h-6 rounded-full transition-colors duration-200 
                ${useEncryption ? 'bg-[#89b4fa]' : 'bg-[#585b70]'}
              `}>
                <div className={`
                  w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200
                  ${useEncryption ? 'translate-x-5' : 'translate-x-0'}
                  mt-0.5 ml-0.5
                `} />
              </div>
            </div>
            <span className="text-[#cdd6f4] font-medium">Use encryption key</span>
          </label>
          
          {useEncryption && (
            <input
              type="text"
              value={key}
              onChange={handleKeyChange}
              placeholder="Enter encryption key"
              className="flex-1 max-w-xs p-2 bg-[#45475a] border border-[#585b70] rounded-md text-[#cdd6f4] placeholder-[#9399b2] focus:border-[#89b4fa] focus:ring-1 focus:ring-[#89b4fa] focus:outline-none transition-colors"
            />
          )}
        </div>
      </div>

      {/* MODE: ENCODE */}
      {mode === 'encode' && (
        <>
          <div className="mb-6">
            <input
              type="text"
              value={text}
              onChange={handleChange}
              placeholder="Type here (max 45 chars)"
              className="w-full max-w-xl p-3 bg-[#45475a] border border-[#585b70] rounded-lg text-[#cdd6f4] placeholder-[#9399b2] focus:border-[#89b4fa] focus:ring-2 focus:ring-[#89b4fa] focus:ring-opacity-50 focus:outline-none transition-all"
            />
            <p className="mt-2 text-sm text-[#a6adc8]">
              Allowed characters: space, period, comma, hyphen, double quote, slash, a-z.
            </p>
          </div>

          <div className="bg-[#313244] p-4 rounded-lg border border-[#45475a]">
            <h3 className="text-lg font-semibold text-[#89b4fa] mb-3">Card Deck Output</h3>
            <div className="flex flex-wrap gap-1 max-w-full">
              {deck.map((idx, i) => (
                <Card key={i} index={idx} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* MODE: DECODE */}
      {mode === 'decode' && (
        <>
          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={resetDecode}
              className="px-4 py-2 bg-[#585b70] hover:bg-[#6c7086] text-[#cdd6f4] rounded-lg transition-colors font-medium"
            >
              Reset order
            </button>
          </div>

          <div className="bg-[#313244] p-4 rounded-lg border border-[#45475a] mb-6">
            <h3 className="text-lg font-semibold text-[#89b4fa] mb-3">Drag Cards to Reorder</h3>
            {/* draggable card grid */}
            <div 
              className="flex flex-wrap gap-1 max-w-full"
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {order.map((cardIdx, gridIdx) => (
                <div key={gridIdx} data-card-index={gridIdx}>
                  <Card
                    index={cardIdx}
                    draggable
                    onDragStart={() => setDragIdx(gridIdx)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setOverIdx(gridIdx);
                    }}
                    onDrop={() => handleDrop(gridIdx)}
                    onDragLeave={() => setOverIdx(null)}
                    onTouchStart={(e) => handleTouchStart(e, gridIdx)}
                    dropTarget={(overIdx === gridIdx && dragIdx !== gridIdx) || (touchOverIdx === gridIdx && touchDragIdx !== gridIdx)}
                    style={{
                      opacity: touchDragIdx === gridIdx ? 0.5 : 1,
                      transform: touchDragIdx === gridIdx ? 'scale(1.05)' : 'scale(1)',
                      transition: touchDragIdx === gridIdx ? 'none' : 'transform 0.2s ease',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* decoded output */}
          {decodedText && (
            <div className="bg-[#313244] border border-[#45475a] rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#89b4fa] mb-3">Decoded Text</h3>
              <div className="p-3 bg-[#45475a] border border-[#585b70] rounded-md text-[#cdd6f4] whitespace-pre-wrap font-mono">
                {decodedText}
              </div>
            </div>
          )}
        </>
      )}

        {/* Performance info */}
        {elapsedMs !== null && (
          <div className="mt-8 text-center text-sm text-[#9399b2]">
            Last conversion took {elapsedMs.toFixed(1)} ms
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

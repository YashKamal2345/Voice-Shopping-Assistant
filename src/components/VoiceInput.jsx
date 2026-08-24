import React, { useState, useCallback } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import useVoiceRecognition from '../hooks/useVoiceRecognition';
import nlpProcessor from '../utils/nlpProcessor';

const VoiceInput = ({ onCommand, language = 'en-US' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  const handleVoiceResult = useCallback(async (transcript) => {
    setIsProcessing(true);
    setFeedback('Processing...');
    
    try {
      const parsedCommand = nlpProcessor.parseVoiceCommand(transcript);
      
      if (parsedCommand.action === 'add') {
        if (parsedCommand.item && parsedCommand.item !== 'unknown item') {
          onCommand({
            type: 'ADD_ITEM',
            payload: {
              name: parsedCommand.item,
              quantity: parsedCommand.quantity,
              unit: parsedCommand.unit,
              category: parsedCommand.category
            }
          });
          setFeedback(`Added ${parsedCommand.quantity} ${parsedCommand.item}`);
        }
      } else if (parsedCommand.action === 'remove') {
        if (parsedCommand.item && parsedCommand.item !== 'unknown item') {
          onCommand({
            type: 'REMOVE_ITEM',
            payload: {
              name: parsedCommand.item
            }
          });
          setFeedback(`Removed ${parsedCommand.item}`);
        }
      } else if (parsedCommand.action === 'search') {
        onCommand({
          type: 'SEARCH',
          payload: {
            query: parsedCommand.searchQuery || parsedCommand.item
          }
        });
        setFeedback(`Searching for ${parsedCommand.searchQuery || parsedCommand.item}`);
      }
      
    } catch (error) {
      setFeedback('Sorry, I didn\'t understand that');
      console.error('Voice processing error:', error);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedback(''), 3000);
    }
  }, [onCommand]);

  const {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported
  } = useVoiceRecognition(handleVoiceResult, language);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800">Voice recognition is not supported in your browser.</p>
        <p className="text-sm text-yellow-600">Please use Chrome, Edge, or Safari.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-xl shadow-lg">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`voice-button ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <FaSpinner className="animate-spin text-2xl" />
        ) : isListening ? (
          <FaMicrophoneSlash className="text-2xl" />
        ) : (
          <FaMicrophone className="text-2xl" />
        )}
      </motion.button>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2"
          >
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Listening...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {(transcript || feedback) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full p-3 bg-gray-50 rounded-lg"
        >
          <p className="text-sm text-gray-700">
            {feedback || transcript}
          </p>
        </motion.div>
      )}

      {error && (
        <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        <button
          onClick={() => {
            const commands = [
              'Add milk',
              'Add 2 bottles of water',
              'Remove bananas',
              'Find organic apples'
            ];
            const random = commands[Math.floor(Math.random() * commands.length)];
            handleVoiceResult(random);
          }}
          className="text-xs px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          Try: "Add milk"
        </button>
        <button
          onClick={() => {
            handleVoiceResult('Add 3 bananas');
          }}
          className="text-xs px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          Try: "Add 3 bananas"
        </button>
        <button
          onClick={() => {
            handleVoiceResult('Remove milk');
          }}
          className="text-xs px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          Try: "Remove milk"
        </button>
        <button
          onClick={() => {
            handleVoiceResult('Find organic apples under $5');
          }}
          className="text-xs px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          Try: "Search for..."
        </button>
      </div>
    </div>
  );
};

export default VoiceInput;

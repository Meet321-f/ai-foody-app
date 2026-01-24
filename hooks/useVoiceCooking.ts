import { useState, useEffect } from "react";
import * as Speech from "expo-speech";
import { Platform } from "react-native";

export const useVoiceCooking = (steps: string[]) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const speakStep = (index: number) => {
    if (index < 0 || index >= steps.length) return;

    const textToSpeak = `Step ${index + 1}. ${steps[index]}`;

    Speech.speak(textToSpeak, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.9,
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });

    setCurrentStepIndex(index);
  };

  const startCooking = () => {
    speakStep(0);
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      speakStep(nextIndex);
    } else {
      Speech.speak("You have finished all the steps! Enjoy your meal.", {
        onDone: () => setIsSpeaking(false),
      });
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      speakStep(prevIndex);
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  return {
    isSpeaking,
    currentStepIndex,
    startCooking,
    nextStep,
    prevStep,
    stopSpeaking,
  };
};

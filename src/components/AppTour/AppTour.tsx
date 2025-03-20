import React, { useState, useEffect } from "react";
import Joyride, { CallBackProps, Step } from "react-joyride";

interface AppTourProps {
  isActive?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

const AppTour: React.FC<AppTourProps> = ({
  isActive = false,
  onComplete,
  onSkip,
}) => {
  const [run, setRun] = useState(isActive);

  // Update run state if isActive prop changes
  useEffect(() => {
    setRun(isActive);
  }, [isActive]);

  // Handle tour events
  const handleCallback = (data: CallBackProps) => {
    const { status, action, type, index } = data;
    console.log("Tour callback:", { status, action, type, index });

    // Case 1: Tour is finished normally
    if (status === "finished") {
      setRun(false);
      localStorage.setItem("trackduelTourComplete", "true");
      onComplete?.();
      return;
    }

    // Case 2: Tour is skipped after viewing some steps
    if (status === "skipped") {
      setRun(false);
      localStorage.setItem("trackduelTourComplete", "true");
      onSkip?.();
      return;
    }

    // Case 3: Skip button is clicked at the very beginning
    // This is the case that was missing - we need to check the action
    if (action === "skip") {
      console.log("Skip action detected");
      setRun(false);
      localStorage.setItem("trackduelTourComplete", "true");
      onSkip?.();
      return;
    }

    // Case 4: Close button is clicked
    if (action === "close") {
      console.log("Close action detected");
      setRun(false);
      localStorage.setItem("trackduelTourComplete", "true");
      onSkip?.();
      return;
    }
  };

  // Define the tour steps
  const steps: Step[] = [
    {
      target: ".track-comparison",
      content:
        "Welcome to TrackDuel! This is where tracks battle for a spot in your playlist.",
      disableBeacon: true,
      placement: "center",
    },
    {
      target: ".tracks-container",
      content:
        "Listen to both tracks and click on your favorite to add it to your playlist.",
      placement: "bottom",
    },
    {
      target: ".vs-badge",
      content:
        "Tracks compete against each other - the one you pick moves to your playlist!",
      placement: "bottom",
    },
    {
      target: ".skip-button-container",
      content: "Not feeling either track? Skip both to get a fresh pair.",
      placement: "top",
    },
    {
      target: ".playlist-section",
      content:
        "Your winning tracks appear here. Once you have enough, you can create a Spotify playlist!",
      placement: "top",
    },
    {
      target: ".save-playlist-btn",
      content:
        "With 3 or more tracks, you can create and share a Spotify playlist!",
      placement: "top",
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showSkipButton={false}
      showProgress={true}
      disableScrolling={true}
      styles={{
        options: {
          primaryColor: "#1db954", // Spotify green
          backgroundColor: "#282828",
          textColor: "#ffffff",
          arrowColor: "#282828",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        tooltip: {
          borderRadius: "8px",
        },
      }}
      callback={handleCallback}
      locale={{
        last: "Finish",
        skip: "Skip tour",
      }}
    />
  );
};

export default AppTour;

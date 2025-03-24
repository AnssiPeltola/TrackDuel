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

  // Enhanced callback with manual scrolling
  const handleCallback = (data: CallBackProps) => {
    const { status, action, type, index, step } = data;
    console.log("Tour callback:", { status, action, type, index });

    // Manual scrolling for all steps
    if (type === "step:before") {
      const targetSelector = step.target as string;
      try {
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
          // Determine if we're on a mobile device
          const isMobile = window.innerWidth <= 768;

          // Wait a moment to ensure the DOM is ready
          setTimeout(() => {
            // Get element position
            const rect = targetElement.getBoundingClientRect();
            const absoluteTop = rect.top + window.pageYOffset;

            // Different offset for different steps and device types
            let offset = 120;

            // Special handling for step 2 (tracks-container)
            if (index === 1) {
              offset = isMobile ? 200 : 150; // More space for tracks container on mobile
            } else if (index === 2) {
              offset = isMobile ? 180 : 100; // VS badge
            } else if (index === 4 || index === 5) {
              offset = isMobile ? 250 : 150; // More space needed for bottom elements
            }

            // Scroll with appropriate offset
            window.scrollTo({
              top: absoluteTop - offset,
              behavior: "smooth",
            });

            // Additional scrollIntoView for better support
            if (index !== 0) {
              // Skip for first step which is centered
              setTimeout(() => {
                targetElement.scrollIntoView({
                  behavior: "smooth",
                  block: isMobile ? "start" : "center",
                });
              }, 50);
            }
          }, 300);
        }
      } catch (error) {
        console.error("Error scrolling to tour element:", error);
      }
    }

    // Original callback logic
    if (status === "finished") {
      setRun(false);
      localStorage.setItem("trackduelTourComplete", "true");
      onComplete?.();
      return;
    }

    if (status === "skipped") {
      setRun(false);
      localStorage.setItem("trackduelTourComplete", "true");
      onSkip?.();
      return;
    }

    if (action === "skip") {
      console.log("Skip action detected");
      setRun(false);
      localStorage.setItem("trackduelTourComplete", "true");
      onSkip?.();
      return;
    }

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
      target: ".track-card:first-child .embedded-player",
      content:
        "Listen to both tracks and click on your favorite to add it to your playlist.",
      placement: "bottom",
      placementBeacon: "bottom",
      disableBeacon: true,
      offset: 20,
      hideFooter: false,
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
      scrollToFirstStep={false}
      spotlightClicks={false}
      scrollOffset={100}
      styles={{
        options: {
          primaryColor: "#1db954",
          backgroundColor: "#282828",
          textColor: "#ffffff",
          arrowColor: "#282828",
          zIndex: 1000,
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

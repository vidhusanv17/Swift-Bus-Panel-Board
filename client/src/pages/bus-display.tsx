import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Volume2, VolumeX, Wifi, Clock } from "lucide-react";
import type { Bus, Announcement } from "@shared/schema";

export default function BusDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const announcementTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch buses data
  const { data: buses = [], isLoading: busesLoading } = useQuery<Bus[]>({
    queryKey: ["/api/buses"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch announcements data
  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update last update time when buses data changes
  useEffect(() => {
    if (buses.length > 0) {
      setLastUpdate(new Date());
    }
  }, [buses]);

  // Text-to-Speech functionality with proper sequencing
  const speakBilingualAnnouncement = useCallback((englishText: string, punjabiText: string) => {
    if (!isTTSEnabled || !window.speechSynthesis) return;

    // Create English utterance
    const englishUtterance = new SpeechSynthesisUtterance(englishText);
    englishUtterance.lang = 'en-IN';
    englishUtterance.rate = 0.8;
    englishUtterance.pitch = 1;
    englishUtterance.volume = 0.8;
    
    // Create Punjabi utterance  
    const punjabiUtterance = new SpeechSynthesisUtterance(punjabiText);
    punjabiUtterance.lang = 'pa-IN';
    punjabiUtterance.rate = 0.8;
    punjabiUtterance.pitch = 1;
    punjabiUtterance.volume = 0.8;

    // Chain Punjabi after English completes
    englishUtterance.onend = () => {
      if (isTTSEnabled) {
        speechRef.current = punjabiUtterance;
        window.speechSynthesis.speak(punjabiUtterance);
      }
    };

    // Move to next announcement after Punjabi completes
    punjabiUtterance.onend = () => {
      if (isTTSEnabled) {
        setCurrentAnnouncementIndex(prev => (prev + 1) % announcements.length);
      }
    };
    
    speechRef.current = englishUtterance;
    window.speechSynthesis.speak(englishUtterance);
  }, [isTTSEnabled, announcements.length]);

  const startAnnouncementCycle = useCallback(() => {
    if (announcements.length === 0) return;

    const speakCurrentAnnouncement = () => {
      if (announcements.length > 0 && isTTSEnabled) {
        const currentAnn = announcements[currentAnnouncementIndex];
        speakBilingualAnnouncement(currentAnn.messageEnglish, currentAnn.messagePunjabi);
      }
    };

    // Clear existing timer
    if (announcementTimerRef.current) {
      clearInterval(announcementTimerRef.current);
    }

    // Speak immediately 
    speakCurrentAnnouncement();

    // Continue cycling every 12 seconds
    announcementTimerRef.current = setInterval(speakCurrentAnnouncement, 12000);
  }, [announcements, currentAnnouncementIndex, isTTSEnabled, speakBilingualAnnouncement]);

  const toggleTTS = useCallback(() => {
    setIsTTSEnabled(prev => {
      if (prev) {
        // Stopping TTS - cancel speech and clear timers
        window.speechSynthesis.cancel();
        if (announcementTimerRef.current) {
          clearInterval(announcementTimerRef.current);
          announcementTimerRef.current = null;
        }
      }
      return !prev;
    });
  }, []);

  // Handle TTS announcement cycle when announcements change
  useEffect(() => {
    if (isTTSEnabled && announcements.length > 0) {
      startAnnouncementCycle();
    }
    return () => {
      if (announcementTimerRef.current) {
        clearInterval(announcementTimerRef.current);
      }
    };
  }, [announcements, isTTSEnabled, startAnnouncementCycle]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (announcementTimerRef.current) {
        clearInterval(announcementTimerRef.current);
      }
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-time":
        return "text-led-green";
      case "arriving":
        return "text-led-yellow";
      case "delayed":
        return "text-led-red";
      default:
        return "text-led-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "on-time":
        return "ON TIME";
      case "arriving":
        return "ARRIVING";
      case "delayed":
        return "DELAYED";
      default:
        return "UNKNOWN";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-IN", {
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
  };

  const formatUpdateTime = (date: Date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
  };

  // Create scrolling announcement text
  const createAnnouncementText = () => {
    if (announcements.length === 0) {
      return "ਪੰਜਾਬ ਰੋਡਵੇਜ਼ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ | Welcome to Punjab Roadways";
    }

    return announcements
      .map(ann => `${ann.messagePunjabi} | ${ann.messageEnglish}`)
      .join(" | ");
  };

  if (busesLoading) {
    return (
      <div className="led-panel led-border min-h-screen p-6 flex items-center justify-center">
        <div className="text-led-blue text-2xl led-text animate-pulse">
          Loading Bus Information...
        </div>
      </div>
    );
  }

  return (
    <div className="led-panel led-border min-h-screen p-6">
      {/* Header Section */}
      <header className="text-center mb-8">
        <div className="border-2 border-led-blue p-4 rounded-lg led-glow">
          <h1 className="text-4xl md:text-6xl font-led font-black text-led-blue led-text tracking-wider" data-testid="header-title">
            LIVE BUS INFORMATION
          </h1>
          <div className="text-xl md:text-2xl text-led-white mt-2 led-text" data-testid="header-subtitle">
            PUNJAB ROADWAYS
          </div>
          <div className="flex justify-center items-center mt-3 space-x-4">
            <div className="w-3 h-3 bg-led-green rounded-full animate-pulse-led"></div>
            <span className="text-sm text-led-green led-text" data-testid="live-indicator">LIVE</span>
            <div className="w-3 h-3 bg-led-green rounded-full animate-pulse-led"></div>
          </div>
        </div>
      </header>

      {/* Bus Information Table */}
      <div className="mb-8">
        <div className="border-2 border-led-white rounded-lg p-4 led-border bg-black" data-testid="bus-information-table">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 pb-4 border-b-2 border-led-white mb-4">
            <div className="text-led-white font-bold text-lg md:text-xl led-text text-center">
              BUS NUMBER / ROUTE
            </div>
            <div className="text-led-white font-bold text-lg md:text-xl led-text text-center">
              DESTINATION
            </div>
            <div className="text-led-white font-bold text-lg md:text-xl led-text text-center">
              ETA
            </div>
            <div className="text-led-white font-bold text-lg md:text-xl led-text text-center">
              STATUS
            </div>
          </div>

          {/* Bus Entries */}
          {buses.map((bus, index) => (
            <div
              key={bus.id}
              className={`grid grid-cols-4 gap-4 py-3 ${index < buses.length - 1 ? 'border-b border-gray-600' : ''}`}
              data-testid={`bus-row-${bus.id}`}
            >
              <div className="text-led-white text-lg md:text-xl led-text text-center font-semibold" data-testid={`bus-number-${bus.id}`}>
                {bus.busNumber}
                <div className="text-sm text-led-white opacity-75">{bus.route}</div>
              </div>
              <div className="text-led-white text-lg md:text-xl led-text text-center" data-testid={`bus-destination-${bus.id}`}>
                {bus.destination}
                {bus.platform && (
                  <div className="text-sm text-led-blue opacity-75">{bus.platform}</div>
                )}
              </div>
              <div className={`${getStatusColor(bus.status)} text-lg md:text-xl led-text text-center font-bold`} data-testid={`bus-eta-${bus.id}`}>
                {bus.etaMinutes} MIN
              </div>
              <div className="text-center">
                <span className={`status-dot bg-${bus.status === 'on-time' ? 'led-green' : bus.status === 'arriving' ? 'led-yellow' : 'led-red'} ${getStatusColor(bus.status)}`}></span>
                <span className={`${getStatusColor(bus.status)} text-sm md:text-base led-text font-semibold`} data-testid={`bus-status-${bus.id}`}>
                  {getStatusText(bus.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcement Ticker */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-led-blue" data-testid="announcement-ticker">
        <div className="flex items-center p-4">
          {/* Interactive TTS Speaker Icon */}
          <div className="flex-shrink-0 mr-4">
            <button
              onClick={toggleTTS}
              className={`p-2 rounded-full transition-all duration-300 ${
                isTTSEnabled 
                  ? 'bg-led-blue/20 border border-led-blue' 
                  : 'bg-gray-800 border border-gray-600 hover:border-led-blue hover:bg-led-blue/10'
              }`}
              data-testid="tts-toggle-button"
            >
              {isTTSEnabled ? (
                <Volume2 className="text-led-blue text-2xl led-glow animate-pulse" data-testid="tts-speaker-icon" />
              ) : (
                <VolumeX className="text-gray-400 text-2xl" data-testid="tts-muted-icon" />
              )}
            </button>
          </div>

          {/* Scrolling Text Container */}
          <div className="scroll-container flex-1 overflow-hidden">
            <div className="scroll-text text-led-white text-lg led-text whitespace-nowrap animate-scroll" data-testid="scrolling-announcement">
              {createAnnouncementText()}
            </div>
          </div>
          
          {/* TTS Status Indicator */}
          {isTTSEnabled && (
            <div className="flex-shrink-0 ml-4">
              <span className="text-led-green text-xs led-text animate-pulse" data-testid="tts-status">
                TTS ON
              </span>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="fixed bottom-20 right-6" data-testid="system-status">
        <div className="text-right space-y-2">
          <div className="text-led-green text-sm led-text" data-testid="connection-status">
            <Wifi className="inline mr-2" size={16} />
            CONNECTED
          </div>
          <div className="text-led-blue text-sm led-text" data-testid="current-time">
            <Clock className="inline mr-2" size={16} />
            <span>{formatTime(currentTime)}</span>
          </div>
          <div className="text-led-white text-xs led-text opacity-75" data-testid="last-update-time">
            LAST UPDATE: <span>{formatUpdateTime(lastUpdate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
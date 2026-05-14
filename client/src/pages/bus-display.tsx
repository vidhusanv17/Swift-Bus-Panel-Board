import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Volume2, VolumeX, Wifi, Clock } from "lucide-react";
import type { Bus, Announcement } from "@shared/schema";

export default function BusDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [ttsSupported, setTTSSupported] = useState(false);

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

  // Check TTS support and initialize
  useEffect(() => {
    setTTSSupported('speechSynthesis' in window);
  }, []);

  // TTS functionality
  const speakAnnouncement = () => {
    if (!ttsSupported) {
      console.warn('Text-to-speech not supported in this browser');
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    if (isTTSPlaying) {
      setIsTTSPlaying(false);
      return;
    }

    const announcementText = createAnnouncementText();
    
    // Split text by language delimiter and speak English part
    const englishText = announcementText.split(' | ').filter((_, index) => index % 2 === 1).join('. ') ||
                       announcementText.split(' | ')[0] || announcementText;
    
    const utterance = new SpeechSynthesisUtterance(englishText);
    utterance.rate = 0.8; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Set language to English for better pronunciation
    utterance.lang = 'en-US';
    
    utterance.onstart = () => {
      setIsTTSPlaying(true);
    };
    
    utterance.onend = () => {
      setIsTTSPlaying(false);
    };
    
    utterance.onerror = () => {
      setIsTTSPlaying(false);
      console.error('TTS error occurred');
    };
    
    speechSynthesis.speak(utterance);
  };

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
          {/* TTS Speaker Icon */}
          <div className="flex-shrink-0 mr-4">
            <button
              onClick={speakAnnouncement}
              disabled={!ttsSupported}
              className={`text-2xl led-glow transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                isTTSPlaying 
                  ? 'text-led-green animate-pulse' 
                  : 'text-led-blue hover:text-led-white'
              }`}
              data-testid="tts-speaker-button"
              title={
                !ttsSupported 
                  ? 'Text-to-speech not supported' 
                  : isTTSPlaying 
                    ? 'Stop announcement' 
                    : 'Play announcement'
              }
            >
              {isTTSPlaying ? (
                <VolumeX className="animate-pulse" />
              ) : (
                <Volume2 className={!isTTSPlaying ? 'animate-pulse' : ''} />
              )}
            </button>
          </div>

          {/* Scrolling Text Container */}
          <div className="scroll-container flex-1 overflow-hidden">
            <div className="scroll-text text-led-white text-lg led-text whitespace-nowrap animate-scroll" data-testid="scrolling-announcement">
              {createAnnouncementText()}
            </div>
          </div>
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

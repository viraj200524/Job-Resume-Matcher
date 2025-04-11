// Jitsi Meet integration for video conferencing

interface VideoRoomOptions {
    roomName: string
    config?: {
      startWithAudioMuted?: boolean
      startWithVideoMuted?: boolean
      enableClosePage?: boolean
    }
  }
  
  interface VideoRoom {
    url: string
    roomName: string
  }
  
  export async function createVideoRoom(options: VideoRoomOptions): Promise<VideoRoom> {
    const { roomName, config = {} } = options
  
    // Generate a unique room name if not provided
    const uniqueRoomName = roomName || `meeting-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  
    // Build the Jitsi Meet URL with configuration parameters
    let url = `https://meet.jit.si/${uniqueRoomName}`
  
    // Add configuration parameters to the URL
    const urlParams = new URLSearchParams()
  
    if (config.startWithAudioMuted !== undefined) {
      urlParams.append("config.startWithAudioMuted", config.startWithAudioMuted ? "1" : "0")
    }
  
    if (config.startWithVideoMuted !== undefined) {
      urlParams.append("config.startWithVideoMuted", config.startWithVideoMuted ? "1" : "0")
    }
  
    if (config.enableClosePage !== undefined) {
      urlParams.append("config.enableClosePage", config.enableClosePage ? "1" : "0")
    }
  
    // Add any other configuration parameters as needed
    urlParams.append("config.prejoinPageEnabled", "false")
    urlParams.append("config.disableDeepLinking", "true")
  
    // Append parameters to the URL
    const paramsString = urlParams.toString()
    if (paramsString) {
      url += `#${paramsString}`
    }
  
    return {
      url,
      roomName: uniqueRoomName,
    }
  }
  
  export function getJitsiIframeProps(url: string) {
    // Props for the Jitsi Meet iframe
    return {
      url,
      allow: "camera; microphone; fullscreen; display-capture; autoplay",
      style: {
        height: "100%",
        width: "100%",
        border: "none",
        borderRadius: "0.5rem",
      },
    }
  }
  
// Daily.co video conferencing integration

interface CreateRoomOptions {
  name?: string
  expiresInMinutes?: number
  properties?: {
    start_audio_off?: boolean
    start_video_off?: boolean
    enable_chat?: boolean
    enable_screenshare?: boolean
    enable_recording?: boolean
  }
}

export async function createVideoRoom(options: CreateRoomOptions = {}): Promise<{ url: string; roomName: string }> {
  try {
    const apiKey = process.env.DAILY_API_KEY

    if (!apiKey) {
      throw new Error("Daily.co API key is not configured")
    }

    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: options.name || `interview-${Date.now()}`,
        properties: {
          exp: options.expiresInMinutes ? Math.floor(Date.now() / 1000) + options.expiresInMinutes * 60 : undefined,
          start_audio_off: options.properties?.start_audio_off ?? false,
          start_video_off: options.properties?.start_video_off ?? false,
          enable_chat: options.properties?.enable_chat ?? true,
          enable_screenshare: options.properties?.enable_screenshare ?? true,
          enable_recording: options.properties?.enable_recording ?? false,
        },
      }),
    })

    const data = await response.json()

    return {
      url: data.url,
      roomName: data.name,
    }
  } catch (error) {
    console.error("Error creating Daily.co room:", error)
    throw new Error("Failed to create video room")
  }
}

export function getDailyIframeProps(url: string) {
  return {
    url,
    showLeaveButton: true,
    showFullscreenButton: true,
    showLocalVideo: true,
    showParticipantsBar: true,
  }
}

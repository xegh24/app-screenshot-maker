/**
 * Device Frame Specifications and Configurations
 * 
 * This module provides comprehensive device specifications for creating
 * realistic device mockups with proper screen area calculations and responsive scaling.
 */

export interface DeviceContentArea {
  x: number
  y: number
  width: number
  height: number
}

export interface DeviceSpec {
  id: string
  name: string
  category: 'mobile' | 'tablet' | 'desktop' | 'browser'
  brand: 'apple' | 'google' | 'generic' | 'browser'
  
  // Frame specifications
  frame: {
    src: string
    width: number
    height: number
    aspectRatio: number
  }
  
  // Content area (screen area within the frame)
  contentArea: DeviceContentArea
  
  // Device metadata
  metadata: {
    year?: number
    screenSize?: string
    resolution?: string
    pixelDensity?: number
    orientation: 'portrait' | 'landscape' | 'desktop'
  }
  
  // Scaling properties
  scaling: {
    minScale: number
    maxScale: number
    defaultScale: number
    maintainAspectRatio: boolean
  }
}

// Mobile Devices
export const MOBILE_DEVICES: DeviceSpec[] = [
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    category: 'mobile',
    brand: 'apple',
    frame: {
      src: '/frames/iphone-14-pro.svg', // Using the Pro frame for iPhone 15 Pro
      width: 400,
      height: 890,
      aspectRatio: 400 / 890
    },
    contentArea: {
      x: 25,
      y: 65,
      width: 350,
      height: 760
    },
    metadata: {
      year: 2023,
      screenSize: '6.1"',
      resolution: '2556 × 1179',
      pixelDensity: 460,
      orientation: 'portrait'
    },
    scaling: {
      minScale: 0.2,
      maxScale: 2.0,
      defaultScale: 0.8,
      maintainAspectRatio: true
    }
  },
  {
    id: 'iphone-15',
    name: 'iPhone 15',
    category: 'mobile',
    brand: 'apple',
    frame: {
      src: '/frames/iphone-14.svg',
      width: 400,
      height: 890,
      aspectRatio: 400 / 890
    },
    contentArea: {
      x: 25,
      y: 65,
      width: 350,
      height: 760
    },
    metadata: {
      year: 2023,
      screenSize: '6.1"',
      resolution: '2556 × 1179',
      pixelDensity: 460,
      orientation: 'portrait'
    },
    scaling: {
      minScale: 0.2,
      maxScale: 2.0,
      defaultScale: 0.8,
      maintainAspectRatio: true
    }
  },
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    category: 'mobile',
    brand: 'apple',
    frame: {
      src: '/frames/iphone-14-pro.svg',
      width: 400,
      height: 890,
      aspectRatio: 400 / 890
    },
    contentArea: {
      x: 25,
      y: 65,
      width: 350,
      height: 760
    },
    metadata: {
      year: 2022,
      screenSize: '6.1"',
      resolution: '2556 × 1179',
      pixelDensity: 460,
      orientation: 'portrait'
    },
    scaling: {
      minScale: 0.2,
      maxScale: 2.0,
      defaultScale: 0.8,
      maintainAspectRatio: true
    }
  },
  {
    id: 'iphone-14',
    name: 'iPhone 14',
    category: 'mobile',
    brand: 'apple',
    frame: {
      src: '/frames/iphone-14.svg',
      width: 400,
      height: 890,
      aspectRatio: 400 / 890
    },
    contentArea: {
      x: 25,
      y: 65,
      width: 350,
      height: 760
    },
    metadata: {
      year: 2022,
      screenSize: '6.1"',
      resolution: '2532 × 1170',
      pixelDensity: 460,
      orientation: 'portrait'
    },
    scaling: {
      minScale: 0.2,
      maxScale: 2.0,
      defaultScale: 0.8,
      maintainAspectRatio: true
    }
  },
  {
    id: 'pixel-8-pro',
    name: 'Google Pixel 8 Pro',
    category: 'mobile',
    brand: 'google',
    frame: {
      src: '/frames/android-pixel.svg',
      width: 400,
      height: 960,
      aspectRatio: 400 / 960
    },
    contentArea: {
      x: 30,
      y: 140,
      width: 340,
      height: 680
    },
    metadata: {
      year: 2023,
      screenSize: '6.7"',
      resolution: '2992 × 1344',
      pixelDensity: 489,
      orientation: 'portrait'
    },
    scaling: {
      minScale: 0.2,
      maxScale: 2.0,
      defaultScale: 0.8,
      maintainAspectRatio: true
    }
  },
  {
    id: 'pixel-7',
    name: 'Google Pixel 7',
    category: 'mobile',
    brand: 'google',
    frame: {
      src: '/frames/android-pixel.svg',
      width: 400,
      height: 960,
      aspectRatio: 400 / 960
    },
    contentArea: {
      x: 30,
      y: 140,
      width: 340,
      height: 680
    },
    metadata: {
      year: 2022,
      screenSize: '6.3"',
      resolution: '2400 × 1080',
      pixelDensity: 416,
      orientation: 'portrait'
    },
    scaling: {
      minScale: 0.2,
      maxScale: 2.0,
      defaultScale: 0.8,
      maintainAspectRatio: true
    }
  }
]

// Tablet Devices
export const TABLET_DEVICES: DeviceSpec[] = [
  {
    id: 'ipad-pro-12-9',
    name: 'iPad Pro 12.9"',
    category: 'tablet',
    brand: 'apple',
    frame: {
      src: '/frames/ipad-pro.svg',
      width: 1000,
      height: 1250,
      aspectRatio: 1000 / 1250
    },
    contentArea: {
      x: 85,
      y: 85,
      width: 830,
      height: 1080
    },
    metadata: {
      year: 2022,
      screenSize: '12.9"',
      resolution: '2732 × 2048',
      pixelDensity: 264,
      orientation: 'portrait'
    },
    scaling: {
      minScale: 0.15,
      maxScale: 1.0,
      defaultScale: 0.4,
      maintainAspectRatio: true
    }
  },
  {
    id: 'ipad-pro-11',
    name: 'iPad Pro 11"',
    category: 'tablet',
    brand: 'apple',
    frame: {
      src: '/frames/ipad-pro.svg',
      width: 1000,
      height: 1250,
      aspectRatio: 1000 / 1250
    },
    contentArea: {
      x: 85,
      y: 85,
      width: 830,
      height: 1080
    },
    metadata: {
      year: 2022,
      screenSize: '11"',
      resolution: '2388 × 1668',
      pixelDensity: 264,
      orientation: 'portrait'
    },
    scaling: {
      minScale: 0.15,
      maxScale: 1.2,
      defaultScale: 0.45,
      maintainAspectRatio: true
    }
  },
  {
    id: 'ipad-air',
    name: 'iPad Air',
    category: 'tablet',
    brand: 'apple',
    frame: {
      src: '/frames/ipad-pro.svg', // Using same frame design
      width: 1000,
      height: 1250,
      aspectRatio: 1000 / 1250
    },
    contentArea: {
      x: 85,
      y: 85,
      width: 830,
      height: 1080
    },
    metadata: {
      year: 2022,
      screenSize: '10.9"',
      resolution: '2360 × 1640',
      pixelDensity: 264,
      orientation: 'portrait'
    },
    scaling: {
      minScale: 0.15,
      maxScale: 1.2,
      defaultScale: 0.45,
      maintainAspectRatio: true
    }
  },
  {
    id: 'generic-tablet',
    name: 'Generic Tablet',
    category: 'tablet',
    brand: 'generic',
    frame: {
      src: '/frames/tablet-generic.svg',
      width: 1000,
      height: 760,
      aspectRatio: 1000 / 760
    },
    contentArea: {
      x: 60,
      y: 60,
      width: 880,
      height: 640
    },
    metadata: {
      screenSize: '10.1"',
      resolution: '1920 × 1200',
      pixelDensity: 224,
      orientation: 'landscape'
    },
    scaling: {
      minScale: 0.2,
      maxScale: 1.0,
      defaultScale: 0.5,
      maintainAspectRatio: true
    }
  }
]

// Desktop Devices
export const DESKTOP_DEVICES: DeviceSpec[] = [
  {
    id: 'macbook-pro-16',
    name: 'MacBook Pro 16"',
    category: 'desktop',
    brand: 'apple',
    frame: {
      src: '/frames/macbook-pro.svg',
      width: 1500,
      height: 1000,
      aspectRatio: 1500 / 1000
    },
    contentArea: {
      x: 150,
      y: 45,
      width: 1200,
      height: 750
    },
    metadata: {
      year: 2023,
      screenSize: '16.2"',
      resolution: '3456 × 2234',
      pixelDensity: 254,
      orientation: 'landscape'
    },
    scaling: {
      minScale: 0.1,
      maxScale: 0.8,
      defaultScale: 0.35,
      maintainAspectRatio: true
    }
  },
  {
    id: 'macbook-pro-14',
    name: 'MacBook Pro 14"',
    category: 'desktop',
    brand: 'apple',
    frame: {
      src: '/frames/macbook-pro.svg',
      width: 1500,
      height: 1000,
      aspectRatio: 1500 / 1000
    },
    contentArea: {
      x: 150,
      y: 45,
      width: 1200,
      height: 750
    },
    metadata: {
      year: 2023,
      screenSize: '14.2"',
      resolution: '3024 × 1964',
      pixelDensity: 254,
      orientation: 'landscape'
    },
    scaling: {
      minScale: 0.1,
      maxScale: 0.8,
      defaultScale: 0.4,
      maintainAspectRatio: true
    }
  },
  {
    id: 'macbook-air-15',
    name: 'MacBook Air 15"',
    category: 'desktop',
    brand: 'apple',
    frame: {
      src: '/frames/macbook-air.svg',
      width: 1480,
      height: 980,
      aspectRatio: 1480 / 980
    },
    contentArea: {
      x: 140,
      y: 40,
      width: 1200,
      height: 800
    },
    metadata: {
      year: 2023,
      screenSize: '15.3"',
      resolution: '2880 × 1864',
      pixelDensity: 224,
      orientation: 'landscape'
    },
    scaling: {
      minScale: 0.1,
      maxScale: 0.8,
      defaultScale: 0.35,
      maintainAspectRatio: true
    }
  },
  {
    id: 'macbook-air-13',
    name: 'MacBook Air 13"',
    category: 'desktop',
    brand: 'apple',
    frame: {
      src: '/frames/macbook-air.svg',
      width: 1480,
      height: 980,
      aspectRatio: 1480 / 980
    },
    contentArea: {
      x: 140,
      y: 40,
      width: 1200,
      height: 800
    },
    metadata: {
      year: 2022,
      screenSize: '13.6"',
      resolution: '2560 × 1664',
      pixelDensity: 224,
      orientation: 'landscape'
    },
    scaling: {
      minScale: 0.1,
      maxScale: 0.8,
      defaultScale: 0.4,
      maintainAspectRatio: true
    }
  },
  {
    id: 'imac-24',
    name: 'iMac 24"',
    category: 'desktop',
    brand: 'apple',
    frame: {
      src: '/frames/imac-24.svg',
      width: 1800,
      height: 1400,
      aspectRatio: 1800 / 1400
    },
    contentArea: {
      x: 165,
      y: 165,
      width: 1470,
      height: 920
    },
    metadata: {
      year: 2021,
      screenSize: '24"',
      resolution: '4480 × 2520',
      pixelDensity: 218,
      orientation: 'desktop'
    },
    scaling: {
      minScale: 0.08,
      maxScale: 0.6,
      defaultScale: 0.25,
      maintainAspectRatio: true
    }
  },
  {
    id: 'desktop-monitor',
    name: 'Desktop Monitor',
    category: 'desktop',
    brand: 'generic',
    frame: {
      src: '/frames/desktop-monitor.svg',
      width: 1600,
      height: 1200,
      aspectRatio: 1600 / 1200
    },
    contentArea: {
      x: 120,
      y: 120,
      width: 1360,
      height: 850
    },
    metadata: {
      screenSize: '27"',
      resolution: '2560 × 1440',
      pixelDensity: 109,
      orientation: 'desktop'
    },
    scaling: {
      minScale: 0.08,
      maxScale: 0.7,
      defaultScale: 0.3,
      maintainAspectRatio: true
    }
  }
]

// Browser Frames
export const BROWSER_DEVICES: DeviceSpec[] = [
  {
    id: 'chrome-browser',
    name: 'Chrome Browser',
    category: 'browser',
    brand: 'browser',
    frame: {
      src: '/frames/browser-chrome.svg',
      width: 1200,
      height: 900,
      aspectRatio: 1200 / 900
    },
    contentArea: {
      x: 8,
      y: 78,
      width: 1184,
      height: 814
    },
    metadata: {
      orientation: 'landscape'
    },
    scaling: {
      minScale: 0.1,
      maxScale: 1.0,
      defaultScale: 0.5,
      maintainAspectRatio: true
    }
  },
  {
    id: 'safari-browser',
    name: 'Safari Browser',
    category: 'browser',
    brand: 'browser',
    frame: {
      src: '/frames/browser-safari.svg',
      width: 1200,
      height: 900,
      aspectRatio: 1200 / 900
    },
    contentArea: {
      x: 8,
      y: 78,
      width: 1184,
      height: 814
    },
    metadata: {
      orientation: 'landscape'
    },
    scaling: {
      minScale: 0.1,
      maxScale: 1.0,
      defaultScale: 0.5,
      maintainAspectRatio: true
    }
  },
  {
    id: 'firefox-browser',
    name: 'Firefox Browser',
    category: 'browser',
    brand: 'browser',
    frame: {
      src: '/frames/browser-firefox.svg',
      width: 1200,
      height: 900,
      aspectRatio: 1200 / 900
    },
    contentArea: {
      x: 8,
      y: 78,
      width: 1184,
      height: 814
    },
    metadata: {
      orientation: 'landscape'
    },
    scaling: {
      minScale: 0.1,
      maxScale: 1.0,
      defaultScale: 0.5,
      maintainAspectRatio: true
    }
  }
]

// Combined device collections
export const ALL_DEVICES: DeviceSpec[] = [
  ...MOBILE_DEVICES,
  ...TABLET_DEVICES,
  ...DESKTOP_DEVICES,
  ...BROWSER_DEVICES
]

// Device categories for organization
export const DEVICE_CATEGORIES = {
  mobile: MOBILE_DEVICES,
  tablet: TABLET_DEVICES,
  desktop: DESKTOP_DEVICES,
  browser: BROWSER_DEVICES
} as const

// Utility functions
export function getDeviceById(id: string): DeviceSpec | undefined {
  return ALL_DEVICES.find(device => device.id === id)
}

export function getDevicesByCategory(category: keyof typeof DEVICE_CATEGORIES): DeviceSpec[] {
  return DEVICE_CATEGORIES[category] || []
}

export function getDevicesByBrand(brand: DeviceSpec['brand']): DeviceSpec[] {
  return ALL_DEVICES.filter(device => device.brand === brand)
}

export function calculateScaledContentArea(
  device: DeviceSpec,
  frameWidth: number,
  frameHeight: number
): DeviceContentArea {
  const scaleX = frameWidth / device.frame.width
  const scaleY = frameHeight / device.frame.height
  
  return {
    x: device.contentArea.x * scaleX,
    y: device.contentArea.y * scaleY,
    width: device.contentArea.width * scaleX,
    height: device.contentArea.height * scaleY
  }
}

export function getOptimalFrameSize(
  device: DeviceSpec,
  containerWidth: number,
  containerHeight: number,
  padding: number = 40
): { width: number; height: number; scale: number } {
  const availableWidth = containerWidth - padding
  const availableHeight = containerHeight - padding
  
  const scaleX = availableWidth / device.frame.width
  const scaleY = availableHeight / device.frame.height
  
  let scale = Math.min(scaleX, scaleY)
  scale = Math.max(device.scaling.minScale, Math.min(device.scaling.maxScale, scale))
  
  return {
    width: device.frame.width * scale,
    height: device.frame.height * scale,
    scale
  }
}

export function isDevicePortrait(device: DeviceSpec): boolean {
  return device.metadata.orientation === 'portrait'
}

export function isDeviceLandscape(device: DeviceSpec): boolean {
  return device.metadata.orientation === 'landscape'
}

export function isDeviceDesktop(device: DeviceSpec): boolean {
  return device.metadata.orientation === 'desktop'
}

// Popular device presets for quick access
export const POPULAR_DEVICES = [
  'iphone-15-pro',
  'iphone-15',
  'ipad-pro-12-9',
  'macbook-pro-16',
  'macbook-air-15',
  'chrome-browser',
  'pixel-8-pro'
] as const

export type PopularDeviceId = typeof POPULAR_DEVICES[number]

export function getPopularDevices(): DeviceSpec[] {
  return POPULAR_DEVICES.map(id => getDeviceById(id)).filter(Boolean) as DeviceSpec[]
}
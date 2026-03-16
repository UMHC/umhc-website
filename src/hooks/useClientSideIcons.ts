'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface IconLayout {
  src: string
  top: number
  left?: number
  right?: number
  size: number
  opacity: string
  id: string
}

interface IconLayoutResult {
  leftIcons: IconLayout[]
  rightIcons: IconLayout[]
  bottomIcons: IconLayout[]
  isClient: boolean
}

interface UseClientSideIconsProps {
  activityIcons: string[]
  visibleEventsCount: number
  hasMoreEvents: boolean
}

export function useClientSideIcons({ 
  activityIcons, 
  visibleEventsCount, 
  hasMoreEvents 
}: UseClientSideIconsProps): IconLayoutResult {
  const [isClient, setIsClient] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 1024, height: 768 })
  const [contentHeight, setContentHeight] = useState(0)
  const [iconLayout, setIconLayout] = useState<{ leftIcons: IconLayout[], rightIcons: IconLayout[], bottomIcons: IconLayout[] }>({
    leftIcons: [],
    rightIcons: [],
    bottomIcons: []
  })
  
  const containerRef = useRef<HTMLDivElement | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
  }, [])

  // Optimized debounced resize handler with longer debounce
  const debouncedResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const newSize = {
          width: window.innerWidth,
          height: window.innerHeight
        }
        // Only update if size actually changed significantly
        setWindowSize(prev => {
          if (Math.abs(prev.width - newSize.width) > 50 || Math.abs(prev.height - newSize.height) > 50) {
            return newSize
          }
          return prev
        })
      }
    }, 150) // Increased debounce to 150ms for better performance
  }, [])

  // Window resize listener
  useEffect(() => {
    if (!isClient) return

    window.addEventListener('resize', debouncedResize)
    return () => {
      window.removeEventListener('resize', debouncedResize)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [isClient, debouncedResize])

  // Optimized content height observer with throttling
  useEffect(() => {
    if (!isClient) return

    const observeContentHeight = () => {
      // Find the main content container
      const mainContent = document.querySelector('[data-schedule-content]')
      if (mainContent && mainContent !== containerRef.current) {
        containerRef.current = mainContent as HTMLDivElement
        
        // Use ResizeObserver for precise content height tracking
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect()
        }
        
        let lastHeight = 0
        resizeObserverRef.current = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const newHeight = entry.contentRect.height
            // Only update if height changed significantly (reduces unnecessary re-renders)
            if (Math.abs(newHeight - lastHeight) > 20) {
              lastHeight = newHeight
              setContentHeight(newHeight)
            }
          }
        })
        
        resizeObserverRef.current.observe(mainContent)
      }
    }

    // Initial observation with delay to avoid immediate DOM queries
    const timeoutId = setTimeout(observeContentHeight, 100)
    
    return () => {
      clearTimeout(timeoutId)
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [isClient])


  // Memoize the activityIcons array to prevent infinite re-renders
  const memoizedActivityIcons = useMemo(() => activityIcons, [activityIcons])

  // Memoized layout calculation to avoid expensive recalculations
  const iconLayoutData = useMemo(() => {
    if (!isClient || memoizedActivityIcons.length === 0) {
      return { leftIcons: [], rightIcons: [], bottomIcons: [] }
    }

    const screenWidth = windowSize.width
    const screenHeight = windowSize.height
      
      // Responsive breakpoints and sizing (maintaining current limits)
      const isSmall = screenWidth < 640
      const isMedium = screenWidth >= 640 && screenWidth < 1024
      const isLarge = screenWidth >= 1024
      const isXLarge = screenWidth >= 1280
      
      // Detect vertical tablet (portrait orientation with medium width)
      const isVerticalTablet = isMedium && screenHeight > screenWidth

      // Icon sizing (keep current max sizes)
      const iconSize = isSmall ? 35 : isMedium ? 45 : 55

      // Dynamic spacing based on screen size and available space
      const baseVerticalSpacing = isSmall ? 80 : isMedium ? 100 : 140
      const verticalSpacing = Math.max(baseVerticalSpacing, iconSize + 25) // Ensure minimum spacing

      // Calculate responsive padding from edges - special handling for vertical tablets
      const basePadding = isSmall ? 15 : isVerticalTablet ? 8 : isMedium ? 12 : isLarge ? 30 : isXLarge ? 35 : 40 // Extra close on vertical tablets
      const sidePadding = Math.max(basePadding, iconSize / 2 + (isVerticalTablet ? 5 : 10)) // Reduced minimum margin on vertical tablets

      // Calculate total content area height
      const headerHeight = isSmall ? 550 : isMedium ? 480 : 450
      const eventHeight = isSmall ? 120 : isMedium ? 95 : 85
      const eventListHeight = visibleEventsCount * eventHeight
      const loadMoreButtonHeight = hasMoreEvents ? (isSmall ? 100 : 80) : 0
      const mobileLayoutBuffer = isSmall ? 50 : 0
      const bottomBuffer = 200 // Extra buffer for expansion

      // Use actual content height if available, otherwise calculate
      const actualContentHeight = contentHeight || (headerHeight + eventListHeight + loadMoreButtonHeight + mobileLayoutBuffer)
      const totalContentAreaHeight = Math.max(actualContentHeight + bottomBuffer, screenHeight)

      // Calculate vertical icon positions
      const startPosition = 100
      const endPosition = totalContentAreaHeight - 100
      const availableHeight = endPosition - startPosition
      const iconsPerColumn = Math.floor(availableHeight / verticalSpacing)

      const leftIcons: IconLayout[] = []
      const rightIcons: IconLayout[] = []
      const bottomIcons: IconLayout[] = []

      // Generate left side icons (single column only)
      for (let row = 0; row < iconsPerColumn; row++) {
        const iconIndex = row % memoizedActivityIcons.length
        const topPosition = startPosition + (row * verticalSpacing)
        
        leftIcons.push({
          src: `/images/activity-images/${memoizedActivityIcons[iconIndex]}.webp`,
          top: topPosition,
          left: sidePadding,
          size: iconSize,
          opacity: row % 2 === 0 ? 'opacity-8' : 'opacity-7',
          id: `left-${row}`
        })
      }

      // Generate right side icons (single column only)
      for (let row = 0; row < iconsPerColumn; row++) {
        const iconIndex = (row + Math.floor(memoizedActivityIcons.length / 2)) % memoizedActivityIcons.length
        const topPosition = startPosition + (row * verticalSpacing) + (isSmall ? 15 : 20) // Slight offset
        
        rightIcons.push({
          src: `/images/activity-images/${memoizedActivityIcons[iconIndex]}.webp`,
          top: topPosition,
          right: sidePadding,
          size: iconSize,
          opacity: row % 2 === 0 ? 'opacity-7' : 'opacity-8',
          id: `right-${row}`
        })
      }

      // Generate bottom row icons in the dedicated icon zone
      // Find the icon zone and position icons within it
      const iconZone = document.querySelector('[data-icon-zone]')
      let bottomRowPosition = totalContentAreaHeight - 100 // Fallback position
      
      if (iconZone) {
        const iconZoneRect = iconZone.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        // Position icons in the center of the dedicated icon zone
        bottomRowPosition = iconZoneRect.top + scrollTop + (iconZoneRect.height / 2) - (iconSize / 2)
      }
      
      // Create dynamic bottom row that scales with window width but avoids side column overlap
      // Calculate buffer space - much smaller on mobile for maximum width
      const sideIconBuffer = isSmall ? 10 : sidePadding + iconSize + (isMedium ? 15 : 20) // Minimal buffer on mobile
      const availableBottomWidth = screenWidth - (sideIconBuffer * 2) // Dynamic width avoiding side columns
      
      // Scale the usable width based on screen size and orientation
      const widthMultiplier = isSmall ? 1.0 : isVerticalTablet ? 0.8 : isMedium ? 0.92 : 0.95 // Narrower on vertical tablets
      const maxBottomWidth = availableBottomWidth * widthMultiplier
      
      const horizontalSpacing = isSmall ? Math.max(iconSize + 25, 80) : Math.max(iconSize + 40, 120) // Tighter spacing on mobile
      const bottomIconsCount = Math.max(1, Math.floor(maxBottomWidth / horizontalSpacing)) // Dynamic count based on available space
      
      // Calculate total width of all icons to center them
      const totalIconsWidth = (bottomIconsCount - 1) * horizontalSpacing + iconSize
      const startOffset = (screenWidth - totalIconsWidth) / 2 // Center the entire row
      
      for (let col = 0; col < bottomIconsCount; col++) {
        const iconIndex = (col + Math.floor(memoizedActivityIcons.length / 3)) % memoizedActivityIcons.length // Different offset for variety
        const leftPosition = startOffset + (col * horizontalSpacing)
        
        bottomIcons.push({
          src: `/images/activity-images/${memoizedActivityIcons[iconIndex]}.webp`,
          top: bottomRowPosition,
          left: leftPosition,
          size: iconSize,
          opacity: col % 2 === 0 ? 'opacity-7' : 'opacity-6', // Slightly more subtle for bottom row
          id: `bottom-${col}`
        })
      }

    return { leftIcons, rightIcons, bottomIcons }
  }, [isClient, windowSize.width, windowSize.height, contentHeight, memoizedActivityIcons, visibleEventsCount, hasMoreEvents])

  // Update layout state only when memoized data changes
  useEffect(() => {
    setIconLayout(iconLayoutData)
  }, [iconLayoutData])

  return {
    leftIcons: iconLayout.leftIcons,
    rightIcons: iconLayout.rightIcons,
    bottomIcons: iconLayout.bottomIcons,
    isClient
  }
}
import React, { memo } from 'react'
import Image from 'next/image'

interface OptimizedIconProps {
  src: string
  size: number
  top: number
  left?: number
  right?: number
  opacity: string
  id: string
}

const OptimizedIcon = memo(function OptimizedIcon({
  src,
  size,
  top,
  left,
  right,
  opacity,
  id
}: OptimizedIconProps) {
  return (
    <Image
      key={id}
      src={src}
      alt=""
      width={size}
      height={size}
      className={`absolute ${opacity}`}
      style={{ 
        left: left ? `${left}px` : undefined,
        right: right ? `${right}px` : undefined,
        top: `${top}px`, 
        width: `${size}px`, 
        height: `${size}px`,
        imageRendering: 'crisp-edges'
      }}
      loading="lazy"
      sizes={`${size}px`}
    />
  )
})

export default OptimizedIcon
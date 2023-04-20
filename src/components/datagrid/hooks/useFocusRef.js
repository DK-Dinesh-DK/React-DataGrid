
import React, { useRef } from "react"
import { useLayoutEffect } from "./useLayoutEffect"

export function useFocusRef(isSelected) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    if (!isSelected) return
    ref.current?.focus({ preventScroll: true })
  }, [isSelected])

  return {
    ref,
    tabIndex: isSelected ? 0 : -1
  }
}

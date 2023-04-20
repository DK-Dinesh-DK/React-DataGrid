
import React, { useRef, useEffect, useCallback } from "react"

// https://reactjs.org/docs/hooks-faq.html#what-can-i-do-if-my-effect-dependencies-change-too-often
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useLatestFunc(fn) {
  const ref = useRef(fn)

  useEffect(() => {
    ref.current = fn
  })

  const callbackFn = useCallback((...args) => {
    ref.current(...args)
  }, [])

  // @ts-expect-error
  return fn ? callbackFn : fn
}

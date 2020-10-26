import { MutableRefObject, useEffect, useRef, useState } from "react"

interface IRefCurrentModel {
  children: HTMLElement[]
}

const hoveredObject: { item: null | HTMLElement } = { item: null }
const outObject: { item: null | HTMLElement } = { item: null }

document.addEventListener("mouseover", (e: MouseEvent): void => {
  hoveredObject.item = e.target as HTMLElement
})

document.addEventListener("mouseout", (e: MouseEvent): void => {
  outObject.item = e.target as HTMLElement
})

const getChildrenArray = (children: HTMLElement[]): HTMLElement[] =>
  [].slice.call(children)

const isHoveredDeep = (
  children: HTMLElement[],
  target: HTMLElement | null
): boolean => {
  return children.some((element: HTMLElement): boolean => {
    if (element === target) {
      return true
    }
    if (element.children) {
      return isHoveredDeep(getChildrenArray(element.children as any), target)
    }
    return false
  })
}

function useHover<T>(timeOut: number): [MutableRefObject<T | null>, boolean] {
  const [value, setValue] = useState<boolean>(false)
  const ref = useRef<T>(null)

  const handleMouseOver = (): void => {
    if (value) {
      return
    }

    setTimeout((): void => {
      if (ref.current === hoveredObject.item) {
        return setValue(true)
      }
      const arrayChildren = getChildrenArray(
        (ref.current as T & IRefCurrentModel).children
      )
      const isHovered = isHoveredDeep(arrayChildren, hoveredObject.item)

      if (isHovered) {
        setValue(true)
      }
    }, timeOut)
  }

  const handleMouseOut = (): void => {
    const arrayChildren = getChildrenArray(
      (ref.current as T & IRefCurrentModel).children
    )

    const isHovered = isHoveredDeep(arrayChildren, outObject.item)
    if (isHovered) {
      return
    }

    setValue(false)
  }

  useEffect(
    (): (() => void) | void => {
      const node = ref.current as any
      if (node) {
        node.addEventListener("mouseover", handleMouseOver)
        node.addEventListener("mouseleave", handleMouseOut)

        return (): void => {
          node.removeEventListener("mouseover", handleMouseOver)
          node.removeEventListener("mouseleave", handleMouseOut)
        }
      }
    },
    [] // Recall only if ref changes
  )

  return [ref, value]
}

export { useHover }

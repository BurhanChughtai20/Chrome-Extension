"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { ColorModeProvider } from "./color-mode"
import type { ColorModeProviderProps } from "../../hooks/use-color-mode"
export function Provider(props: ColorModeProviderProps) {
  return (
    <ColorModeProvider {...props}>
      <ChakraProvider value={defaultSystem}>
        {props.children}
      </ChakraProvider>
    </ColorModeProvider>
  )
}
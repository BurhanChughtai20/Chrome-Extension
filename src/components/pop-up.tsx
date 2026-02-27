"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Copy } from "lucide-react";
import {
  Box,
  Button,
  Textarea,
  Text,
  Heading,
  Badge,
  Separator,
  Stack,
  HStack,
  Grid,
} from "@chakra-ui/react";
import { getUserUUID, useTextSelection, useToolsConfig } from "../shared";

const Popup = (): ReactNode => {
  const popupRef = useRef<HTMLDivElement>(null);
  const uuid = useMemo(() => getUserUUID(), []);
  const { optimizationTools, exportActions } = useToolsConfig();
  const { text, isLoading, setText } = useTextSelection();

  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // FLOATING SELECTION LOGIC
  const handleSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      if (!popupRef.current?.contains(document.activeElement)) {
        setIsVisible(false);
      }
      return;
    }

    const selectedText = sel.toString().trim();
    if (!selectedText) {
      setIsVisible(false);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setText(selectedText);
    setCoords({
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 8,
    });
    setIsVisible(true);
  }, [setText]);

  useEffect(() => {
    let timeoutId: number;
    const debouncedHandle = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(handleSelection, 100);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mouseup", debouncedHandle);
    document.addEventListener("keyup", debouncedHandle);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", debouncedHandle);
      document.removeEventListener("keyup", debouncedHandle);
      document.removeEventListener("mousedown", handleClickOutside);
      window.clearTimeout(timeoutId);
    };
  }, [handleSelection]);

  const handleCopy = useCallback(async () => {
    if (!text.trim()) return;
    await navigator.clipboard.writeText(text);
  }, [text]);

  const handleToolAction = useCallback(
    (action: (text: string) => string) => {
      setText(prev => action(prev));
    },
    [setText]
  );

  const handleExport = useCallback(
    (action: (text: string) => void) => {
      if (!text.trim()) return;
      action(text);
    },
    [text]
  );

  if (!isVisible) return null;

  return (
    <Box
      ref={popupRef}
      position="fixed"
      top={`${coords.y}px`}
      left={`${coords.x}px`}
      w="460px"
      maxW="90vw"
      zIndex={9999}
      pointerEvents="auto"
    >
      <Box
        bg="black"
        borderRadius="2xl"
        boxShadow="0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)"
        borderWidth="1px"
        p="5"
        backdropFilter="blur(20px)"
      >
        <HStack justify="space-between" mb="4">
          <Stack gap="0">
            <Heading
              size="md"
              bgGradient="linear(to-r, blue.500, indigo.500)"
              bgClip="text"
              fontWeight="extrabold"
            >
              TextPro
            </Heading>
            <Text fontSize="xs" color="gray.500">
              v1.0
            </Text>
          </Stack>

          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1,
            }}
            style={{
              height: 8,
              width: 8,
              borderRadius: "50%",
              backgroundColor: "#22c55e",
            }}
          />
        </HStack>

        <Stack gap="5">
          <Box position="relative">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Selected text will appear here..."
              resize="none"
              h="180px"
              borderRadius="xl"
              fontSize="sm"
              borderColor="gray.700"
            />

            <Button
              size="sm"
              position="absolute"
              bottom="12px"
              right="12px"
              borderRadius="lg"
              onClick={handleCopy}
              disabled={!text.trim()}
            >
              <HStack gap="1">
                <Copy size={14} />
                <Text fontSize="xs">Copy</Text>
              </HStack>
            </Button>
          </Box>

          <Box>
            <Text
              fontSize="xs"
              fontWeight="semibold"
              textTransform="uppercase"
              letterSpacing="wider"
              color="gray.500"
              mb="3"
            >
              Optimization Tools
            </Text>

            <Grid templateColumns="repeat(2, 1fr)" gap="2">
              {optimizationTools.map((tool) => (
                <Button
                  key={tool.id}
                  variant="outline"
                  borderRadius="xl"
                  onClick={() => handleToolAction(tool.action)}
                  disabled={!text.trim()}
                >
                  <HStack gap="2">
                    {tool.icon}
                    <Text fontSize="sm">{tool.label}</Text>
                  </HStack>
                </Button>
              ))}
            </Grid>
          </Box>

          <Separator />

          <Grid templateColumns="repeat(2, 1fr)" gap="3">
            {exportActions.map((item) => (
              <Button
                key={item.id}
                colorScheme={item.colorPalette} // Chakra uses colorScheme instead of colorPalette
                borderRadius="xl"
                onClick={() => handleExport(item.action)}
                disabled={!text.trim()}
              >
                <HStack gap="2">
                  {item.icon}
                  <Text fontSize="sm">{item.label}</Text>
                </HStack>
              </Button>
            ))}
          </Grid>

          <HStack
            justify="space-between"
            fontSize="xs"
            color="gray.500"
            fontFamily="mono"
          >
            <Text>Session: {uuid.slice(0, 8)}</Text>
            <Badge
              colorScheme={isLoading ? "yellow" : "green"} // Chakra uses colorScheme
              borderRadius="md"
            >
              {isLoading ? "Loading..." : "Ready"}
            </Badge>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
};

export default Popup;
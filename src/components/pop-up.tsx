"use client";

import { useMemo, useCallback } from "react";
import type { ReactElement } from "react";
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

const Popup = (): ReactElement =>{
  const uuid = useMemo(() => getUserUUID(), []);
  const { optimizationTools, exportActions } = useToolsConfig();
  const { text, isLoading, fetchSelection, setText } = useTextSelection();

  useMemo(() => {
    fetchSelection();
  }, [fetchSelection]);

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

  return (
    <Box w="460px" p="3" bg="black">
      <Box
        bg="black"
        borderRadius="2xl"
        boxShadow="0 10px 25px rgba(255,255,255,0.15)"
        borderWidth="1px"
        p="5"
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
                colorPalette={item.colorPalette}
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
              colorPalette={isLoading ? "yellow" : "green"}
              borderRadius="md"
            >
              {isLoading ? "Loading..." : "Ready"}
            </Badge>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}

export default Popup;
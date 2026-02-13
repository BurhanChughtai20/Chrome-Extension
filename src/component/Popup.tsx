"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Copy,
  FileText,
  FileDown,
  Smile,
  Frown,
} from "lucide-react";

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

import { getUserUUID } from "../utils/uuid";
import { exportDOCX, exportPDF } from "../utils/exportUtils";
import {
  cleanFormatting,
  removeEmojis,
  replaceEmojiWithText,
} from "../utils/textUtils";

export default function Popup():React.JSX.Element {
  const [text, setText] = useState<string>("");
  const uuid: string = getUserUUID();

  useEffect((): void => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab?.id) {
          chrome.scripting.executeScript(
            {
              target: { tabId: activeTab.id },
              func: (): string | undefined =>
                window.getSelection()?.toString(),
            },
            (selection) => {
              const selectedText = selection?.[0]?.result;
              if (typeof selectedText === "string") {
                setText(selectedText);
              }
            }
          );
        }
      });
    }
  }, []);

  const handleCopy = async (): Promise<void> => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
  };

  return (
    <Box w="460px" p="3" bg="black">
     <Box
  bg="black"
  borderRadius="2xl"
  boxShadow="0 10px 25px rgba(255, 255, 255, 0.15)"
  borderWidth="1px"
  p="5"
>

        {/* Header */}
        <HStack justify="space-between" align="center" mb="4">
          <Stack gap="0" align="start">
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
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
            style={{
              height: 8,
              width: 8,
              borderRadius: "50%",
              backgroundColor: "#22c55e",
            }}
          />
        </HStack>

        <Stack gap="5">
          {/* Text Area */}
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
            >
              <HStack gap="1">
                <Copy size={14} />
                <Text fontSize="xs">Copy</Text>
              </HStack>
            </Button>
          </Box>

          {/* Optimization Tools */}
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

            <Stack gap="2">
              <Button
                variant="outline"
                borderRadius="xl"
                onClick={() => setText(cleanFormatting(text))}
              >
                <HStack gap="2">
                  <Sparkles size={16} />
                  <Text fontSize="sm">Smart Format & Clean</Text>
                </HStack>
              </Button>

              <Grid templateColumns="repeat(2, 1fr)" gap="2">
                <Button
                  variant="outline"
                  borderRadius="xl"
                  onClick={() => setText(removeEmojis(text))}
                >
                  <HStack gap="2">
                    <Frown size={16} />
                    <Text fontSize="sm">No Emojis</Text>
                  </HStack>
                </Button>

                <Button
                  variant="outline"
                  borderRadius="xl"
                  onClick={() => setText(replaceEmojiWithText(text))}
                >
                  <HStack gap="2">
                    <Smile size={16} />
                    <Text fontSize="sm">Text Emojis</Text>
                  </HStack>
                </Button>
              </Grid>
            </Stack>
          </Box>

          <Separator />

          {/* Export Section */}
          <Grid templateColumns="repeat(2, 1fr)" gap="3">
            <Button
              colorPalette="gray"
              borderRadius="xl"
              onClick={() => exportPDF(text)}
            >
              <HStack gap="2">
                <FileDown size={16} />
                <Text fontSize="sm">PDF</Text>
              </HStack>
            </Button>

            <Button
              colorPalette="blue"
              borderRadius="xl"
              onClick={() => exportDOCX(text)}
            >
              <HStack gap="2">
                <FileText size={16} />
                <Text fontSize="sm">Word</Text>
              </HStack>
            </Button>
          </Grid>

          {/* Footer */}
          <HStack
            justify="space-between"
            fontSize="xs"
            color="gray.500"
            fontFamily="mono"
          >
            <Text>Session: {uuid.slice(0, 8)}</Text>
            <Badge colorPalette="gray" borderRadius="md">
              Ready
            </Badge>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}

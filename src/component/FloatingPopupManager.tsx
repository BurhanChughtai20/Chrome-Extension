// FloatingPopupManager.tsx
import React, { useState, useEffect } from "react";
import { Box, Button, Stack, HStack, Text, Grid, Badge, Textarea, Heading } from "@chakra-ui/react";
import { Sparkles, Copy, FileText, FileDown, Smile, Frown } from "lucide-react";
import { cleanFormatting, removeEmojis, replaceEmojiWithText } from "../utils/textUtils";
import { exportDOCX, exportPDF } from "../utils/exportUtils";
import { getUserUUID } from "../utils/uuid";

// ---------------------
// Floating Popup Component
// ---------------------
const FloatingPopup: React.FC<{ text: string; x: number; y: number; onClose: () => void }> = ({ text: initialText, x, y, onClose }) => {
  const [text, setText] = useState(initialText);
  const uuid = getUserUUID();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const popup = document.getElementById("floating-popup");
      if (popup && !popup.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
  };

  return (
    <Box
      id="floating-popup"
      position="fixed"
      top={y}
      left={x}
      w="400px"
      bg="gray.900"
      p="4"
      borderRadius="2xl"
      boxShadow="0 10px 25px rgba(0,0,0,0.3)"
      color="white"
      zIndex={9999}
    >
      <Heading size="sm" mb={2}>TextPro</Heading>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Selected text will appear here..." resize="none" h="100px" mb={3} />
      <Stack gap={2}>
        <HStack gap={2}>
          <Button size="sm" colorScheme="blue" onClick={() => setText(cleanFormatting(text))}>
            <Sparkles size={16}/> Clean
          </Button>
          <Button size="sm" colorScheme="green" onClick={handleCopy}>
            <Copy size={16}/> Copy
          </Button>
        </HStack>

        <HStack gap={2}>
          <Button size="sm" colorScheme="gray" onClick={() => setText(removeEmojis(text))}>
            <Frown size={16}/> No Emojis
          </Button>
          <Button size="sm" colorScheme="gray" onClick={() => setText(replaceEmojiWithText(text))}>
            <Smile size={16}/> Text Emojis
          </Button>
        </HStack>

        <Grid templateColumns="repeat(2, 1fr)" gap={2}>
          <Button size="sm" colorScheme="purple" onClick={() => exportPDF(text)}>
            <FileDown size={16}/> PDF
          </Button>
          <Button size="sm" colorScheme="orange" onClick={() => exportDOCX(text)}>
            <FileText size={16}/> Word
          </Button>
        </Grid>

        <HStack justify="space-between" fontSize="xs" color="gray.400">
          <Text>Session: {uuid.slice(0, 8)}</Text>
          <Badge colorScheme="green">Ready</Badge>
        </HStack>
      </Stack>
    </Box>
  );
};

// ---------------------
// Floating Popup Manager (auto-run)
// ---------------------
const FloatingPopupManager: React.FC = () => {
  const [popup, setPopup] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const selection = window.getSelection()?.toString().trim();
      if (!selection) {
        setPopup(null);
        return;
      }
      const offsetX = 10;
      const offsetY = 10;
      setPopup({ text: selection, x: e.pageX + offsetX, y: e.pageY + offsetY });
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return popup ? (
    <FloatingPopup
      text={popup.text}
      x={popup.x}
      y={popup.y}
      onClose={() => setPopup(null)}
    />
  ) : null;
};

export default FloatingPopupManager;

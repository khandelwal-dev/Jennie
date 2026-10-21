import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  StatusBar,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.252.149.244:3000"; // ahh make sure to change this with right  IPv4 Address 

const MESSAGES_KEY = "@jennie_messages";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Reference to FlatList
  const flatListRef = useRef(null);

  // Load saved conversation
  useEffect(() => {
    loadMessages();
  }, []);

  // Automatically scroll whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({
          animated: true,
        });
      }, 100);
    }
  }, [messages]);

  async function loadMessages() {
    try {
      const savedMessages = await AsyncStorage.getItem(MESSAGES_KEY);

      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }

  async function saveMessages(newMessages) {
    try {
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(newMessages));
    } catch (error) {
      console.error("Failed to save messages:", error);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
    };

    const updatedMessages = [...messages, userMessage];

    // Add user's message immediately
    setMessages(updatedMessages);

    // Save conversation
    await saveMessages(updatedMessages);

    // Clear input
    setInput("");

    // Hide keyboard
    Keyboard.dismiss();

    // Show typing indicator
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      const finalMessages = [
        ...updatedMessages,
        {
          role: "assistant",
          content: data.reply,
        },
      ];

      setMessages(finalMessages);

      await saveMessages(finalMessages);
    } catch (error) {
      console.error(error);

      const errorMessages = [
        ...updatedMessages,
        {
          role: "assistant",
          content: "Ugh 😭 I couldn't connect to my brain right now.",
        },
      ];

      setMessages(errorMessages);

      await saveMessages(errorMessages);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <StatusBar barStyle={'light-content'} />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <Text style={styles.title}>Jennie</Text>

            <Text style={styles.subtitle}>Your bestie ❤️</Text>
          </View>

          {/* CHAT */}

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.message,
                  item.role === "user"
                    ? styles.userMessage
                    : styles.jennieMessage,
                ]}
              >
                <Text style={styles.messageText}>{item.content}</Text>
              </View>
            )}
          />

          {/* TYPING INDICATOR */}

          {loading && (
            <View style={styles.typingContainer}>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>

                <Text style={styles.typingText}>Jennie is typing...</Text>
              </View>
            </View>
          )}

          {/* INPUT */}

          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Message Jennie..."
              placeholderTextColor="#888"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={2000}
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.sendButton, loading && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={loading}
            >
              <Text style={styles.sendText}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },

  keyboardContainer: {
    flex: 1,
  },

  header: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#292929",
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "200",
  },

  subtitle: {
    color: "#aaa",
    marginTop: 3,
    display: "none"
  },

  messages: {
    padding: 16,
    gap: 10,
    flexGrow: 1,
    paddingBottom: 12,
  },

  message: {
    padding: 13,
    borderRadius: 18,
    maxWidth: "82%",
  },

  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#333",
  },

  jennieMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#222",
  },

  messageText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },

  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  typingBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#222",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  typingDots: {
    flexDirection: "row",
    marginRight: 8,
    gap: 4,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#aaa",
  },

  typingText: {
    color: "#888",
    fontSize: 13,
  },

  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#292929",
  },

  input: {
    flex: 1,
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 11,
    maxHeight: 100,
    fontSize: 16,
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  sendButtonDisabled: {
    opacity: 0.5,
  },

  sendText: {
    color: "#000",
    fontSize: 22,
  },
});

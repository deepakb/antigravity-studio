---
name: expo-router-navigation
description: "Architecture for high-scale Expo Router and React Native applications. Focuses on Typed Navigation, Deep Linking, and Platform-Specific Optimization."
---

# SKILL: Enterprise Expo Router & Mobile

## Overview
Architecture for high-scale **Expo Router** and **React Native** applications. Focuses on **Typed Navigation**, **Deep Linking**, and **Platform-Specific Optimization**.

## 1. Typed Navigation Architecture
- **Router**: Use the new file-based routing in Expo Router v3.
- **Typing**: Ensure all routes and parameters are typed using the generated `expo-router` types.

## 2. Deep Linking & App Association
- **Standard**: Define your `scheme` and `universal links` in `app.json`.
- **Testing**: Verify that clicking a link in a browser correctly opens the corresponding state in the standalone app.

## 3. Platform-Specific Design Patterns
- **Standard**: Use the `Platform` module to adjust UI for iOS vs Android (e.g., Status Bar height, Bottom Tabs position).
- **Responsive**: Use `useWindowDimensions` to handle Tablet vs Phone layouts gracefully.

## 4. Performance: FlashList & Asset Preloading
- **Rendering**: Use `@shopify/flash-list` for long lists to avoid performance degradation.
- **Assets**: Preload images and fonts in the `_layout.tsx` before showing the splash screen.

## 5. Auth & Persistence (Secure Store)
- **Security**: Never store JWTs in `AsyncStorage`. Use `expo-secure-store` for hardware-encrypted persistence.

## Skills to Load
- `react-native-best-practices`
- `mobile-performance-optimization`
- `secure-state-persistence`

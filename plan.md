# Pomodoro App - Planning Document

## Project Overview
A single-page, widget-style dashboard for a pomodoro timer with essential time-management features. Clean, minimal interface for focused work sessions.

## Core Features

### 1. Timer Controls
- **Start**: Begin the pomodoro session (default 25 minutes)
- **Pause**: Temporarily stop the timer
- **Stop/Reset**: Clear the timer and return to initial state
- Visual countdown display (MM:SS format)
- Session type indicator (Work / Break)

### 2. Session Management
- Work session: 25 minutes (configurable)
- Short break: 5 minutes (configurable)
- Automatic switching between work and break sessions
- Visual/audio notification when session completes
- both Browser notifications and simple toast alerts

### 3. Usage Records/Statistics
- Daily pomodoro count
- Total time tracked today
- Session history (last 7 days)
- Completion rate for today
- Simple chart or stats display

### 4. Settings/Customization
- Adjustable work duration
- Adjustable break duration
- Toggle sound notifications
- Toggle desktop notifications

### 5. UI Components
- Large central timer display
- Control buttons (Start, Pause, Reset in a row)
- Session info badge
- Today's stats widget
- Settings gear icon (modal or collapsible)

## Tech Stack Assumptions (Based on Workspace)
- Framework: Next.js with React
- Styling: Tailwind CSS + shadcn/ui components
- State Management: React hooks (useState, useEffect)
- Storage: localStorage for daily records persistence


## future Enhancements (Post-MVP)
- 10 second warning before session ends
- timer is not working correctly when switching tabs

# My Game Project

This is a multiplayer game project built with TypeScript, featuring a modular client-server architecture. The client uses HTML Canvas for rendering and communicates with the server via WebSocket for real-time updates. The project is structured for scalability, maintainability, and easy extension with new scenes and UI components.

## Project Structure

```
my-game-project
├── src
│   ├── engine
│   │   └── index.ts         # Main Engine class
│   ├── net
│   │   └── GameSocket.ts    # WebSocket client
│   ├── scenes
│   │   ├── Scene.ts         # Scene interface
│   │   ├── LoginScene.ts
│   │   ├── RegisterScene.ts
│   │   ├── RoomsListScene.ts
│   │   ├── mainScene.ts
│   │   └── ...              # Other game scenes
│   ├── ui
│   │   ├── Button.ts
│   │   ├── Input.ts
│   │   ├── Modal.ts
│   │   ├── CanvasList.ts
│   │   └── TabsPanel.ts
│   ├── utils
│   │   ├── drawText.ts
│   │   └── cookie.ts
│   ├── index.ts             # Client entry point, Engine and scenes initialization
│   └── types
│       └── index.ts         # Shared types
├── server
│   ├── server.ts            # HTTP/WebSocket server
│   ├── ws
│   │   └── WSMessageHandler.ts # WebSocket event handling
│   └── ...                  # Server managers (UserManager, RoomManager, etc.)
├── package.json
├── tsconfig.json
├── README.md
└── ARCHITECTURE.md          # Project architecture description
```

## Features

- **Modular architecture:** Separate scenes, UI components, and utilities.
- **Client-server interaction:** Real-time updates via WebSocket, authentication via REST.
- **Flexible scene system:** Login, Register, Rooms List, Game, Room, Settings, and more.
- **UI components:** Button, Input, Modal, CanvasList, TabsPanel.
- **Modal window:** Supports custom content (any UI components inside).
- **Room management:** Create, join, delete, and update rooms in real time.
- **Token validation:** Uses cookies, automatic WebSocket connection with token.
- **Responsive Canvas:** Automatically resizes to fit the window.

## Getting Started

1. **Clone the repository:**

    ```
    git clone <repository-url>
    cd my-game-project
    ```

2. **Install dependencies:**

    ```
    npm install
    ```

3. **Build the project:**

    ```
    npm run build
    ```

4. **Start the server:**

    ```
    npm run server
    ```

5. **Start the client (local frontend server):**
    ```
    npm start
    ```

## Client-Server Interaction

- The client connects to the WebSocket server with a token in the query parameter.
- All events (room creation/joining/deletion, list updates) are handled via WebSocket.
- The server validates the token on every connection and event.

## Extending and Contributing

- Easily add new scenes, UI components, or server managers.
- All code is organized by purpose for easy maintenance.
- Pull requests and issues are welcome!

## More

- See [ARCHITECTURE.md](ARCHITECTURE.md) for a detailed architecture overview.
- For UI customization, see the `src/ui/` folder.
- To develop new scenes, implement the `Scene` interface from `src/scenes/Scene.ts

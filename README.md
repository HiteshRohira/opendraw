# OpenDraw - Enhanced Excalidraw with Multi-Scene Management

This project provides an enhanced drawing experience based on the fantastic [Excalidraw](https://excalidraw.com/) library. It allows users to create, save, load, and manage multiple drawing scenes directly in their browser using local IndexedDB storage.

## Features

- **Core Excalidraw Experience:** Leverages the powerful and intuitive drawing capabilities of Excalidraw.
- **Multi-Scene Management:**
  - Save multiple drawings with custom names.
  - Load previously saved scenes.
  - Rename existing scenes.
  - Delete scenes you no longer need.
- **Local Persistence:** All scenes are stored locally in your browser's IndexedDB, ensuring your data stays private.
- **Dark Mode UI:** Features a dark theme consistent across the Excalidraw canvas and the scene management interface, built with shadcn/ui and Tailwind CSS.
- **Auto-Save:** Automatically saves changes to the currently loaded scene after a brief period of inactivity.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd opendraw
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Run the development server:**
    ```bash
    pnpm dev
    ```
4.  Open your browser to the local URL provided (e.g., `http://localhost:5173`).

## Acknowledgements

This project would absolutely not be possible without the incredible work done by the **Excalidraw team**. Their open-source library provides the foundation for this application. Thank you!

- **Excalidraw GitHub:** [https://github.com/excalidraw/excalidraw](https://github.com/excalidraw/excalidraw)

Special thanks also to GitHub user **macintushar** for inspiration and reference code.

- **macintushar's Draw Project:** [https://github.com/macintushar/draw](https://github.com/macintushar/draw)

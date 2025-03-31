"use client";

import { Excalidraw, THEME } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import {
  ExcalidrawImperativeAPI,
  AppState,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import { useState, useEffect } from "react";
import { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { set, get, del } from "idb-keyval";
import { Button } from "@/components/ui/button";
import { FolderGit2 } from "lucide-react";
import { SceneListSheet } from "./SceneListSheet";

// Keys for IndexedDB storage
const SCENE_LIST_KEY = "excalidraw-scene-list"; // Stores array of {id: string, name: string}
const SCENE_DATA_PREFIX = "excalidraw-scene-data-"; // Prefix for individual scene data keys

// Interface for scene metadata
interface SceneMetadata {
  id: string;
  name: string;
  lastModified: number;
}

export const Draw = () => {
  const [excalidrawApi, setExcalidrawApi] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [savedScenes, setSavedScenes] = useState<SceneMetadata[]>([]);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);

  // Effect to load the list of saved scenes on mount
  useEffect(() => {
    const loadSceneList = async () => {
      try {
        const sceneList = await get<SceneMetadata[]>(SCENE_LIST_KEY);
        if (sceneList) {
          setSavedScenes(sceneList);
          console.log("Loaded scene list:", sceneList);
        } else {
          setSavedScenes([]);
          console.log("No scene list found in IndexedDB.");
        }
      } catch (error) {
        console.error("Failed to load scene list from IndexedDB:", error);
        setSavedScenes([]);
      }
    };
    loadSceneList();
  }, []);

  // Function to save the current scene with a name
  const saveScene = async (name: string) => {
    if (!excalidrawApi) return;

    const elements = excalidrawApi.getSceneElements();
    const appState = excalidrawApi.getAppState();
    const now = Date.now();

    let sceneId: string;
    const currentSceneData = savedScenes.find((s) => s.id === currentSceneId);

    // If a scene is loaded AND the provided name matches the loaded scene's name,
    // assume we are saving changes to the current scene.
    if (currentSceneData && currentSceneData.name === name) {
      sceneId = currentSceneId!;
    } else {
      // Otherwise, it's either a "Save As" (different name) or saving a new drawing.
      // Generate a new ID in both cases.
      sceneId = crypto.randomUUID();
    }

    const sceneDataKey = `${SCENE_DATA_PREFIX}${sceneId}`;

    try {
      await set(sceneDataKey, { elements, appState });

      const currentList = (await get<SceneMetadata[]>(SCENE_LIST_KEY)) || [];
      const existingSceneIndex = currentList.findIndex((s) => s.id === sceneId);

      let newList: SceneMetadata[];
      if (existingSceneIndex > -1) {
        // Update existing scene metadata
        newList = currentList.map((s, index) =>
          index === existingSceneIndex ? { ...s, name, lastModified: now } : s
        );
      } else {
        newList = [...currentList, { id: sceneId, name, lastModified: now }];
      }

      await set(SCENE_LIST_KEY, newList);
      setSavedScenes(newList);
      setCurrentSceneId(sceneId);
    } catch (error) {
      console.error(`Failed to save scene "${name}":`, error);
    }
  };

  // Function to load a specific scene by ID
  const loadScene = async (sceneId: string) => {
    if (!excalidrawApi) return;

    const sceneDataKey = `${SCENE_DATA_PREFIX}${sceneId}`;
    try {
      const sceneData = await get<{
        elements: ExcalidrawElement[];
        appState: AppState;
      }>(sceneDataKey);

      if (sceneData) {
        excalidrawApi.updateScene({
          elements: sceneData.elements,
          appState: sceneData.appState,
        });
        excalidrawApi.scrollToContent(sceneData.elements, {
          fitToContent: true,
        });
        setCurrentSceneId(sceneId);
        setIsSheetOpen(false);
      } else {
        console.error(`Scene data not found for ID: ${sceneId}`);
      }
    } catch (error) {
      console.error(`Failed to load scene ID ${sceneId}:`, error);
    }
  };

  // Function to delete a scene by ID
  const deleteScene = async (sceneId: string) => {
    const sceneDataKey = `${SCENE_DATA_PREFIX}${sceneId}`;
    try {
      await del(sceneDataKey);

      const currentList = (await get<SceneMetadata[]>(SCENE_LIST_KEY)) || [];
      const newList = currentList.filter((s) => s.id !== sceneId);
      await set(SCENE_LIST_KEY, newList);
      setSavedScenes(newList);

      if (currentSceneId === sceneId) {
        setCurrentSceneId(null);
      }

      console.log(`Scene ID: ${sceneId} deleted successfully.`);
    } catch (error) {
      console.error(`Failed to delete scene ID ${sceneId}:`, error);
    }
  };

  // Initial data is now minimal, loading happens via loadScene
  const minimalInitialData: ExcalidrawInitialDataState = {
    appState: {
      theme: THEME.DARK,
    },
  };

  return (
    <>
      <div className="h-[100dvh]">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawApi(api)}
          initialData={minimalInitialData}
          // TODO: Add back onChange auto-save
          // onChange={(elements, appState) => saveData(elements, appState)}
          renderTopRightUI={() => (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSheetOpen(true)}
            >
              <FolderGit2 className="h-5 w-5" />
            </Button>
          )}
        />
      </div>
      <SceneListSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        savedScenes={savedScenes}
        onLoadScene={loadScene}
        onSaveScene={saveScene}
        onDeleteScene={deleteScene}
        currentSceneId={currentSceneId}
      />
    </>
  );
};

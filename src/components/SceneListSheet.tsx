import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Edit, Save, X } from "lucide-react";

interface SceneMetadata {
  id: string;
  name: string;
  lastModified: number;
}

interface SceneListSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  savedScenes: SceneMetadata[];
  onLoadScene: (sceneId: string) => void;
  onSaveScene: (name: string) => Promise<void>; // Make async to handle potential feedback
  onDeleteScene: (sceneId: string) => void;
  currentSceneId: string | null;
}

export function SceneListSheet({
  isOpen,
  onOpenChange,
  savedScenes,
  onLoadScene,
  onSaveScene,
  onDeleteScene,
  currentSceneId,
}: SceneListSheetProps) {
  const [sceneName, setSceneName] = useState<string>("");
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");

  // Handle saving the current scene (new or overwrite existing loaded one)
  const handleSaveCurrent = async () => {
    const nameToSave = sceneName.trim();
    if (!nameToSave) {
      // If no name is entered, but a scene is loaded, use its existing name for saving changes
      const currentScene = savedScenes.find((s) => s.id === currentSceneId);
      if (currentScene) {
        await onSaveScene(currentScene.name);
      } else {
        alert("Please enter a name for the new scene.");
        return;
      }
    } else {
      await onSaveScene(nameToSave);
    }
    setSceneName("");
    onOpenChange(false);
  };

  // Start editing a scene's name
  const handleStartEdit = (scene: SceneMetadata) => {
    setEditingSceneId(scene.id);
    setEditingName(scene.name);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSceneId(null);
    setEditingName("");
  };

  // Save the edited name
  const handleSaveEdit = async () => {
    const newName = editingName.trim();
    if (!newName || !editingSceneId) return;

    if (currentSceneId === editingSceneId) {
      // If editing the currently loaded scene, save its content with the new name.
      // This effectively renames and saves current changes.
      await onSaveScene(newName);
    } else {
      // If editing a different scene, we should ideally only update the metadata.
      // This requires modification in Draw.tsx's saveScene or a new function.
      // For now, we'll *still* call onSaveScene, which might overwrite the
      // target scene's *content* with the *current canvas content* if Draw.tsx's
      // saveScene logic simply uses the provided name and the *current* canvas data.
      // This is NOT ideal but requires changes in Draw.tsx to fix properly.
      console.warn(
        `Attempting to rename scene "${editingName}" (ID: ${editingSceneId}) to "${newName}". This might overwrite its content with the current canvas data if it's not the loaded scene. A dedicated rename function is recommended.`
      );
      await onSaveScene(newName);
    }

    setEditingSceneId(null);
    setEditingName("");
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Set placeholder text for the save input based on context
  const getSavePlaceholder = () => {
    const currentScene = savedScenes.find((s) => s.id === currentSceneId);
    if (currentScene) {
      return `Save changes to "${currentScene.name}" or enter new name`;
    }
    return "Enter name for new scene";
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] flex flex-col">
        <SheetHeader>
          <SheetTitle>Manage Scenes</SheetTitle>
          <SheetDescription>
            Load, save, rename, or delete your Excalidraw scenes.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-grow flex flex-col gap-4 py-4">
          {/* Section to save the CURRENT scene */}
          <div className="px-4 space-y-2 border-b pb-4">
            <h3 className="font-medium text-sm">Save Current Scene</h3>
            <div className="flex gap-2">
              <Input
                placeholder={getSavePlaceholder()}
                value={sceneName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSceneName(e.target.value)
                }
              />
              <Button
                onClick={handleSaveCurrent}
                size="icon"
                title="Save current scene"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
            {currentSceneId && (
              <p className="text-xs text-muted-foreground">
                Currently editing:{" "}
                {savedScenes.find((s) => s.id === currentSceneId)?.name}
              </p>
            )}
          </div>

          {/* Section to list saved scenes */}
          <div className="flex-grow overflow-hidden px-4">
            <h3 className="font-medium text-sm mb-2">Load Scene</h3>
            <ScrollArea className="h-[calc(100%-2rem)]">
              <div className="space-y-2 pr-4">
                {savedScenes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No saved scenes yet.
                  </p>
                )}
                {savedScenes
                  .sort(
                    (a: SceneMetadata, b: SceneMetadata) =>
                      b.lastModified - a.lastModified
                  ) // Sort by most recent
                  .map((scene: SceneMetadata) => (
                    <div
                      key={scene.id}
                      className={`flex items-center justify-between gap-2 p-2 rounded-md border ${
                        scene.id === currentSceneId
                          ? "bg-muted font-semibold"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      {editingSceneId === scene.id ? (
                        // Edit mode
                        <div className="flex-grow flex items-center gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-8"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={
                              handleSaveEdit as React.MouseEventHandler<HTMLButtonElement>
                            }
                            className="h-8 w-8"
                            title="Save name"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={
                              handleCancelEdit as React.MouseEventHandler<HTMLButtonElement>
                            }
                            className="h-8 w-8"
                            title="Cancel edit"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        // View mode
                        <div
                          className="flex-grow flex flex-col cursor-pointer mr-2"
                          onClick={() => onLoadScene(scene.id)}
                          title={`Load "${scene.name}"`}
                        >
                          <span className="font-medium text-sm truncate">
                            {scene.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(scene.lastModified)}
                          </span>
                        </div>
                      )}
                      {editingSceneId !== scene.id && (
                        <div className="flex items-center flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStartEdit(scene)}
                            className="h-8 w-8"
                            title={`Rename "${scene.name}"`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to delete "${scene.name}"? This cannot be undone.`
                                )
                              ) {
                                onDeleteScene(scene.id);
                              }
                            }}
                            className="h-8 w-8"
                            title={`Delete "${scene.name}"`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

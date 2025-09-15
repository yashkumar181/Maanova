// src/components/VideoCallModal.tsx (New File)

"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VideoCallModalProps {
  roomUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoCallModal({ roomUrl, isOpen, onClose }: VideoCallModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 border-0">
        <iframe
          src={roomUrl}
          allow="camera; microphone; fullscreen; speaker; display-capture"
          className="w-full h-full rounded-lg"
        ></iframe>
      </DialogContent>
    </Dialog>
  );
}
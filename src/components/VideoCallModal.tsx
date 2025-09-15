// src/components/VideoCallModal.tsx (Updated)

"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"; // ✨ NEW: Import DialogTitle

interface VideoCallModalProps {
  roomUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoCallModal({ roomUrl, isOpen, onClose }: VideoCallModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 border-0">
        {/* ✨ NEW: Add a hidden title for screen readers */}
        <DialogTitle className="sr-only">Video Call Session</DialogTitle>
        
        <iframe
          src={roomUrl}
          allow="camera; microphone; fullscreen; speaker; display-capture"
          className="w-full h-full rounded-lg"
        ></iframe>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react";

type PlaybackApi = {
  register: (id: string, stop: () => void) => void;
  unregister: (id: string) => void;
  claim: (id: string) => void;
};

const MediaPlaybackContext = createContext<PlaybackApi | null>(null);

export function useMediaPlayback() {
  return useContext(MediaPlaybackContext);
}

/** Tiny exclusive-playback context — keep player UI out of this module. */
export function MediaPlaybackProvider({ children }: { children: ReactNode }) {
  const stopsRef = useRef(new Map<string, () => void>());
  const activeRef = useRef<string | null>(null);

  const register = useCallback((id: string, stop: () => void) => {
    stopsRef.current.set(id, stop);
  }, []);

  const unregister = useCallback((id: string) => {
    stopsRef.current.delete(id);
    if (activeRef.current === id) activeRef.current = null;
  }, []);

  const claim = useCallback((id: string) => {
    if (activeRef.current && activeRef.current !== id) {
      stopsRef.current.get(activeRef.current)?.();
    }
    activeRef.current = id;
  }, []);

  return (
    <MediaPlaybackContext.Provider value={{ register, unregister, claim }}>
      {children}
    </MediaPlaybackContext.Provider>
  );
}

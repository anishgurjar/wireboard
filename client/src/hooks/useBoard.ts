import { useEffect, useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Element, Connector } from '../types';

const SESSION_KEY = 'wireboard-session-id';

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useBoard(
  setElements: Dispatch<SetStateAction<Element[]>>,
  setConnectors: Dispatch<SetStateAction<Connector[]>>
): { saveBoard: (elements: Element[], connectors: Connector[]) => void } {
  const sessionId = getSessionId();

  useEffect(() => {
    fetch(`/api/board/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.elements)) setElements(data.elements);
        if (Array.isArray(data.connectors)) setConnectors(data.connectors);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveBoard = useCallback(
    (elements: Element[], connectors: Connector[]) => {
      fetch(`/api/board/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements, connectors }),
      }).catch(() => {});
    },
    [sessionId]
  );

  return { saveBoard };
}

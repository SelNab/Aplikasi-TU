import React, { createContext, useContext, useState, useRef, useCallback, useMemo, ReactNode } from 'react';
import { ActionToolbarProps } from '../components/ActionToolbar';
import { PaperSize } from '../types';

interface ActionToolbarContextType {
  currentActions: ActionToolbarProps | null;
  setCurrentActions: (actions: ActionToolbarProps | null) => void;
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (open: boolean) => void;
  paperSize: PaperSize;
  setPaperSize: (size: PaperSize) => void;
}

const ActionToolbarContext = createContext<ActionToolbarContextType | undefined>(undefined);

interface ActionMeta {
  hasActions: boolean;
  titleContext?: string;
  isLocked?: boolean;
  isArchived?: boolean;
  isReadOnly?: boolean;
  paperSize?: PaperSize;
}

export const ActionToolbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const actionsRef = useRef<ActionToolbarProps | null>(null);
  const [meta, setMeta] = useState<ActionMeta>({ hasActions: false });
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(false);
  const [paperSize, setPaperSize] = useState<PaperSize>('F4');

  const setCurrentActions = useCallback((actions: ActionToolbarProps | null) => {
    actionsRef.current = actions;
    if (!actions) {
      setMeta(prev => (prev.hasActions ? { hasActions: false } : prev));
      return;
    }
    setMeta(prev => {
      if (
        prev.hasActions &&
        prev.titleContext === actions.titleContext &&
        prev.isLocked === actions.isLocked &&
        prev.isArchived === actions.isArchived &&
        prev.isReadOnly === actions.isReadOnly &&
        prev.paperSize === actions.paperSize
      ) {
        return prev;
      }
      return {
        hasActions: true,
        titleContext: actions.titleContext,
        isLocked: actions.isLocked,
        isArchived: actions.isArchived,
        isReadOnly: actions.isReadOnly,
        paperSize: actions.paperSize
      };
    });
  }, []);

  const currentActions = useMemo<ActionToolbarProps | null>(() => {
    if (!meta.hasActions) return null;
    return new Proxy({} as ActionToolbarProps, {
      get(_target, prop: string | symbol) {
        if (!actionsRef.current) return undefined;
        return (actionsRef.current as any)[prop];
      }
    });
  }, [meta]);

  const contextValue = useMemo(() => ({
    currentActions,
    setCurrentActions,
    isRightPanelOpen,
    setIsRightPanelOpen,
    paperSize,
    setPaperSize
  }), [currentActions, setCurrentActions, isRightPanelOpen, paperSize]);

  return (
    <ActionToolbarContext.Provider value={contextValue}>
      {children}
    </ActionToolbarContext.Provider>
  );
};

export const useActionToolbar = (): ActionToolbarContextType => {
  const context = useContext(ActionToolbarContext);
  if (!context) {
    return {
      currentActions: null,
      setCurrentActions: () => {},
      isRightPanelOpen: false,
      setIsRightPanelOpen: () => {},
      paperSize: 'F4',
      setPaperSize: () => {}
    };
  }
  return context;
};

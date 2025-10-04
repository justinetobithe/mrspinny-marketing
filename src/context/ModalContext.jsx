import { createContext, useContext, useMemo, useState, useCallback } from "react";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
    const [modals, setModals] = useState({ welcome: false });

    const open = useCallback((name) => {
        setModals((m) => ({ ...m, [name]: true }));
    }, []);

    const close = useCallback((name) => {
        setModals((m) => ({ ...m, [name]: false }));
    }, []);

    const toggle = useCallback((name) => {
        setModals((m) => ({ ...m, [name]: !m[name] }));
    }, []);

    const isOpen = useCallback((name) => !!modals[name], [modals]);

    const value = useMemo(() => ({ open, close, toggle, isOpen }), [open, close, toggle, isOpen]);

    return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error("useModal must be used within a ModalProvider");
    return ctx;
}

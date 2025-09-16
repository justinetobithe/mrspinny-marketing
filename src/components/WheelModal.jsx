import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

const MODAL_KEY = "mrspinny_welcome_seen";

const WheelModal = forwardRef(function WheelModal({ children }, ref) {
    const [open, setOpen] = useState(false);

    useImperativeHandle(ref, () => ({
        open: () => setOpen(true),
        close: () => setOpen(false),
        isOpen: () => open,
    }), [open]);

    useEffect(() => {
        if (!localStorage.getItem(MODAL_KEY)) {
            const t = setTimeout(() => {
                setOpen(true);
                try { localStorage.setItem(MODAL_KEY, "1"); } catch { }
            }, 500);
            return () => clearTimeout(t);
        }
    }, []);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    if (!open) return null;

    return (
        <div id="welcomeModal" className={`modal ${open ? "open" : ""}`} hidden={!open}>
            <div className="modal-backdrop" onClick={() => setOpen(false)} />
            <div className="modal-panel" role="dialog" aria-modal="true" aria-label="Welcome">
                <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
                <h3 className="modal-title">Welcome to MrSpinny</h3>
                <p className="modal-body">Spin the wheel and claim your reward.</p>
                <div className="modal-actions">
                    <button className="btn btn-primary" onClick={() => setOpen(false)}>Let’s Go</button>
                </div>
            </div>
        </div>
    );
});

export default WheelModal;
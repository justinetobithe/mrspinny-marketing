import Wheel from "./Wheel";

export default function WheelModal({ open, onClose }) {
    return (
        <div className={`fixed inset-0 z-50 ${open ? "" : "hidden"}`} role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/70" onClick={onClose} />
            <div className="relative mx-auto my-8 w-[min(920px,92vw)] rounded-2xl bg-slate-800/80 backdrop-blur p-6 shadow-2xl border border-white/10">
                <button
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-slate-700/60 text-slate-100"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>

                <h2 className="text-3xl font-extrabold text-slate-100 text-center">Spin for a Welcome Bonus</h2>
                <p className="text-sm text-slate-300 text-center mt-2">
                    This is a marketing preview (IP). Real play happens at{" "}
                    <a className="underline text-amber-300" href="https://mrspinny.com/" target="_blank" rel="noreferrer">mrspinny.com</a>. 18+ only.
                </p>

                <div className="mt-6">
                    <Wheel />
                </div>
            </div>
        </div>
    );
}

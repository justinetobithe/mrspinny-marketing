import { Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition } from "@headlessui/react";

export default function AppModal({
    open,
    onClose,
    title,
    subtitle,
    children,
    zIndex = 10050,
    maxWidth = "max-w-3xl",
    showClose = true,
    panelClassName = "",
    panelPadding = "p-6",
}) {
    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative" style={{ zIndex }} onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-150"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px]" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-150"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-100"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel
                                className={[
                                    "w-full",
                                    maxWidth,
                                    "relative rounded-3xl border border-white/10",
                                    "bg-[radial-gradient(120%_120%_at_50%_0%,#193352_0%,#0c1a2b_45%,#0a1423_100%)]",
                                    "shadow-[0_10px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/10",
                                    panelPadding,
                                    panelClassName,
                                ].join(" ")}
                            >
                                {showClose && (
                                    <button
                                        onClick={onClose}
                                        aria-label="Close"
                                        className="absolute right-3 top-3 z-[1] inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-white/90 ring-1 ring-white/10 transition hover:bg-slate-700"
                                    >
                                        ×
                                    </button>
                                )}

                                {(title || subtitle) && (
                                    <div className="mx-auto max-w-xl text-center">
                                        {title && (
                                            <DialogTitle className="text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)]">
                                                {title}
                                            </DialogTitle>
                                        )}
                                        {subtitle && <p className="mt-2 text-[13px] text-slate-300/90">{subtitle}</p>}
                                    </div>
                                )}

                                {children}
                            </DialogPanel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

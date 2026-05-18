"use client";
// Add or update this interface in your AlertModal file
export interface AlertModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    confirmText?: string; 
    cancelText?: string;  
}
export default function AlertModal({
    isOpen,
    title,
    message,
    onConfirm,
    onClose,
    confirmText = "OK",       
    cancelText = "Cancel" 
}: AlertModalProps) {
    if (!isOpen) return null;
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with a smooth blur */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
                onClick={onClose}
            />

            {/* Alert Box Container */}
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 animate-scale-in">

                {/* Header / Title */}
                <div className="flex items-center gap-3">
                    {/* Subtle Info/Alert Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold leading-6 text-zinc-900 dark:text-zinc-50">
                        {title}
                    </h3>
                </div>

                {/* Message Body */}
                <div className="mt-3">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Action Button */}
                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        className="inline-flex justify-center rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                        onClick={onClose}
                    >
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    );
}
export function asyncAlert(title: string, message: string): Promise<void> {
    return new Promise<void>((resolve) => {
        const alertModal = document.getElementById('customAlert');
        const titleEl = document.getElementById('alertTitle');
        const messageEl = document.getElementById('alertMessage');
        const closeBtn = document.getElementById('alertBtn');

        // 1. Safety check to ensure all DOM elements actually exist
        if (!alertModal || !titleEl || !messageEl || !closeBtn) {
            console.warn("Alert UI elements not found in the DOM.");
            resolve(); // Resolve early so it doesn't hang your app
            return;
        }

        // 2. TypeScript now knows these elements are not null
        titleEl.innerText = title;
        messageEl.innerText = message;

        alertModal.classList.remove('hidden');

        closeBtn.onclick = function () {
            alertModal.classList.add('hidden');
            resolve(); // Resolves perfectly now with Promise<void>
        };
    });
}
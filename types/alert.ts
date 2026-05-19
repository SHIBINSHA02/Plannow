export type AlertConfig = {
    isOpen: boolean;
    title: string;
    message: string;
    type:
    | "info"
    | "confirm_auto_assign"
    | "confirm_delete"
    | "error";
};
export const TRANSACTION_STATUS_MAP: Record<string, { label: string; variant: string }> = {
    released: { label: "Completed", variant: "success" },
    draft: { label: "Draft", variant: "secondary" },
    pending: { label: "Pending", variant: "primary" },
    confirmed: { label: "Active", variant: "secondary" },
    cancelled: { label: "Refunded", variant: "error" },
    declined: { label: "Refunded", variant: "error" },
    refund: { label: "Refunded", variant: "error" },
    active: { label: "Active", variant: "secondary" },
    completed: { label: "Completed", variant: "success" },
};
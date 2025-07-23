export const truncateAddress = (addr: string) => {
    if (addr.length <= 12) return addr;
    return addr.slice(0, 7) + '...' + addr.slice(-5);
}
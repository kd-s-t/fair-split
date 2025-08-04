import { useSelector } from 'react-redux'
import type { RootState } from '@/lib/redux/store'

export const useTransactions = () => {
    const transactions: any[] = useSelector((state: RootState) => state.transactions.transactions)

    return {
        transactions,
    }
}

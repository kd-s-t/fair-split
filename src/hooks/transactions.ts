import { useSelector } from 'react-redux'
import type { RootState } from '@/lib/redux/store'
import type { NormalizedTransaction } from '@/modules/transactions/types'

export const useTransactions = () => {
    const transactions: NormalizedTransaction[] = useSelector((state: RootState) => state.transactions.transactions)

    return {
        transactions,
    }
}

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

interface DrinkHistoryProps {
  contractAddress: string
  address: string
}

interface HistoryItem {
  date: string
  drank: boolean
  txHash: string
}

const ABI = ['event DrankTea(address indexed user, uint256 timestamp)']

export default function DrinkHistory({ contractAddress, address }: DrinkHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    if (!address) return

    const fetchHistory = async () => {
      const provider = new ethers.JsonRpcProvider('https://tea-sepolia.g.alchemy.com/public')
      const contract = new ethers.Contract(contractAddress, ABI, provider)
      const latestBlock = await provider.getBlockNumber()
      const logs = await contract.queryFilter('DrankTea', latestBlock - 10000, latestBlock)

      const userLogs = logs.filter(
        (log) => log.args?.user?.toLowerCase() === address.toLowerCase()
      )

      const today = new Date()
      const result: HistoryItem[] = []

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        date.setHours(0, 0, 0, 0)
        const dayStart = Math.floor(date.getTime() / 1000)
        const dayEnd = dayStart + 86400

        const match = userLogs.find((log) => {
          const ts = Number(log.args?.timestamp)
          return ts >= dayStart && ts < dayEnd
        })

        result.push({
          date: date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
          }),
          drank: !!match,
          txHash: match?.transactionHash || '',
        })
      }

      setHistory(result.reverse())
    }

    fetchHistory()
  }, [contractAddress, address])

  return (
    <div className="w-full mt-6 text-left">
      <h2 className="font-semibold mb-2">History</h2>
      <div className="text-sm border rounded overflow-hidden">
        <div className="grid grid-cols-3 bg-gray-100 font-medium px-4 py-2">
          <span>Date</span>
          <span>Status</span>
          <span>Tx Link</span>
        </div>
        {history.map((item, i) => (
          <div key={i} className="grid grid-cols-3 items-center px-4 py-2 border-t">
            <span>{item.date}</span>
            <span className="flex items-center gap-1">
              {item.drank ? (
                <>
                  <span className="text-green-600">✅</span> Drank
                </>
              ) : (
                <>
                  <span className="text-red-500">❌</span> Skipped
                </>
              )}
            </span>
            <span>
              {item.drank ? (
                <a
                  href={`https://sepolia.tea.xyz/tx/${item.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View
                </a>
              ) : (
                '-' 
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
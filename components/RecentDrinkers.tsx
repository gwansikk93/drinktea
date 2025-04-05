'use client'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0xACCA7867D8a00B9C6D7fcF36E5AFf1278Dd0788a' // ← ganti ke address kontrak kamu
const ABI = [
  'event DrankTea(address indexed user, uint256 timestamp)',
]

interface DrinkEvent {
  user: string
  timestamp: number
  txHash: string
}

export default function RecentDrinkers() {
  const [events, setEvents] = useState<DrinkEvent[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      const provider = new ethers.JsonRpcProvider('https://tea-sepolia.g.alchemy.com/public')
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)

      const latestBlock = await provider.getBlockNumber()
      const logs = await contract.queryFilter('DrankTea', latestBlock - 5000, latestBlock)

      const parsed = logs
        .map((log) => ({
          user: log.args?.user,
          timestamp: Number(log.args?.timestamp),
          txHash: log.transactionHash,
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)

      setEvents(parsed)
    }

    fetchEvents()
  }, [])

  return (
    <div className="w-full max-w-md mt-8">
      <h2 className="text-xl font-semibold mb-2">🧾 Recent Drinkers</h2>
      <ul className="space-y-2">
        {events.map((e, i) => (
          <li
            key={i}
            className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded"
          >
            <span className="font-mono text-sm">
              {e.user.slice(0, 6)}...{e.user.slice(-4)}
            </span>
            <a
              href={`https://sepolia.tea.xyz/tx/${e.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 text-sm underline"
            >
              View TX
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

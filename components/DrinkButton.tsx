'use client'

import { useState } from 'react'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0xACCA7867D8a00B9C6D7fcF36E5AFf1278Dd0788a' // ← ganti address kontrak kamu
const ABI = ["function drinkTea() external"]

export default function DrinkButton() {
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  async function handleDrink() {
    if (!window.ethereum) return alert('Wallet not found!')

    try {
      setLoading(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
      const tx = await contract.drinkTea()
      await tx.wait()
      setTxHash(tx.hash)
    } catch (err) {
      console.error(err)
      alert('Transaction failed!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleDrink}
        disabled={loading}
        className={`px-6 py-3 rounded-xl text-white transition font-semibold ${
          loading ? 'bg-yellow-500' : 'bg-pink-500 hover:bg-pink-600'
        }`}
      >
        {loading ? (
          <div className="flex items-center gap-2 animate-pulse">
            <span className="text-xl">🍵</span>
            <span>Pouring your tea...</span>
          </div>
        ) : (
          '☕ Drink Tea'
        )}
      </button>

      {txHash && (
        <a
          href={`https://sepolia.tea.xyz/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 underline"
        >
          View on Explorer
        </a>
      )}
    </div>
  )
}

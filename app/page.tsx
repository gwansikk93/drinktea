// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import DrinkButton from '@/components/DrinkButton'
import RecentDrinkers from '@/components/RecentDrinkers'
import DrinkHistory from '@/components/DrinkHistory'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0xACCA7867D8a00B9C6D7fcF36E5AFf1278Dd0788a'
const ABI = ['event DrankTea(address indexed user, uint256 timestamp)']

export default function Home() {
  const [address, setAddress] = useState('')
  const [date, setDate] = useState('')
  const [hasDrunkToday, setHasDrunkToday] = useState(false)
  const [dauCount, setDauCount] = useState(0)

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const addr = await signer.getAddress()
      setAddress(addr)
    } else {
      alert('Please install MetaMask')
    }
  }

  async function fetchDauCount() {
    const provider = new ethers.JsonRpcProvider('https://tea-sepolia.g.alchemy.com/public')
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)
    const latestBlock = await provider.getBlockNumber()
    const logs = await contract.queryFilter('DrankTea', latestBlock - 5000, latestBlock)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = Math.floor(today.getTime() / 1000)

    const uniqueUsers = new Set(
      logs
        .filter(log => Number(log.args?.timestamp) >= todayTimestamp)
        .map(log => log.args?.user.toLowerCase())
    )
    setDauCount(uniqueUsers.size)
  }

  async function checkDrankToday(addr: string) {
    const provider = new ethers.JsonRpcProvider('https://tea-sepolia.g.alchemy.com/public')
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)
    const latestBlock = await provider.getBlockNumber()
    const logs = await contract.queryFilter('DrankTea', latestBlock - 5000, latestBlock)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = Math.floor(today.getTime() / 1000)

    const drank = logs.some(log => {
      if (!log.args?.user || !log.args?.timestamp) return false;
      const user = log.args.user.toLowerCase()
      const ts = Number(log.args.timestamp)
      return user === addr.toLowerCase() && ts >= todayTimestamp
    })

    setHasDrunkToday(drank)
  }

  useEffect(() => {
    const today = new Date()
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
    setDate(today.toLocaleDateString('en-US', dateOptions))
  }, [])

  useEffect(() => {
    fetchDauCount()
  }, [])

  useEffect(() => {
    if (address) {
      checkDrankToday(address)
    }
  }, [address])

  return (
    <div className="min-h-screen flex justify-center items-center bg-white py-10 px-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">🌞 DrinkTea</h1>

        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>Address</span>
          <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>Date</span>
          <span>{date}</span>
        </div>

        {!address && (
          <button
            onClick={connectWallet}
            className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Connect Wallet
          </button>
        )}

        <p className="mb-4 text-gray-700">
          {hasDrunkToday ? 'You already drank today' : 'You haven’t drunk today yet'}
        </p>

        <DrinkButton contractAddress={CONTRACT_ADDRESS} />

        <p className="text-xs text-gray-600 mt-2">
          Daily Active User : <span className="font-semibold">{dauCount}</span>
        </p>

        {address ? (
          <DrinkHistory contractAddress={CONTRACT_ADDRESS} address={address} />
        ) : (
          <p className="mt-6 text-sm text-gray-400">Connect wallet to see your history</p>
        )}

        <RecentDrinkers contractAddress={CONTRACT_ADDRESS} />

        <div className="mt-8 text-center text-xs text-gray-400">
          Built by{' '}
          <a
            href="https://github.com/gwansikk93"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            gwansikk93
          </a>{' '}
          / tea username: <span className="font-mono">0x7777tea</span>
          <br />
          Contract:{' '}
          <a
            href="https://sepolia.tea.xyz/address/0xACCA7867D8a00B9C6D7fcF36E5AFf1278Dd0788a"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            0xACCA7867D8a00B9C6D7fcF36E5AFf1278Dd0788a
          </a>
        </div>
      </div>
    </div>
  )
}
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function JobFilters() {
  const router = useRouter()
  const [q, setQ] = useState("")
  const [location, setLocation] = useState("")
  const [industry, setIndustry] = useState("")

  const onApply = () => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (location) params.set("location", location)
    if (industry) params.set("industry", industry)
    router.push(`/vacancies?${params.toString()}`)
  }

  return (
    <div className="p-4 border rounded-md space-y-3">
      <input 
        value={q} 
        onChange={(e) => setQ(e.target.value)} 
        placeholder="Search jobs" 
        className="w-full p-2 border rounded" 
      />
      <input 
        value={location} 
        onChange={(e) => setLocation(e.target.value)} 
        placeholder="Location" 
        className="w-full p-2 border rounded" 
      />
      <input 
        value={industry} 
        onChange={(e) => setIndustry(e.target.value)} 
        placeholder="Industry" 
        className="w-full p-2 border rounded" 
      />
      <div className="flex gap-2">
        <button 
          onClick={onApply} 
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Apply
        </button>
        <button 
          onClick={() => { setQ(""); setLocation(""); setIndustry("") }} 
          className="px-4 py-2 border rounded"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
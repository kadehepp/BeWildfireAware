'use client'//tesll next.js this is a client component

import { useState } from 'react'
import { addFDRAData } from '../page'

export default function AddFDRAForm({ dispatchData = [] }) {
  const [FDRAname, setFDRAname] = useState('')
  const [BI, setBI] = useState('')
  const [ERC, setERC] = useState('')
  const [dispatchId, setDispatchId] = useState('')
  const [loading, setLoading] = useState(false)//disable form while submitting
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('FDRAname', FDRAname)
      formData.append('BI', BI)
      formData.append('ERC', ERC)
      formData.append('dispatchId', dispatchId)
      const result = await addFDRAData(formData)

      if (result.error) {
        setMessage(`Error: ${result.error}`)
      } else {
        setMessage('FDRA data added successfully!')
        setFDRAname('')
        setBI('')
        setERC('')
        setDispatchId('')
        //// Optionally refresh the page to see new data
        setTimeout(() => window.location.reload(), 1500)
      }

    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="add-fdra-form">
      <input
        type="text"
        placeholder="Enter FDRA Name"
        value={FDRAname}
        onChange={(e) => setFDRAname(e.target.value)}
        disabled={loading}
        required
      />
      <input
        type="number"
        placeholder="Enter BI"
        value={BI}
        onChange={(e) => setBI(e.target.value)}
        disabled={loading}
      />
     <input
        type="number"
        placeholder="Enter ERC"
        value={ERC}
        onChange={(e) => setERC(e.target.value)}
        disabled={loading}
      />
      <select 
        value={dispatchId} 
        onChange={(e) => setDispatchId(e.target.value)}
        disabled={loading}
        required
      >
        <option value="">Select Dispatch Area</option>
        {dispatchData?.map((dispatch) => (
          <option key={dispatch.Dispatch_ID} value={dispatch.Dispatch_ID}>
            {dispatch.DispatchName}
          </option>
        ))}
      </select>

      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add FDRA'}
      </button>
      {message && (
        <p className={message.startsWith('Error') ? 'error-message' : 'success-message'}>
          {message}
        </p>
      )}
    </form>
  )
}

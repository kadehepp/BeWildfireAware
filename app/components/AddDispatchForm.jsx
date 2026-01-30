'use client'//tesll next.js this is a client component

import { useState } from 'react'
import { addDispatchArea } from '../page'

export default function AddDispatchForm() {
  const [dispatchName, setDispatchName] = useState('')//new state initialized to empty string (useState(''))
  const [loading, setLoading] = useState(false)//disable form while submitting
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('dispatchName', dispatchName)
      
      const result = await addDispatchArea(formData)

      if (result.error) {
        setMessage(`Error: ${result.error}`)
      } else {
        setMessage('Dispatch area added successfully!')
        setDispatchName('')
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
    <form onSubmit={handleSubmit} className="add-dispatch-form">
      <input
        type="text"
        placeholder="Enter Dispatch Name"
        value={dispatchName}
        onChange={(e) => setDispatchName(e.target.value)}
        disabled={loading}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Dispatch Area'}
      </button>
      {message && (
        <p className={message.startsWith('Error') ? 'error-message' : 'success-message'}>
          {message}
        </p>
      )}
    </form>
  )
}

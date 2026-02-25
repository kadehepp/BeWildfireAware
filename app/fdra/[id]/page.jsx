'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function FdraPage() {
  const pathname = usePathname() // e.g. /fdra/8
  const fdraId = pathname?.split('/fdra/')[1] ? parseInt(pathname.split('/fdra/')[1], 10) : null

  const [fdraRecord, setFdraRecord] = useState(null)
  const [dispatchRecord, setDispatchRecord] = useState(null)
  const [fdraError, setFdraError] = useState(null)
  const [dispatchError, setDispatchError] = useState(null)

  // Fetch FDRA record by ID
  useEffect(() => {
    if (!fdraId) return

    const fetchFdra = async () => {
      const { data, error } = await supabase
        .from('FDRA')
        .select('FDRA_ID, FDRAname, AVG_BI, AVG_ERC, Dispatch_ID')
        .eq('FDRA_ID', fdraId)
        .single() // only one record
      if (error) setFdraError(error)
      else setFdraRecord(data)
    }

    fetchFdra()
  }, [fdraId])

  // Fetch DispatchArea info for this FDRA
  useEffect(() => {
    if (!fdraRecord?.Dispatch_ID) return

    const fetchDispatch = async () => {
      const { data, error } = await supabase
        .from('DispatchArea')
        .select('Dispatch_ID, DispatchName')
        .eq('Dispatch_ID', fdraRecord.Dispatch_ID)
        .single()
      if (error) setDispatchError(error)
      else setDispatchRecord(data)
    }

    fetchDispatch()
  }, [fdraRecord])

  return (
    <main className="dashboard-container">
      {/* Dispatch Area info */}
      <section className="DispatchArea-section">
        <h2 className="dashboard-heading">Dispatch Area</h2>
        {dispatchError ? (
          <p>Error loading Dispatch Area: {dispatchError.message}</p>
        ) : !dispatchRecord ? (
          <p>Loading Dispatch Area...</p>
        ) : (
          <div className="area-card">
            <h3 className="dashboard-subheading">{dispatchRecord.DispatchName ?? 'Unnamed Area'}</h3>
          </div>
        )}
      </section>

      {/* FDRA info */}
      <section className="FDRA-section">
        <h2 className="dashboard-heading">FDRA Record</h2>
        {fdraError ? (
          <p>Error loading FDRA: {fdraError.message}</p>
        ) : !fdraRecord ? (
          <p>Loading FDRA record...</p>
        ) : (
          <div className="area-card">
            <h3 className="dashboard-subheading">{fdraRecord.FDRAname ?? 'Unnamed FDRA'}</h3>
            <p>BI: {fdraRecord.AVG_BI}</p>
            <p>ERC: {fdraRecord.AVG_ERC}</p>
          </div>
        )}
      </section>
    </main>
  )
}
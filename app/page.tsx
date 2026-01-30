import { supabase } from '@/lib/supabase'
import './globals.css' // Global CSS is automatically imported in layout.tsx

export default async function Home() {
  const { data: dispatchData, error: dispatchError } = await supabase
    .from('DispatchArea')
    .select('*')
    .limit(5)

  const { data: fdraData, error: fdraError } = await supabase
    .from('FDRA')
    .select('*')
    .limit(5)

  console.log('DispatchArea data:', dispatchData)
  console.log('DispatchArea error:', dispatchError)
  console.log('FDRA data:', fdraData)
  console.log('FDRA error:', fdraError)

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Wildfire Data Dashboard</h1>
      
      {/* Dispatch Areas Section */}
      <section className="mb-8">
        <h2 className="dashboard-heading">Dispatch Areas</h2>
        
        {dispatchError ? (
          <div className="error-message">
            <p className="error-title text-black">Error with DispatchArea table:</p>
            <p className="error-body">{dispatchError.message}</p>
            <p className="mt-2 text-red-600">Check: Is the table name correct? (Case-sensitive)</p>
          </div>
        ) : (
          <div>
            <p className="text-black mb-2">Found {dispatchData?.length || 0} dispatch areas</p>
            
            {dispatchData && dispatchData.length > 0 ? (
              <div className="cards-grid">
                {dispatchData.map((area: any) => (
                  <div key={area.id} className="area-card">
                    <h3 className="dashboard-subheading">{area.name || 'Unnamed Area'}</h3>
                    
                    <div className="mt-2 text-sm">
                      {Object.entries(area).map(([key, value]) => (
                        <div key={key} className="flex text-black">
                          <span className="font-medium mr-2">{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="warning-message">
                <p className="warning-text">Table exists but has no data. Add records in Supabase.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* FDRA Data Section */}
      <section>
        <h2 className="dashboard-heading">FDRA Data</h2>
        
        {fdraError ? (
          <div className="error-message">
            <p className="error-title text-black">Error with FDRA table:</p>
            <p className="error-body">{fdraError.message}</p>
          </div>
        ) : (
          <div>
            <p className="text-black mb-2">Found {fdraData?.length || 0} FDRA records</p>
            
            {fdraData && fdraData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      {fdraData[0] && Object.keys(fdraData[0]).map(key => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fdraData.map((record: any, index: number) => (
                      <tr key={record.id || index}>
                        {Object.values(record).map((value: any, i: number) => (
                          <td key={i}>{String(value)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="warning-message">
                <p className="warning-text">FDRA table exists but has no data.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Connection Status */}
      <div className="status-container">
        <h2 className="dashboard-heading text-black">Connection Status</h2>
        <div className="status-grid">
          <div className={`status-card ${dispatchError ? 'status-error' : 'status-success'}`}>
            <p className="font-medium text-black">DispatchArea Table:</p>
            <p className={`text-lg font-bold ${dispatchError ? 'status-text-error' : 'status-text-success'}`}>
              {dispatchError ? '❌ Error' : '✅ Connected'}
            </p>
            <p className="text-black">Records: {dispatchData?.length || 0}</p>
            {dispatchError && (
              <p className="text-sm text-red-600 mt-2">{dispatchError.message}</p>
            )}
          </div>
          <div className={`status-card ${fdraError ? 'status-error' : 'status-success'}`}>
            <p className="font-medium text-black">FDRA Table:</p>
            <p className={`text-lg font-bold ${fdraError ? 'status-text-error' : 'status-text-success'}`}>
              {fdraError ? '❌ Error' : '✅ Connected'}
            </p>
            <p className="text-black">Records: {fdraData?.length || 0}</p>
            {fdraError && (
              <p className="text-sm text-red-600 mt-2">{fdraError.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 mt-8">
        <h2 className="dashboard-heading text-black">Data Summary</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <p className="text-sm text-gray-600">Total Areas</p>
            <p className="text-2xl font-bold text-black">{dispatchData?.length || 0}</p>
          </div>
          <div className="summary-card">
            <p className="text-sm text-gray-600">FDRA Records</p>
            <p className="text-2xl font-bold text-black">{fdraData?.length || 0}</p>
          </div>
          <div className="summary-card">
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-2xl font-bold text-green-600">
              {dispatchError || fdraError ? 'Error' : 'Active'}
            </p>
          </div>
          <div className="summary-card">
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="text-lg font-semibold text-black">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
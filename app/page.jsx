'use server'//

import { supabase } from '@/lib/supabase'
import AddDispatchForm from './components/AddDispatchForm'
import AddFDRAForm from './components/AddFDRAForm.jsx'

//USE LATER
// import DispatchAreasSection from './components/DispatchAreasSection'
// import FdraSection from './components/FdraSection'
// import StatusSection from './components/StatusSection'

//need new function to add to database
export async function addDispatchArea(formData) {
  //form to insert data into supabase table DispatchArea
  const dispatchName = formData.get('dispatchName')
  //const fdraId = formData.get('FDRA_ID')

  
  if (!dispatchName || dispatchName.trim() === '') {
    return { error: 'Dispatch name is required' }
  }

  // if (!fdraId || isNaN(Number(fdraId))) {
  //   return { error: 'Valid FDRA ID is required' }
  // }

  const { data, error } = await supabase
    .from('DispatchArea')
    .insert([{ DispatchName: dispatchName }])

  if (error) {
    return { error: error.message }
  }

  return { success: true, data }
}

//function to add FDRA data to database
export async function addFDRAData(formData) {
  const FDRAname = formData.get('FDRAname')
  const BI = formData.get('BI')
  const ERC = formData.get('ERC')
  const dispatchId = formData.get('dispatchId')

  if (!FDRAname || FDRAname.trim() === '') {
    return { error: 'FDRA name is required' }
  }

  if (BI === '' || BI === null || (BI !== '' && isNaN(Number(BI)))) {
    return { error: 'Valid BI is required' }
  }

  if (ERC === '' || ERC === null || (ERC !== '' && isNaN(Number(ERC)))) {
    return { error: 'Valid ERC is required' }
  }

  if (!dispatchId || isNaN(Number(dispatchId))) {
    return { error: 'Dispatch area is required' }
  }

  const { data, error } = await supabase
    .from('FDRA')
    .insert([{ 
      FDRAname: FDRAname, 
      ...(BI && { BI: Number(BI) }),
      ...(ERC && { ERC: Number(ERC) }),
      Dispatch_ID: Number(dispatchId) 
    }])


  if (error) {
    return { error: error.message }
  }

  return { success: true, data }
}

//set up a page that fetches data from supabase and displays it using the components above
export default async function Home() {
  //
  const { data: dispatchData, error: dispatchError } = await supabase
    .from('DispatchArea')
    .select('Dispatch_ID, DispatchName')

  const { data: fdraData, error: fdraError } = await supabase
    .from('FDRA')
    .select('FDRA_ID, FDRAname, BI, ERC, Dispatch_ID')


    

  // console.log('DispatchArea data:', dispatchData)
  // console.log('DispatchArea error:', dispatchError)
  // console.log('FDRA data:', fdraData)
  // console.log('FDRA error:', fdraError)

  return (
    <main className="dashboard-container">
      {/* Add Dispatch Area Form */}
      <section className="add-dispatch-section">
        <h2 className="dashboard-heading">Add Dispatch Area</h2>
        <AddDispatchForm />
      </section>

      {/* Add FDRA Form */}
      <section className="add-fdra-section">
        <h2 className="dashboard-heading">Add FDRA</h2>
        <AddFDRAForm dispatchData={dispatchData} />
      </section>

      {/* Dispatch Areas cards */}
      <section className="DispatchArea-section">
        <h2 className="dashboard-heading">Dispatch Areas</h2>
        
        {dispatchError && (
          <div className="error-message">
            <p className="error-title">Error with DispatchArea table:</p>
            <p className="error-body">{dispatchError.message}</p>
          </div>
        )}

        {!dispatchError && (
          <div>
            <p className="record-count">
              Total Area: {dispatchData?.length ?? 0}
            </p>  

            <div className="cards-grid">
              {dispatchData?.map((dispatchArea) => (//reder list of cards if dispatch data exist for each area
                <div key={dispatchArea.Dispatch_ID} className="area-card">
                  <h3 className="dashboard-subheading">
                    {dispatchArea.DispatchName ?? 'Unnamed Area'}
                  </h3>{/*reason for unnamed area ?? vs ||*/}

                  <p>Dispatch ID: {dispatchArea.Dispatch_ID}</p>
                  {/* <p>FDRA ID: {dispatchArea.FDRA_ID}</p> */}

                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ================= FDRA cards =================*/}
      <section className="FDRA-section">
        <h2 className="dashboard-heading">FDRA Records</h2>
        
        {fdraError && (
          <div className="error-message">
            <p className="error-title">FDRA Error:</p>
            <p className="error-body">{fdraError.message}</p>
          </div>
        )}

        {!fdraError && (
          <div>
            <p className="record-count">
              Total Records: {fdraData?.length ?? 0}
            </p>

            <div className="cards-grid">
              {fdraData?.map((fdra) => (
                <div key={fdra.FDRA_ID} className="area-card">
                  <h3 className="dashboard-subheading">
                    {fdra.FDRAname ?? 'Unnamed FDRA'}
                  </h3>
                  <p>BI: {fdra.BI}</p>
                  <p>ERC: {fdra.ERC}</p>
                  <p>Dispatch ID: {fdra.Dispatch_ID} </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Connection Status */}
      <section className="status-section">
        <h2 className="dashboard-heading">Connection Status</h2>
        
        <div className="status-grid">
          <div className={`status-card ${dispatchError ? 'status-error' : 'status-success'}`}>
            <p className="status-DispatchArea">DispatchArea</p>
            <p className={dispatchError ? 'status-text-error' : 'status-text-success'}>
              {dispatchError ? 'Error' : 'Connected'}
            </p>
          </div>

          <div className={`status-card ${fdraError ? 'status-error' : 'status-success'}`}>
            <p className="status-FDRA">FDRA</p>
            <p className={fdraError ? 'status-text-error' : 'status-text-success'}>
              {fdraError ? 'Error' : 'Connected'}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
} 












// import DispatchAreasSection from './components/DispatchAreasSection'
// import FdraSection from './components/FdraSection'
// import StatusSection from './components/StatusSection'
// import type { DispatchArea, FDRARecord } from './types'







{/* --- IGNORE --- */}
/*


{/*      
      {/* ================= FDRA TABLE ================= 
      <section className="FDRA-section">
        <h2 className="dashboard-heading">FDRA Records</h2>
        
        {fdraError && (
          <div className="error-message">
            <p className="error-title">FDRA Error</p>
            <p className="error-body">{fdraError.message}</p>
          </div>
        )}

        {!fdraError && (
          <div>
            <p className="record-count">
              Total Records: {fdraData?.length ?? 0}
            </p>

            <div className="cards-grid">
              {fdraData?.map((fdra) => (
                <div key={fdra.FDRA_ID} className="area-card">
                  <h3 className="dashboard-subheading">
                    {fdra.FDRAname ?? 'Unnamed FDRA'}
                  </h3>
                  <p className="text-black">BI: {fdra.BI}</p>
                  <p className="text-black">ERC: {fdra.ERC}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* FDRA Data Section       <section>
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
                      <tr key={record.FDRA_ID || index}>
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
/*}

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

      {/* Data Summary 
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
*/
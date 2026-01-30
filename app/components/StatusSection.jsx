export default function StatusSection({
  dispatchError,
  fdraError,
}) {
  return (
    <section className="status-section">
      <h2 className="Connection Status">Connection Status</h2>

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
  )
}

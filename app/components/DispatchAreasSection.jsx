export default function DispatchAreasSection({
  dispatchData,
  dispatchError,
}) {
  return (
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
            {dispatchData?.map((dispatchArea) => (
              <div key={dispatchArea.Dispatch_ID} className="area-card">
                <h3 className="dashboard-subheading">
                  {dispatchArea.DispatchName ?? 'Unnamed Area'}
                </h3>

                <p>Dispatch ID: {dispatchArea.Dispatch_ID} :</p>
                <p>FDRA ID: {dispatchArea.FDRA_ID}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

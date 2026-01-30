export default function FdraSection({ fdraData, fdraError }) {
  return (
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
  )
}

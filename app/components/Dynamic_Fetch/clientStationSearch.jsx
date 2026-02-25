'use client'

import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { stationSearch } from './stationSearch.jsx'

export default function ClientStationSearch() {
    const [stationId, setStationId] = useState('')
    const [fdraId, setFdraId] = useState('')
    const [fdraOptions, setFdraOptions] = useState([])
    const [searchResult, setSearchResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [addingToDb, setAddingToDb] = useState(false)

    // Fetch FDRA options for dropdown when component mounts
    useEffect(() => {
        async function fetchFdraOptions() {
            try {
                const { data, error } = await supabase
                    .from('FDRA')
                    .select('FDRA_ID, FDRAname')
                
                if (error) throw error
                setFdraOptions(data || [])
            } catch (err) {
                console.error('Error fetching FDRA options:', err)
                setError('Failed to load FDRA options')
            }
        }
        
        fetchFdraOptions()
    }, [])

    /**
     * Handle search form submission
     * @param {Event} e - Form submit event
     */
    async function handleSearch(e) {
        e.preventDefault()
        
        // Validate inputs
        if (!stationId.trim()) {
            setError('Please enter a Station ID')
            return
        }
        
        if (!fdraId) {
            setError('Please select an FDRA')
            return
        }

        setLoading(true)
        setError('')
        setSearchResult(null)
        setSuccess('')

        try {
            // Create FormData for server action
            const formData = new FormData()
            formData.append('stationId', stationId.trim())
            formData.append('fdraId', fdraId)

            // Call server action
            const result = await stationSearch(formData)
            
            if (result.error) {
                setError(result.error)
            } else if (result.found) {
                setSearchResult(result.data)
                setSuccess('Station data found! Review and confirm to add to database.')
                // Don't clear stationId yet - user might want to adjust
            } else if (result.message) {
                setError(result.message)
            }
        } catch (err) {
            setError(`Error: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    /**
     * Handle adding the found station to database
     */
    const handleAddToDatabase = async () => {
        if (!searchResult) return
        
        setAddingToDb(true)
        setError('')
        setSuccess('')

        try {
            // Insert station record into database
            const { error: insertError } = await supabase
                .from('StationRecord')
                .insert({
                    Station_ID: searchResult.stationId,
                    Station_Name: searchResult.stationName,
                    ERC: searchResult.erc ? parseFloat(searchResult.erc) : null,
                    BI: searchResult.bi ? parseFloat(searchResult.bi) : null,
                    Observation_Time: searchResult.observationTime,
                    NFDRType: searchResult.nfdrType,
                    FDRA_ID: parseInt(searchResult.fdraId) // Convert to number if needed
                })

            if (insertError) throw insertError

            // Also insert sample historical records (optional)
            if (searchResult.sampleData && searchResult.sampleData.length > 0) {
                const historicalRecords = searchResult.sampleData.map(record => ({
                    Station_ID: searchResult.stationId,
                    Station_Name: record.StationName || searchResult.stationName,
                    ERC: record.ERC ? parseFloat(record.ERC) : null,
                    BI: record.BI ? parseFloat(record.BI) : null,
                    Observation_Time: record.ObservationTime || record.Date,
                    NFDRType: record.NFDRType || '',
                    FDRA_ID: parseInt(searchResult.fdraId)
                }))

                const { error: historyError } = await supabase
                    .from('StationRecord')
                    .insert(historicalRecords)

                if (historyError) {
                    console.error('Error inserting historical records:', historyError)
                    // Don't throw - main record succeeded
                }
            }

            setSuccess('Station added successfully!')
            setStationId('') // Clear input
            setFdraId('') // Clear selection
            setSearchResult(null) // Clear results
            
            // Refresh the page or trigger parent refresh
            setTimeout(() => {
                window.location.reload()
            }, 1500)
            
        } catch (err) {
            setError(err.message)
        } finally {
            setAddingToDb(false)
        }
    }

    /**
     * Cancel search and clear results
     */
    const handleCancel = () => {
        setSearchResult(null)
        setStationId('')
        setError('')
        setSuccess('')
    }

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-300">
            <h3 className="text-xl font-bold mb-4 text-black">Search & Add Station</h3>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-4">
                {/* Station ID Input */}
                <div>
                    <label className="block text-sm font-medium text-black mb-2">
                        Station ID <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="text"
                        value={stationId}
                        onChange={(e) => setStationId(e.target.value)}
                        placeholder="Enter station ID (e.g., 54702)"
                        className="w-full p-2 border border-gray-300 rounded text-black"
                        disabled={loading || addingToDb}
                        required
                    />
                </div>

                {/* FDRA Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-black mb-2">
                        Select FDRA <span className="text-red-600">*</span>
                    </label>
                    <select
                        value={fdraId}
                        onChange={(e) => setFdraId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-black"
                        disabled={loading || addingToDb || fdraOptions.length === 0}
                        required
                    >
                        <option value="">-- Choose an FDRA --</option>
                        {fdraOptions.map((fdra) => (
                            <option key={fdra.FDRA_ID} value={fdra.FDRA_ID}>
                                {fdra.FDRAname} (ID: {fdra.FDRA_ID})
                            </option>
                        ))}
                    </select>
                    {fdraOptions.length === 0 && (
                        <p className="text-sm text-red-600 mt-1">
                            No FDRAs found. Please create an FDRA first.
                        </p>
                    )}
                </div>

                {/* Search Button */}
                <button
                    type="submit"
                    disabled={loading || addingToDb || !stationId.trim() || !fdraId}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Searching FEMS API...' : 'Search Station'}
                </button>
            </form>

            {/* Error Display */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded">
                    <p className="text-green-700">{success}</p>
                </div>
            )}

            {/* Search Results Display */}
            {searchResult && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-300 rounded">
                    <h4 className="font-bold text-lg mb-3 text-black">Station Found!</h4>
                    
                    {/* Station Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-600">Station ID</p>
                            <p className="font-medium text-black">{searchResult.stationId}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Station Name</p>
                            <p className="font-medium text-black">{searchResult.stationName || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Latest ERC</p>
                            <p className="font-medium text-black">{searchResult.erc || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Latest BI</p>
                            <p className="font-medium text-black">{searchResult.bi || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Observation Time</p>
                            <p className="font-medium text-black">{searchResult.observationTime || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">NFDR Type</p>
                            <p className="font-medium text-black">{searchResult.nfdrType || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Sample Records Table */}
                    {searchResult.sampleData && searchResult.sampleData.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-black mb-2">Recent Records:</p>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm border">
                                    <thead className="bg-gray-200">
                                        <tr>
                                            <th className="p-2 border text-black">Date</th>
                                            <th className="p-2 border text-black">ERC</th>
                                            <th className="p-2 border text-black">BI</th>
                                            <th className="p-2 border text-black">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResult.sampleData.map((record, idx) => (
                                            <tr key={idx}>
                                                <td className="p-2 border text-black">
                                                    {record.Date || record.ObservationTime?.split('T')[0] || 'N/A'}
                                                </td>
                                                <td className="p-2 border text-black">{record.ERC || 'N/A'}</td>
                                                <td className="p-2 border text-black">{record.BI || 'N/A'}</td>
                                                <td className="p-2 border text-black">{record.NFDRType || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleAddToDatabase}
                            disabled={addingToDb}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {addingToDb ? 'Adding...' : 'Confirm & Add to Database'}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={addingToDb}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Help Text */}
            <p className="text-xs text-gray-500 mt-4">
                Enter a FEMS station ID to search. The system will fetch the last 3 days of data.
                Example station IDs: 54702, 52813, 52812, 54704
            </p>
        </div>
    )
}
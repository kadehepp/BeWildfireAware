// const CSV_URL = 'https://fems.fs2c.usda.gov/api/ext-climatology/download-nfdr-daily-summary/?dataset=all&startDate=2026-01-20&endDate=2026-02-21&dataFormat=csv&stationIds=52812,54704,54702,52813&fuelModels=Y'

// // Pairs of StationId and StationName for high elevation stations
// const highElevationPairs = [
// 	['54702', 'LUJAN'],
// 	['52813', 'HUNTSMAN MESA'],
// 	['52812', 'TAYLOR PARK'],
// 	['54704', 'NEEDLE CREEK'],
// ]
import { supabase } from '@/lib/supabase'
//get date
function formatedDate(date) {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}


async function getDataMapFuelModel(){
	//grab all records currently, future optimize to grab last entry for each station
	const {data: Records, error: getDataError} = await supabase
	.from('StationRecord')
	.select('Station_ID, fuel_model')

	//basic error for now
	if(getDataError){
		console.error('Error fetching StationRecord data:', getDataError)
		return { rows: [], columnNames: [] }
	}

	//create a map for stationID->nfdr type, one csv call per fuel model
	const fuelModelMap = new Map()
	//loop through all records(will be too big eventually, need to grab most recent record for each station)
	for(const record of Records){
		const stationID = record.Station_ID
		const fuelModel = record.fuel_model || 'Y' //default y for now if null ( possibly O?)
		//make sure uniqueness in map
		if(!fuelModelMap.has(stationID)){
			fuelModelMap.set(stationID, fuelModel)
		}
	}
	//show it grabbed data and stored unique values
	console.log(`Found ${fuelModelMap.size} unique stationID->fuelModel entries`)	

	//create object, group ids by fuel model type, id= fuel model type, value = array of stationIDs
	const stationsByFuelModel = {}
	for(const [stationID, fuelModel] of fuelModelMap.entries()){
		if(!stationsByFuelModel[fuelModel]){
			stationsByFuelModel[fuelModel] = []
		}
		//add station to fuel model group
		stationsByFuelModel[fuelModel].push(stationID)
		
	}
	console.log('Stations grouped by fuel model:', Object.keys(stationsByFuelModel))
	return stationsByFuelModel
}




//build the CSV URL with date range and station IDs and specific fuel model
function buildCsvUrl(startDate, endDate, stationIds, fuelModel){ 
	const baseCSV = 'https://fems.fs2c.usda.gov/api/ext-climatology/download-nfdr-daily-summary/?dataset=all'
	const stationIdString = stationIds.join(',')//all ids separated by comma for url
	return `${baseCSV}&startDate=${startDate}&endDate=${endDate}&dataFormat=csv&stationIds=${stationIdString}&fuelModels=${fuelModel}`
}


//store in db
async function storeCsvData(csvRows) {

    console.log(`Storing ${csvRows.length} rows to database`)
    
    //Get a mapping of StationName -> Station_ID from db to use, having issues getting ID directly from csv
    const { data: stationMap, error: mapError } = await supabase
        .from('StationRecord')
        .select('Station_ID, Station_Name')
    
    if (mapError) {
        console.error('Error fetching station mapping:', mapError)
        return { success: false, error: mapError.message } //return error but try to continue, print out msg
    }
    
    // { "TAYLOR PARK": 52812, "LUJAN": 54702, etc. }
    const nameToIdMap = {}
    stationMap.forEach(record => {
        if (record.Station_Name && record.Station_ID) { //only add to map if both name and ID exist
            nameToIdMap[record.Station_Name] = record.Station_ID
        }
    })
    console.log('Station name to ID mapping:', nameToIdMap) //if missing names print
    


    // Define column mapping, easy to add more columns to when needed
    const columnMapping = {
        'StationName': 'Station_Name',  
        'BI': 'BI',
        'ERC': 'ERC',
        'ObservationTime': 'Observation_Time',
        'NFDRType': 'NFDRType',
        'fuel_model': 'fuel_model' 
    }
    
    // Transform each row
    const dbRows = csvRows.map(row => {
        const dbRow = {}
        
        // Map fields csv-> db
        Object.entries(columnMapping).forEach(([csvField, dbField]) => {
            if (row[csvField] !== undefined && row[csvField] !== '') {
                dbRow[dbField] = row[csvField]
            }
        })
        
        //Look up Station_ID using StationName
        const stationName = row.StationName
        if (stationName && nameToIdMap[stationName]) {
            dbRow.Station_ID = nameToIdMap[stationName]

            console.log(`Mapped: ${stationName}->ID: ${dbRow.Station_ID}`)
        } else { 
            console.error(`Could not find Station_ID for name: "${stationName}"`)
            
        }
        
        // default fuel model to Y if null
        if (!dbRow.fuel_model) {
            dbRow.fuel_model = 'Y'
        }
        
        return dbRow
    }).filter(row => row.Station_ID) // Only keep rows that have a Station_ID
    

	//show rows ready for adding(#)
    console.log(`Prepared ${dbRows.length} rows for insertion (filtered out ${csvRows.length - dbRows.length} rows with no Station_ID)`)
    
    if (dbRows.length === 0) {
        console.error('No valid rows to insert - all missing Station_ID')
        return { success: false, error: 'No valid rows' }
    }
    
    // Insert all rows at once, issues in the future?
    const { data, error } = await supabase
        .from('StationRecord')
        .insert(dbRows)
    
		
    if (error) {
        console.error('Error inserting data:', error)
        return { 
            success: false, 
            error: error.message,
            rowsAttempted: csvRows.length 
        }
    }
    
    console.log(`Successfully stored ${dbRows.length} rows`)
    return { 
        success: true, 
        count: dbRows.length,
        data: data 
    }
}




export async function buildCsvStoreData() {
	//get station data and group by fuel model
	const stationsByFuelModel = await getDataMapFuelModel()
	if(Object.keys(stationsByFuelModel).length === 0){
		console.error('No station data found in db, cannot build CSV URLs')
		return { rows: [], columnNames: [], summary: {totalRows: 0} } //prevent crash but still try to return something for testing, eventually want to handle this case better

	}
	//end date = current date
	//start date = first of month
	const today = new Date()
	const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
	const startDate= formatedDate(firstOfMonth)
	const endDate = formatedDate(today)

	//prepare arrays to store results
	const allRows = []
	let allColumnNames = []

	for (const [fuelModel, stationIds] of Object.entries(stationsByFuelModel)){ //for each key->value(s) paur
		//skip empty fuel models (wvxz for now)
		if(stationIds.length === 0){
			console.log('Skipping fuel model ${fuelModel} with no station IDs')
			continue
		}
		console.log(`Processing fuel model ${fuelModel} with ${stationIds.length} station IDs`)

		const uniqueUrl = buildCsvUrl(startDate, endDate, stationIds, fuelModel)
		try {
			const response = await fetch(uniqueUrl)
			if (!response.ok) {
				console.error(`Network response was not ok for fuel model ${fuelModel}`) //trhow error, dpomt crash
				continue
			}

			const csvText = await response.text()
			const lines = csvText.trim().split('\n')
			if (lines.length < 2) {
				console.warn(`No data rows found in CSV for fuel model ${fuelModel}`)
				continue
			}

			const headers = lines[0].split(',').map(col => col.replaceAll('"', ''))
			if (allColumnNames.length === 0) {
				allColumnNames = headers
			}
			for (let i = 1; i < lines.length; i++) {
				const values = lines[i].split(',').map(val => val.replaceAll('"', ''))

				//keys are headers, values are data
				const row = {}
				headers.forEach((header, index) => {
					row[header] = values[index] || ''
				})
				row.Fuel_Model = fuelModel //add fuel model to each row for reference
				allRows.push(row)
			}	
		} catch (error) {
			console.error(`Error fetching or processing CSV for fuel model ${fuelModel}:`, error.message)
		}	
	}
	//after all csv calls, sort 
	
		
		
	//sort all rows by ObservationTime descending, 
	allRows.sort((a,b)=>b.ObservationTime.localeCompare(a.ObservationTime))
	console.log('Total rows fetched across all fuel models:', allRows.length)
	await storeCsvData(allColumnNames, allRows) //store in supabase for later
	return { rows: allRows, columnNames: allColumnNames, summary: { totalRows: allRows.length } }
}





/*
const stationIds = stationsByFuelModel[fuelModel].join(',')
		const csvUrl = buildCsvUrl(startDate, endDate, stationIds, fuelModel)
		console.log(`Built CSV URL for fuel model ${fuelModel}:`, csvUrl)
export async function getCsvData() {
	const response = await fetch(buildCsvUrl())
	const csvText = await response.text()
	const lines = csvText.trim().split('\n')
	
	const columnNames = lines[0].split(',').map(col => col.replaceAll('"', ''))
	if (!columnNames.includes('StationId')){
		columnNames.push('StationId')
	}


	console.log('Column Names:', columnNames)
	const rows = []
	
	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split(',').map(val => val.replaceAll('"', ''))
		const row = {}
		columnNames.forEach((col, index) => {
			row[col] = values[index] || ''
		})

		// let stationId = ''
		// for (const [id, name] of highElevationPairs) {//find StationId based on StationName
		// 	if (name === row.StationName) {
		// 		stationId = id
		// 		break
		// 	}
		// }
		// row.StationId = stationId
		rows.push(row)
	}
	//sort rows by ObservationTime descending
	rows.sort((a,b)=>b.ObservationTime.localeCompare(a.ObservationTime))
	
	return { columnNames, rows }
}
*/

'use client'
//bad dropdown, REMAKE
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GetDropdownData } from './GetDropdownData'

export default function DispatchDropdown() {
    const [data, setData] = useState([])
    const [openId, setOpenId] = useState(null)

    useEffect(() => {
        async function fetchData() {
            const res = await GetDropdownData()
            if (!res.error) {
                setData(res.data)
            }
        }
        fetchData()
    }, [])

    return (
        <div>
            {data.map(dispatch => (
                <div
                    key={dispatch.id}
                    onMouseEnter={() => setOpenId(dispatch.id)}
                    onMouseLeave={() => setOpenId(null)}
                >
                    {/* Dispatch Area Header */}
                    <div
                        onClick={() =>
                            setOpenId(openId === dispatch.id ? null : dispatch.id)
                        }
                        
                    >
                        {dispatch.name}
                    </div>

                    {/* FDRA list (vertical, inline) */}
                    {openId === dispatch.id && (
                        <div >
                            {dispatch.fdrAs.map(fdra => (
                                <Link
                                    key={fdra.id}
                                    href={`/fdra/${fdra.id}`}
                                    
                                >
                                    {fdra.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

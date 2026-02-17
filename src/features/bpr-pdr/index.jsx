import React from 'react'
import { BPRPDRTable } from '../master-data/components/BPRPDRTable'

const BPRPDR = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">BPR-PDR Management</h1>
        <p className="text-slate-500 text-sm">Buffer Planning and Bottleneck Detection Report</p>
      </div>
      <BPRPDRTable />
    </div>
  )
}

export default BPRPDR
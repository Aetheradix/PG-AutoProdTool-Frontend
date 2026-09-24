import React from 'react'
import { Card } from 'antd'
import { MdOutlineFactCheck } from 'react-icons/md'
import { FiBook } from 'react-icons/fi'
import { BPRPDRTable } from '../master-data/components/BPRPDRTable'

const BPRPDR = () => {
  return (
    <div className="fade-in pb-10">
      <div className="flex flex-col items-start w-full">
        <div className="flex-1 w-full">
          <Card
            title={
              <div className="flex items-center gap-3 py-1">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50">
                  <MdOutlineFactCheck className="text-blue-600" size={20} />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent block">
                    BPR-PDR Management
                  </span>
                  <span className="text-xs text-slate-400 font-normal flex items-center gap-1">
                    <FiBook size={11} /> Batch Production Record — Process Deviation Report
                  </span>
                </div>
              </div>
            }
            className="border-none shadow-md rounded-2xl overflow-hidden min-h-125"
            styles={{
              header: { borderBottom: '1px solid #f1f5f9', padding: '12px 24px' },
              body: { padding: '24px' }
            }}
          >
            <BPRPDRTable />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default BPRPDR
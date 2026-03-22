import React from 'react'
import Navbar from '../component/layout/Navbar'
import InspectionResult from '../component/inspectionResult/InspectionResult'

const InspectionResultPage = () => {
  return (
    <div className='w-full max-w-[1560px] flex flex-col pb-4'>
      <Navbar />

      <InspectionResult />
    </div>
  )
}

export default InspectionResultPage
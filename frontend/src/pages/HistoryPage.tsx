import React from 'react'
import Navbar from '../component/layout/Navbar'
import History from '../component/history/History'

const HistoryPage = () => {
  return (
    <div className='w-full max-w-[1560px] flex flex-col pb-4'>
      <Navbar />

      <History />
    </div>
  )
}

export default HistoryPage
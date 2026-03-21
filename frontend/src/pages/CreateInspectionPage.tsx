import React from 'react'
import Navbar from '../component/layout/navbar'
import CreateInspection from '../component/createInspection/CreateInspection'

const CreateInspectionPage = () => {
  return (
    <div className='w-full max-w-[1560px] h-screen flex flex-col overflow-hidden'>
        <Navbar />
        
        <CreateInspection />
    </div>
  )
}

export default CreateInspectionPage
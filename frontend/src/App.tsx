import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreateInspectionPage from './pages/CreateInspectionPage';
import HistoryPage from './pages/HistoryPage';
import InspectionResultPage from './pages/InspectionResultPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HistoryPage />} />
        <Route path="/CreateInspection" element={<CreateInspectionPage  />} />
        <Route path="/InspectionResult/:id" element={<InspectionResultPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
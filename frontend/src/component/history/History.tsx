import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom';
import { DayPicker, type DateRange } from 'react-day-picker';
import { format, isValid } from 'date-fns';
import 'react-day-picker/dist/style.css';
import axios from 'axios';

const mockData = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  createDate: "28/08/2023 18:00:00",
  inspectionID: "MI-000-0000",
  name: "Name1",
  standard: "Standard1",
  note: "________________"
}));

const History = () => {
  const navigate = useNavigate();

  const [searchID, setSearchID] = useState<string>('');

  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const CalendarBox = useRef<HTMLDivElement>(null);
  const [searchRangeDate, setSearchRangeDate] = useState<DateRange | undefined>();
  const startDate = searchRangeDate?.from;
  const endDate = searchRangeDate?.to;

  const [appliedFilters, setAppliedFilters] = useState({
    id: '',
    dateRange: undefined as DateRange | undefined
  });

  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [currPageIdx, setCurrPageIdx] = useState<number>(0);
  const rowPerPage = 10;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/history', {
        params: {
          inspectionID: appliedFilters.id || undefined,
          startDate: appliedFilters.dateRange?.from?.toISOString(),
          endDate: appliedFilters.dateRange?.to?.toISOString(),
        }
      });

      setData(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [appliedFilters]);

  const handleClearFilter = () => {
    setSearchID('');
    setSearchRangeDate(undefined);
    setAppliedFilters({ id: '', dateRange: undefined });
    setCurrPageIdx(0);
  };

  const handleSearch = () => {
    setAppliedFilters({
      id: searchID,
      dateRange: searchRangeDate
    });
    setCurrPageIdx(0);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (CalendarBox.current && !CalendarBox.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar])

  const toggleSelectAll = () => {
    if (selectedItems.length === data.length && data.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(data.map(item => item.id || item._id));
    }
  };

  const toggleSelectItem = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedItems.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      try {
        await axios.post('/api/history/delete', {
          ids: selectedItems
        });

        alert("Deleted successfully");
        setSelectedItems([]);
        fetchData();
      } catch (error: any) {
        console.error("Delete error:", error);
        alert(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const displayData = useMemo(() => {
    const start = currPageIdx * rowPerPage;
    return data.slice(start, start + rowPerPage);
  }, [data, currPageIdx]);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / rowPerPage);
  const startRange = totalItems === 0 ? 0 : currPageIdx * rowPerPage + 1;
  const endRange = Math.min((currPageIdx + 1) * rowPerPage, totalItems);

  const goToNextPage = () => {
    if (currPageIdx < totalPages - 1) setCurrPageIdx(prev => prev + 1);
  };

  const goToPrevPage = () => {
    if (currPageIdx > 0) setCurrPageIdx(prev => prev - 1);
  };

  return (
    <div className='w-full h-full flex-1 flex flex-col gap-4 py-4 px-12'>
      <section className='flex justify-end'>
        <button
          onClick={() => navigate('/CreateInspection')}
          className='flex justify-center items-center bg-[#1F7B44] gap-3 py-2 px-4 rounded-lg cursor-pointer hover:scale-105'
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><path fill="#fff" d="M18 12.998h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5v-5a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2"></path></svg>
          <span className='text-white'>Create Inspection</span>
        </button>
      </section>

      <section className='flex flex-col gap-3 px-4 py-2 bg-gray-100'>
        <div className='flex gap-4'>
          <div className='flex-2 flex flex-col gap-1'>
            <label htmlFor="ID">ID</label>
            <input
              id='ID'
              type="text"
              placeholder='Search with ID'
              value={searchID}
              onChange={(e) => setSearchID(e.target.value)}
              className='w-full h-8 border-gray-400 border-1 rounded-md p-2'
            />
          </div>

          <div className='relative flex-1 flex flex-col gap-1'>
            <label htmlFor="date">Date</label>
            <div
              id="date"
              className="relative w-full h-8 flex items-center border-1 border-gray-400 rounded-lg px-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowCalendar(!showCalendar);
              }}
            >
              <p className={`${searchRangeDate ? "text-black" : "text-gray-400"}`}>
                {startDate && endDate
                  ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
                  : startDate
                    ? `${format(startDate, 'dd/MM/yyyy')} - ...`
                    : "Search with date range"}
              </p>

              <div className='absolute bottom-2 right-2'>
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16"><path fill="#8a8a8a" d="M14.5 16h-13C.67 16 0 15.33 0 14.5v-12C0 1.67.67 1 1.5 1h13c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5M1.5 2c-.28 0-.5.22-.5.5v12c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5z"></path><path fill="#8a8a8a" d="M4.5 4c-.28 0-.5-.22-.5-.5v-3c0-.28.22-.5.5-.5s.5.22.5.5v3c0 .28-.22.5-.5.5m7 0c-.28 0-.5-.22-.5-.5v-3c0-.28.22-.5.5-.5s.5.22.5.5v3c0 .28-.22.5-.5.5m4 2H.5C.22 6 0 5.78 0 5.5S.22 5 .5 5h15c.28 0 .5.22.5.5s-.22.5-.5.5"></path></svg>
              </div>
            </div>

            {showCalendar && (
              <div
                ref={CalendarBox}
                className='absolute left-0 top-[100%] flex flex-col items-center p-4
                          bg-white border border-gray-200 rounded-lg shadow-xl z-50'
              >
                <DayPicker
                  mode="range"
                  captionLayout="dropdown"
                  selected={searchRangeDate}
                  disabled={{ after: new Date() }}
                  onSelect={(date) => {
                    if (date) setSearchRangeDate(date);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-between'>
          <button onClick={handleClearFilter} className=' cursor-pointer'>
            <span className='text-red-500 underline'>Clear Filter</span>
          </button>

          <button
            onClick={handleSearch}
            className='flex justify-center items-center bg-[#1F7B44] gap-3 py-2 px-4 rounded-lg cursor-pointer hover:scale-105'
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><path fill="#fff" d="M9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"></path></svg>
            <span className='text-white'>Search</span>
          </button>
        </div>
      </section>

      <section className="w-full bg-white shadow-sm rounded-sm overflow-hidden">
        {selectedItems.length > 0 && (
          <div className='flex items-center gap-3 mb-4'>
            <button
              onClick={handleDelete}
              className='flex justify-center items-center border-2 border-[#1F7B44] 
              rounded-md gap-2 px-3 py-1.5 cursor-pointer hover:bg-lime-100'
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 14 14"><path fill="none" stroke="#1F7B44" strokeLinecap="round" strokeLinejoin="round" d="M1 3.5h12m-10.5 0h9v9a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1zm2 0V3a2.5 2.5 0 1 1 5 0v.5m-4 3.001v4.002m3-4.002v4.002" strokeWidth={1}></path></svg>
              <span className='text-[#1F7B44] font-semibold'>Delete</span>
            </button>

            <p>Select items: {selectedItems.length} item</p>
          </div>
        )}

        <table className="w-full text-left border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-[#1F7B44] text-white text-sm font-medium">
              <th className="py-3 px-4 w-12">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-white cursor-pointer"
                  onChange={toggleSelectAll}
                  checked={selectedItems.length === mockData.length}
                />
              </th>
              <th className="py-3 px-4 font-semibold">Create Date - Time</th>
              <th className="py-3 px-4 font-semibold">Inspection ID</th>
              <th className="py-3 px-4 font-semibold">Name</th>
              <th className="py-3 px-4 font-semibold">Standard</th>
              <th className="py-3 px-4 font-semibold">Note</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="text-gray-700 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">Loading data...</td>
              </tr>
            ) : (
              displayData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => navigate(`/InspectionResult/${item.id}`)}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td
                    onClick={(e) => e.stopPropagation()}
                    className="py-4 px-4"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#1F7B44] cursor-pointer"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                    />
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">{item.createDate}</td>
                  <td className="py-4 px-4">{item.inspectionID}</td>
                  <td className="py-4 px-4">{item.name}</td>
                  <td className="py-4 px-4">{item.standard}</td>
                  <td className="py-4 px-4 text-gray-400">{item.note}</td>
                </tr>
              ))
            )}
            {!loading && displayData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">No data found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Section */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 text-xs text-gray-600 font-medium">
          <div>{startRange}-{endRange} of {totalItems}</div>
          <div className="flex items-center gap-6">
            <button
              onClick={goToPrevPage}
              disabled={currPageIdx === 0}
              className="hover:text-black cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6l6 6l1.41-1.41L10.83 12z" /></svg>
            </button>
            <button
              onClick={goToNextPage}
              disabled={currPageIdx >= totalPages - 1}
              className="hover:text-black cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default History
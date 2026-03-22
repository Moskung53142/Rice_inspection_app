import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import axios from 'axios';

const SamplingPoints = [
    { id: 1, name: 'Front End' },
    { id: 2, name: 'Back End' },
    { id: 3, name: 'Other' },
]

const InspectionResult = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState<boolean>(true);
    const [inspectionData, setInspectionData] = useState<any>(null);

    const [showEditPopup, setShowEditPopup] = useState<boolean>(false);
    const [note, setNote] = useState<string>('');
    const [price, setPrice] = useState<number>(0);
    const [priceWarning, setPriceWarning] = useState<boolean>(false);
    const [selectSamplingPointIdx, setSelectSamplingPointIdx] = useState<number[]>([]);
    const [selectSamplingDatetime, setSelectSamplingDatetime] = useState<string>('');
    const [selectTime, setSelectTime] = useState<string>(format(new Date(), 'HH:mm:ss'));
    const [showCalendar, setShowCalendar] = useState<boolean>(false);
    const [selectDate, setSelectDate] = useState<Date>();

    const CalendarBox = useRef<HTMLDivElement>(null);
    const DatetimeInputRef = useRef<HTMLDivElement>(null);

    const minPrice = 0;
    const maxPrice = 100000;

    const fetchInspectionDetail = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/history/${id}`);
            const data = response.data;

            setInspectionData(data);

            setNote(data.note || '');
            setPrice(data.price || 0);

            if (data.samplingPoint) {
                const indices = SamplingPoints
                    .map((p, idx) => data.samplingPoint.includes(p.name) ? idx : -1)
                    .filter(idx => idx !== -1);
                setSelectSamplingPointIdx(indices);
            }

            if (data.samplingDate) {
                const dateObj = new Date(data.samplingDate);
                setSelectDate(dateObj);
                setSelectTime(format(dateObj, 'HH:mm:ss'));
                setSelectSamplingDatetime(data.samplingDate);
            }

        } catch (error) {
            console.error("Error fetching detail:", error);
            alert("Could not load inspection data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchInspectionDetail();
    }, [id]);

    const checkPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (isNaN(value) || value < minPrice || value > maxPrice) {
            setPriceWarning(true);
        } else {
            setPriceWarning(false);
        }
        setPrice(value || 0);
    }

    const handleMultiCheckbox = (idx: number) => {
        setSelectSamplingPointIdx(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!CalendarBox.current?.contains(target) &&
                !DatetimeInputRef.current?.contains(target) &&
                !target.closest('.rdp')) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (showEditPopup && inspectionData) {
            setNote(inspectionData.note || "");
            setPrice(inspectionData.price || 0);

            if (Array.isArray(inspectionData.samplingPoint)) {
                const initialIndices = inspectionData.samplingPoint
                    .map((name: any) => SamplingPoints.findIndex(p => p.name === name))
                    .filter((idx: any) => idx !== -1); 
                setSelectSamplingPointIdx(initialIndices);
            } else {
                setSelectSamplingPointIdx([]);
            }

            const dt = inspectionData.samplingDate ? new Date(inspectionData.samplingDate) : new Date();
            setSelectDate(dt);
            setSelectSamplingDatetime(dt.toISOString());
            setSelectTime(format(dt, 'HH:mm:ss'));
        }
    }, [showEditPopup, inspectionData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (priceWarning) return;

        const samplingPointNames = selectSamplingPointIdx
            .sort((a, b) => a - b)
            .map(idx => SamplingPoints[idx].name);

        const patchPayload = {
            note: note,
            price: Number(price),
            samplingDate: selectSamplingDatetime,
            samplingPoint: samplingPointNames,
            updateDate: new Date().toISOString()
        };

        try {
            const response = await axios.patch(
                `http://localhost:5000/history/${inspectionData.inspectionID}`,
                patchPayload
            );

            if (response.status === 200) {
                alert("Update Success!");
                setShowEditPopup(false);
                fetchInspectionDetail();
            }
        } catch (error) {
            console.error("Patch error:", error);
            alert("Update failed!");
        }
    };

    if (loading) return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
    if (!inspectionData) return <div className="w-full h-screen flex items-center justify-center">No Data Found</div>;

    return (
        <>
            {showEditPopup ? (
                <div
                    onClick={() => setShowEditPopup(false)}
                    className='fixed top-0 left-0 w-screen h-screen flex justify-center bg-black/50 z-50'
                >
                    <form
                        onSubmit={handleSubmit}
                        onClick={(e) => e.stopPropagation()}
                        className='relative w-full max-w-md self-center rounded-lg p-6 bg-white'
                    >
                        <div className='flex flex-col gap-3'>
                            <p className='text-lg font-semibold'>Edit Inspection ID: {inspectionData.inspectionID}</p>

                            <div className='flex flex-col gap-1'>
                                <label htmlFor="Note">Note</label>
                                <input
                                    id='Note'
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className='w-full h-8 border-gray-400 border-1 rounded-md p-2'
                                />
                            </div>

                            <div className='flex flex-col gap-1'>
                                <label htmlFor="Price">Price</label>
                                <input
                                    id='Price'
                                    type="number"
                                    value={price}
                                    onChange={checkPriceInput}
                                    className='w-full h-8 border-gray-400 border-1 rounded-md p-2'
                                />
                                {priceWarning && <p className='text-xs text-red-500'>*price should be 0-100,000</p>}
                            </div>

                            <div className='flex flex-col gap-1'>
                                <label htmlFor="SamplingPoint">Sampling Point</label>
                                <div id='SamplingPoint' className='flex items-center justify-between'>
                                    {SamplingPoints.map((data, idx) => (
                                        <div key={data.id} className='flex items-center gap-2'>
                                            <button
                                                type='button'
                                                onClick={() => handleMultiCheckbox(idx)}
                                                className={`w-4 h-4 border-1 border-[#1F7B44] rounded-sm hover:bg-[#1F7B44] transition-all duration-300
                                                    ${selectSamplingPointIdx.includes(idx) ? "bg-[#1F7B44]" : "bg-white"}`}
                                            />
                                            <p>{data.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='relative flex flex-col gap-1'>
                                <label htmlFor="DatetimeSampling">Date/Time of Sampling</label>
                                <div
                                    ref={DatetimeInputRef}
                                    className="relative w-full h-8 flex items-center border-1 border-gray-400 rounded-lg px-2 cursor-pointer"
                                    onClick={() => setShowCalendar(!showCalendar)}
                                >
                                    <p className={`${selectSamplingDatetime !== "" ? "text-black" : "text-gray-400"}`}>
                                        {selectSamplingDatetime
                                            ? format(new Date(selectSamplingDatetime), 'dd/MM/yyyy HH:mm:ss')
                                            : "Select sampling date"}
                                    </p>
                                    <div className='absolute bottom-2 right-2'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16"><path fill="#8a8a8a" d="M14.5 16h-13C.67 16 0 15.33 0 14.5v-12C0 1.67.67 1 1.5 1h13c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5M1.5 2c-.28 0-.5.22-.5.5v12c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5z"></path><path fill="#8a8a8a" d="M4.5 4c-.28 0-.5-.22-.5-.5v-3c0-.28.22-.5.5-.5s.5.22.5.5v3c0 .28-.22.5-.5.5m7 0c-.28 0-.5-.22-.5-.5v-3c0-.28.22-.5.5-.5s.5.22.5.5v3c0 .28-.22.5-.5.5m4 2H.5C.22 6 0 5.78 0 5.5S.22 5 .5 5h15c.28 0 .5.22.5.5s-.22.5-.5.5"></path></svg>
                                    </div>
                                </div>

                                {showCalendar && (
                                    <div ref={CalendarBox} className='absolute right-0 bottom-[60%] flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg shadow-xl z-50'>
                                        <DayPicker
                                            mode="single"
                                            selected={selectDate}
                                            disabled={{ after: new Date() }}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setSelectDate(date);
                                                    const [h, m, s] = selectTime.split(':').map(Number);
                                                    date.setHours(h, m, s || 0);
                                                    setSelectSamplingDatetime(date.toISOString());
                                                }
                                            }}
                                        />
                                        <div className='w-full flex items-center justify-between border-t border-gray-100 pt-4 px-2 gap-4'>
                                            <span className='text-sm font-medium'>Time</span>
                                            <input
                                                type="time"
                                                step="1"
                                                value={selectTime}
                                                onChange={(e) => {
                                                    const timeVal = e.target.value;
                                                    setSelectTime(timeVal);
                                                    if (selectDate) {
                                                        const [h, m, s] = timeVal.split(':').map(Number);
                                                        const updatedDate = new Date(selectDate);
                                                        updatedDate.setHours(h, m, s || 0);
                                                        setSelectSamplingDatetime(updatedDate.toISOString());
                                                    }
                                                }}
                                                className='border border-gray-300 rounded px-2 py-1 text-sm outline-[#1F7B44]'
                                            />
                                        </div>
                                        <button type="button" onClick={() => setShowCalendar(false)} className='w-full mt-4 bg-[#1F7B44] text-white py-2 rounded-lg'>Confirm</button>
                                    </div>
                                )}
                            </div>

                            <div className='flex justify-end gap-4'>
                                <button type='button' onClick={() => setShowEditPopup(false)} className='w-24 h-9 rounded-lg bg-white border-1 border-[#1F7B44]'>
                                    <span className='text-[#1F7B44]'>Cancel</span>
                                </button>
                                <button type="submit" className='w-24 h-9 rounded-lg bg-[#1F7B44]'>
                                    <span className='text-white'>Submit</span>
                                </button>
                            </div>
                        </div>
                    </form >
                </div >
            ) : null}

            <div className='w-full h-full flex-1 flex flex-col items-center gap-4 py-4 px-12'>
                <p className='text-4xl font-semibold'>Inspection</p>
                <div className='w-full flex gap-4'>
                    <div className='flex-1 flex flex-col gap-4'>
                        <div>
                            <img src={inspectionData.imageLink || "https://easyrice-es-trade-data.s3.ap-southeast-1.amazonaws.com/example-rice.webp"} alt="rice" className="rounded-lg shadow-md" />
                        </div>
                        <div className='flex justify-end gap-4'>
                            <button onClick={() => navigate(-1)} className='border-1 border-[#1F7B44] px-8 py-1 rounded-md cursor-pointer hover:scale-105'>
                                <span className='text-[#1F7B44]'>Back</span>
                            </button>
                            <button onClick={() => setShowEditPopup(true)} className='bg-[#1F7B44] px-8 py-1 rounded-md cursor-pointer hover:scale-105'>
                                <span className='text-white'>Edit</span>
                            </button>
                        </div>
                    </div>

                    <div className='flex-3 flex flex-col bg-gray-200 rounded-lg gap-3 p-4'>
                        <div className='w-full grid grid-cols-2 gap-y-2 p-4 bg-white rounded-lg'>
                            <div>
                                <p className='text-sm text-gray-500'>Create Date - Time</p>
                                <p>{inspectionData.createDate ? format(new Date(inspectionData.createDate), 'dd/MM/yyyy - HH:mm:ss') : '-'}</p>
                            </div>
                            <div>
                                <p className='text-sm text-gray-500'>Inspection ID</p>
                                <p>{inspectionData.inspectionID}</p>
                            </div>
                            <div>
                                <p className='text-sm text-gray-500'>Standard</p>
                                <p>{inspectionData.standardName || '-'}</p>
                            </div>
                            <div>
                                <p className='text-sm text-gray-500'>Total Sample</p>
                                <p>{inspectionData.totalSample || 0} kernels</p>
                            </div>
                            <div>
                                <p className='text-sm text-gray-500'>Update Date - Time</p>
                                <p>{inspectionData.updateDate ? format(new Date(inspectionData.updateDate), 'dd/MM/yyyy - HH:mm:ss') : '-'}</p>
                            </div>
                        </div>

                        <div className='w-full grid grid-cols-2 gap-y-2 p-4 bg-white rounded-lg'>
                            <div>
                                <p className='text-sm text-gray-500'>Note</p>
                                <p>{inspectionData.note || '-'}</p>
                            </div>
                            <div>
                                <p className='text-sm text-gray-500'>Price</p>
                                <p>{inspectionData.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })} baht</p>
                            </div>
                            <div>
                                <p className='text-sm text-gray-500'>Date/Time of Sampling</p>
                                <p>{inspectionData.samplingDate ? format(new Date(inspectionData.samplingDate), 'dd/MM/yyyy HH:mm:ss') : '-'}</p>
                            </div>
                            <div>
                                <p className='text-sm text-gray-500'>Sampling Point</p>
                                <p>{inspectionData.samplingPoint?.join(', ') || '-'}</p>
                            </div>
                        </div>

                        {/* Composition */}
                        <div className='w-full flex flex-col p-4 bg-white rounded-lg gap-4'>
                            <p className='text-lg font-bold text-gray-800'>Composition</p>
                            <table className='w-full text-left'>
                                <thead>
                                    <tr className='bg-gray-100 text-gray-600 text-sm font-semibold'>
                                        <th className='py-2 px-3 rounded-l-md'>Name</th>
                                        <th className='py-2 px-3 text-right'>Length</th>
                                        <th className='py-2 px-3 text-right rounded-r-md'>Actual</th>
                                    </tr>
                                </thead>
                                <tbody className='text-sm font-medium'>
                                    <tr className='border-b border-gray-100'>
                                        <td className='py-3 px-3'>ข้าวเต็มเมล็ด</td>
                                        <td className='py-3 px-3 text-right text-gray-500'>&gt;= 7</td>
                                        <td className='py-3 px-3 text-right text-[#1F7B44]'>{inspectionData.wholeKernelPercent || "0.00"} %</td>
                                    </tr>
                                    <tr className='border-b border-gray-100'>
                                        <td className='py-3 px-3'>ข้าวหักใหญ่</td>
                                        <td className='py-3 px-3 text-right text-gray-500'>3.5 - 6.99</td>
                                        <td className='py-3 px-3 text-right text-[#1F7B44]'>{inspectionData.brokenKernelPercent || "0.00"} %</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Defect Rice */}
                        <div className='w-full flex flex-col p-4 bg-white rounded-lg gap-4'>
                            <p className='text-lg font-bold text-gray-800'>Defect Rice</p>
                            <table className='w-full text-left'>
                                <thead>
                                    <tr className='bg-gray-100 text-gray-600 text-sm font-semibold'>
                                        <th className='py-2 px-3 rounded-l-md'>Name</th>
                                        <th className='py-2 px-3 text-right rounded-r-md'>Actual</th>
                                    </tr>
                                </thead>
                                <tbody className='text-sm'>
                                    {[
                                        'yellow', 'paddy', 'damaged', 'glutinous', 'chalky', 'red'
                                    ].map((defect) => (
                                        <tr key={defect} className='border-b border-gray-100'>
                                            <td className='py-3 px-3 capitalize'>{defect}</td>
                                            <td className='py-3 px-3 text-right text-[#1F7B44]'>{inspectionData[defect] || "0.00"} %</td>
                                        </tr>
                                    ))}
                                    <tr className='font-bold'>
                                        <td className='py-3 px-3 uppercase'>Total</td>
                                        <td className='py-3 px-3 text-right text-[#1F7B44]'>{inspectionData.totalDefect || "0.00"} %</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default InspectionResult
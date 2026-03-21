import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import axios from 'axios';

const SamplingPoints = [
    { id: 1, name: 'Front End' },
    { id: 2, name: 'Back End' },
    { id: 3, name: 'Other' },
]

const standardname = [
    { id: 1, name: 'a' },
    { id: 2, name: 'b' },
    { id: 3, name: 'c' },
    { id: 4, name: 'd' },
    { id: 5, name: 'e' },
    { id: 6, name: 'f' },
]

const CreateInspection = () => {
    const navigate = useNavigate();

    const [name, setName] = useState<string>('');

    const [showStandard, setShowStandard] = useState<boolean>(false);
    const [selectStandard, setSelectStandard] = useState<string>('');
    const standardCombobox = useRef<HTMLDivElement>(null);

    const [fileName, setFileName] = useState<string>("");
    const [jsonData, setJsonData] = useState<any[]>([]);

    const [note, setNote] = useState<string>('');

    const [price, setPrice] = useState<number>(0);
    const [priceWarning, setPriceWarning] = useState<boolean>(false);
    const minPrice = 0;
    const maxPrice = 100000;

    const [selectSamplingPointIdx, setSelectSamplingPointIdx] = useState<number[]>([]);

    const [selectSamplingDatetime, setSelectSamplingDatetime] = useState<string>('');
    const [selectTime, setSelectTime] = useState<string>(format(new Date(), 'HH:mm:ss'));
    const [showCalendar, setShowCalendar] = useState<boolean>(false);
    const [selectDate, setSelectDate] = useState<Date>();
    const CalendarBox = useRef<HTMLDivElement>(null);
    const DatetimeInputRef = useRef<HTMLDivElement>(null);

    const handleSelect = (standard: string) => {
        setSelectStandard(standard);
        setShowStandard(false);
    }

    const processFile = (file: File) => {
        if (file.name.endsWith('.json')) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string);

                    if (Array.isArray(data)) {
                        setJsonData(data);
                    } else {
                        alert("JSON data must be an array of standard data");
                    }
                }
                catch (err) {
                    alert("Invalid JSON format");
                }
            };
            reader.readAsText(file);
        } else {
            alert("Require JSON File");
        }
    };

    const checkPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);

        if (!value || value < minPrice || value > maxPrice) {
            setPriceWarning(true);
        }
        else {
            setPriceWarning(false);
        }
        setPrice(value);
    }

    const handleMultiCheckbox = (idx: number) => {
        setSelectSamplingPointIdx(prev =>
            prev.includes(idx)
                ? prev.filter(i => i !== idx)
                : [...prev, idx]
        );
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;

            const isClickInsideCalendar = CalendarBox.current?.contains(target);
            const isClickInsideInput = DatetimeInputRef.current?.contains(target);
            const isDayPickerElement = target.closest('.rdp');

            if (!isClickInsideCalendar && !isClickInsideInput && !isDayPickerElement) {
                setShowCalendar(false);
            }

            const isClickInsideStandardList = standardCombobox.current?.contains(target);
            const isClickOnStandardTrigger = target.closest('.standard-trigger');

            if (!isClickInsideStandardList && !isClickOnStandardTrigger) {
                setShowStandard(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const sortSamplingPointIdx = [...selectSamplingPointIdx].sort((a, b) => a - b)
        const samplingPointNames = sortSamplingPointIdx.map(idx => SamplingPoints[idx].name);

        const payload = {
            name: name,                            
            createDate: new Date().toISOString(),   
            imageLink: "https://easyrice-es-trade-data.s3.ap-southeast-1.amazonaws.com/example-rice.webp",                          
            inspectionID: "",                      
            standardID: "",              
            note: note,
            standardName: selectStandard,         
            samplingDate: selectSamplingDatetime,  
            samplingPoint: samplingPointNames,    
            price: Number(price),                  
            standardData: jsonData,              
        };

        if (payload.standardData.length === 0) {
            alert("Please upload a JSON file (Standard Data is required)");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/history', payload)

            if (response.status === 200 || response.status === 201) {
                alert("Create Inspection Success!");
                navigate('/');
            } else {
                alert("Submit failed!");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Server error!");
        }
    };

    return (
        <div className='w-full h-full flex-1 flex flex-col items-center justify-center gap-4'>
            <p className='text-3xl font-semibold'>Create Inspection</p>

            <form onSubmit={handleSubmit} className='w-full max-w-md rounded-lg p-4 shadow-[0_0_10px_-4px_black]'>
                <div className='flex flex-col gap-3'>
                    {/* Name */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="name">Name*</label>
                        <input
                            id='name'
                            type="text"
                            placeholder='input name...'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className='w-full h-8 border-gray-400 border-1 rounded-md p-2'
                        />
                    </div>

                    {/* Standard combobox */}
                    <div className='relative flex flex-col gap-1'>
                        <label htmlFor="standard">Standard*</label>

                        <div onClick={() => setShowStandard(!showStandard)} className='standard-trigger relative cursor-pointer'>
                            <div
                                id="standard"
                                className={`${selectStandard !== "" ? "text-black" : "text-gray-400"} 
                                w-full h-8 flex items-center border-gray-400 border-1 rounded-md p-2`}
                            >
                                {selectStandard !== "" ? (
                                    <span>{selectStandard}</span>
                                ) : "Select standard"}
                            </div>

                            <div className='absolute bottom-1 right-1'>
                                {showStandard ? (
                                    // Arrow down
                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><path fill="none" stroke="#8a8a8a" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m17 14l-5-5l-5 5"></path></svg>
                                ) : (
                                    // Arrow up
                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><path fill="none" stroke="#8a8a8a" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m7 10l5 5m0 0l5-5"></path></svg>
                                )}
                            </div>
                        </div>

                        {showStandard && (
                            <div
                                ref={standardCombobox}
                                className='absolute left-0 top-[100%] max-h-40 w-full overflow-y-auto bg-white border border-gray-200 rounded-md shadow-xl z-50'
                            >
                                {standardname.length > 0 ? (
                                    standardname.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(item.name);
                                            }}
                                            className='px-4 py-2 hover:bg-red-50 cursor-pointer text-gray-700 border-b border-gray-50 last:border-none'
                                        >
                                            {item.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className='px-4 py-2 text-gray-400 text-sm'>No results found</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* JSON file upload */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="UploadFile">Upload File</label>
                        <div
                            id='UploadFile'
                            className="relative w-full h-8 flex items-center border-1 border-gray-400 rounded-lg px-2 cursor-pointer"
                            onClick={() => document.getElementById('hidden-input')?.click()}
                        >
                            <p className={`${fileName !== "" ? "text-black" : "text-gray-400"}`}>
                                {fileName || "Select JSON file"}
                            </p>

                            <input
                                id="hidden-input"
                                type="file"
                                className="hidden"
                                accept=".json"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) processFile(file);
                                }}
                            />

                            <div className='absolute bottom-1 right-1'>
                                {/* File Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><g fill="none" fillRule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path><path fill="#8a8a8a" d="M12 2v6.5a1.5 1.5 0 0 0 1.356 1.493L13.5 10H20v10a2 2 0 0 1-1.85 1.995L18 22H6a2 2 0 0 1-1.995-1.85L4 20V4a2 2 0 0 1 1.85-1.995L6 2zm0 9.5a1 1 0 0 0-.993.883L11 12.5V14H9.5a1 1 0 0 0-.117 1.993L9.5 16H11v1.5a1 1 0 0 0 1.993.117L13 17.5V16h1.5a1 1 0 0 0 .117-1.993L14.5 14H13v-1.5a1 1 0 0 0-1-1m2-9.457a2 2 0 0 1 .877.43l.123.113L19.414 7a2 2 0 0 1 .502.84l.04.16H14z"></path></g></svg>
                            </div>
                        </div>
                    </div>

                    {/* Note */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="Note">Note</label>
                        <input
                            id='Note'
                            type="text"
                            placeholder='input name...'
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className='w-full h-8 border-gray-400 border-1 rounded-md p-2'
                        />
                    </div>

                    {/* Price */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="Price">Price</label>
                        <input
                            id='Price'
                            type="number"
                            placeholder='Input price'
                            value={price}
                            onChange={(e) => checkPriceInput(e)}
                            className='w-full h-8 border-gray-400 border-1 rounded-md p-2'
                        />
                        {priceWarning ? (
                            <p className='text-xs text-red-500'>*price should be 0-100,000</p>
                        ) : null}
                    </div>

                    {/* Sampling checkbox */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="SamplingPoint">Sampling Point</label>
                        <div
                            id='SamplingPoint'
                            className='flex items-center justify-between'
                        >
                            {SamplingPoints.map((data, idx) => (
                                <div key={data.id} className='flex items-center gap-2'>
                                    <button
                                        type='button'
                                        onClick={() => handleMultiCheckbox(idx)}
                                        className={`w-4 h-4 border-1 border-[#1F7B44] rounded-sm hover:bg-[#1F7B44] transition-all duration-300
                                            ${selectSamplingPointIdx.includes(idx) ? "bg-[#1F7B44]" : "bg-white"}`}
                                    >

                                    </button>

                                    <p>{data.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sampling datetime */}
                    <div className='relative flex flex-col gap-1'>
                        <label htmlFor="DatetimeSampling">Date/Time of Sampling</label>
                        <div
                            ref={DatetimeInputRef}
                            className="relative w-full h-8 flex items-center border-1 border-gray-400 rounded-lg px-2 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowCalendar(!showCalendar);
                            }}
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
                            <div
                                ref={CalendarBox}
                                className='absolute right-0 bottom-[60%] flex flex-col items-center p-4
                                bg-white border border-gray-200 rounded-lg shadow-xl z-50'
                            >
                                <DayPicker
                                    mode="single"
                                    captionLayout="dropdown"
                                    selected={selectDate}
                                    disabled={{ after: new Date() }}
                                    onSelect={(date) => {
                                        if (date) {
                                            setSelectDate(date);
                                            const [h, m, s] = selectTime.split(':').map(Number);
                                            date.setHours(h, m, s);
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

                                <button
                                    type="button"
                                    onClick={() => setShowCalendar(false)}
                                    className='w-full mt-4 bg-[#1F7B44] text-white py-2 rounded-lg hover:opacity-90'
                                >
                                    Confirm
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className='flex justify-end gap-4'>
                        <button
                            type='button'
                            onClick={() => navigate(-1)}
                            className='w-24 h-9 rounded-lg bg-white border-1 border-[#1F7B44] cursor-pointer hover:scale-105'
                        >
                            <span className='text-[#1F7B44]'>Cancel</span>
                        </button>
                        <button className='w-24 h-9 rounded-lg bg-[#1F7B44] cursor-pointer hover:scale-105'>
                            <span className='text-white'>Submit</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default CreateInspection
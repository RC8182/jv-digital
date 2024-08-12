import React from 'react';

export const Portada = () => {
    return (
        <div className="flex flex-col z-10 bg-blue-900 text-white p-6 custom-rounded-corner shadow-lg md:flex-row items-center">
            <div className="flex flex-col md:flex-row items-center md:w-1/2 md:mt-48">
                <div className="flex flex-col text-left">
                    <div className="flex items-center m-4">
                        <h1 className="text-4xl font-bold">DIGITAL MARKETING EXPERT</h1>
                    </div>
                    <p className="text-lg">Professional Business Marketing Expert</p>
                    <div className='flex justify-center mt-4'>
                        <button className="px-6 py-2 bg-white text-blue-900 rounded-full hover:bg-gray-200">JOIN US NOW!</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Portada;



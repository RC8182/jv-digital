import ProgressSlider from "./progress-slider";

export const Slaider = ({sliderList}) => {

  return (
    <div className={`flex justify-center `}>
      <div className="justify-center min-w-[300px] text-[rgb(0,59,112)]">
        <div className="flex flex-col items-center text-4xl text-blue-500 ">
          <div className="relative max-w-full overflow-hidden"> 
            <ProgressSlider list={sliderList}/> 
          </div>
        </div>
      </div>
    </div>
  );
};

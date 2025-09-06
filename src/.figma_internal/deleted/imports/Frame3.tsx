import svgPaths from "./svg-pv7de5tdf2";

function Group1() {
  return (
    <div className="[grid-area:1_/_1] h-[243.052px] ml-[80.5px] mt-0 relative w-[381.891px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 382 244">
        <g id="Group 1">
          <path d={svgPaths.p9714a80} fill="var(--fill-0, #B26C26)" id="Vector 8" />
          <g id="Vector 6">
            <path d={svgPaths.p3e910600} fill="var(--fill-0, #B26C26)" />
            <path d={svgPaths.p29c0c8e0} fill="var(--fill-0, #B26C26)" />
            <path d={svgPaths.p24b0cb00} fill="var(--fill-0, #B26C26)" />
          </g>
          <g id="Vector 7">
            <path d={svgPaths.p348b9b40} fill="var(--fill-0, #EC4FAB)" />
            <path d={svgPaths.pdb9b800} fill="var(--fill-0, #EC4FAB)" />
          </g>
          <path d={svgPaths.p3a69c500} fill="var(--fill-0, #B26C26)" id="Vector 5" />
          <path d={svgPaths.p240b80} fill="var(--fill-0, #66BF4A)" id="Vector 4" />
          <path d={svgPaths.p1c772ac0} fill="var(--fill-0, #EE438D)" id="Vector 3" />
          <path d={svgPaths.p595d80} fill="var(--fill-0, #29A2E9)" id="Union" />
          <path d={svgPaths.p21833c00} fill="var(--fill-0, black)" id="Union_2" />
          <circle cx="48.3142" cy="106.587" fill="var(--fill-0, #EFAD4F)" id="Ellipse 7" r="7.5255" />
          <circle cx="110.103" cy="89.1591" fill="var(--fill-0, #EFAD4F)" id="Ellipse 8" r="7.5255" />
          <circle cx="159.216" cy="123.222" fill="var(--fill-0, #EFAD4F)" id="Ellipse 9" r="7.5255" />
          <circle cx="222.589" cy="123.222" fill="var(--fill-0, #EFAD4F)" id="Ellipse 10" r="7.5255" />
          <circle cx="276.456" cy="86.7826" fill="var(--fill-0, #EFAD4F)" id="Ellipse 11" r="7.5255" />
          <circle cx="337.452" cy="105.002" fill="var(--fill-0, #EFAD4F)" id="Ellipse 12" r="7.5255" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-2.5 h-[154px] items-center justify-center ml-0 mt-[198px] px-8 py-0 relative rounded-[999px] w-[542px]">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-black text-nowrap tracking-[-6.44px]">
        <p className="font-['Baloo_Bhaina:Regular',_sans-serif] leading-[2.018] text-[92px] whitespace-pre">
          <span className="text-[#ee438d]">Meu</span>
          <span className="text-[#b26c26]"> </span>
          <span className="text-[#29a2e9]">Ben</span>
          <span className="text-[#66bf4a]">tin</span>
        </p>
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-center relative shrink-0">
      <Group1 />
      <Frame1 />
    </div>
  );
}

export default function Frame3() {
  return (
    <div className="bg-transparent content-stretch flex flex-col gap-2.5 items-center justify-center relative size-full scale-75 sm:scale-90 lg:scale-100">
      <Group2 />
    </div>
  );
}
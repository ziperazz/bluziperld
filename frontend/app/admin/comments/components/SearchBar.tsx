"use client"

export default function SearchBar({value,onChange}){

return(

<input
value={value}
onChange={(e)=>onChange(e.target.value)}
placeholder="جستجو در کامنت‌ها..."
className="w-full bg-[#0f172a] border border-[#1f2937] rounded-xl px-4 py-2 text-sm"
/>

)

}

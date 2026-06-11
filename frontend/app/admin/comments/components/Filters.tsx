"use client"

export default function Filters({value,onChange}){

return(

<div className="flex gap-2">

<button
onClick={()=>onChange("pending")}
className={`px-4 py-2 rounded-lg text-sm ${
value==="pending" ? "bg-blue-600" : "bg-[#1f2937]"
}`}
>
در انتظار
</button>

<button
onClick={()=>onChange("approved")}
className={`px-4 py-2 rounded-lg text-sm ${
value==="approved" ? "bg-blue-600" : "bg-[#1f2937]"
}`}
>
تایید شده
</button>

</div>

)

}

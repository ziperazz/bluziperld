"use client"

import { useEffect, useState } from "react"

const api =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000"


export default function AdminComments() {

  const [comments,setComments] = useState([])

  useEffect(()=>{

    fetch(`${api}/api/comments/admin/pending`,{

      credentials:"include"
    })
      .then(res=>res.json())
      .then(data=>setComments(data))

  },[])

  const approve = async(id:string)=>{

    await fetch(
      `${api}/api/comments/admin/approve/${id}`,
      {
        method:"PATCH",
        credentials:"include"
      }
    )

    setComments(prev=>prev.filter((c:any)=>c._id!==id))
  }

  return (

    <div className="space-y-4">

      {comments.map((c:any)=>(
        <div
          key={c._id}
          className="p-4 border rounded"
        >

          <p>{c.content}</p>

          <button
            onClick={()=>approve(c._id)}
            className="mt-2 px-3 py-1 bg-green-600 rounded"
          >
            تایید
          </button>

        </div>
      ))}

    </div>

  )
}

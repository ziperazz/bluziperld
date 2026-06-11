const API = "http://localhost:5000/api/envelopes"

export const getEnvelopes = async () => {
  const res = await fetch(API)
  return res.json()
}

export const createEnvelope = async (formData: FormData, token: string) => {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  })

  return res.json()
}

export const updateEnvelope = async (id: string, data: any, token: string) => {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })

  return res.json()
}

export const deleteEnvelope = async (id: string, token: string) => {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return res.json()
}

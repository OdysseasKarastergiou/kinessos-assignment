'use client'
import * as React from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import type { Business } from '../types'

export default function BusinessManagement() {
  const [data, setData] = React.useState<Business[]>([])
  const [filteredData, setFilteredData] = React.useState<Business[]>([])
  const [showSearchPopover, setShowSearchPopover] = React.useState(false)
  const [searchType, setSearchType] = React.useState('')
  const router = useRouter()
  const { register, handleSubmit, reset } = useForm<Business>()
  const columnHelper = createColumnHelper<Business>()

  React.useEffect(() => {
    fetch('http://localhost:5000/businesses')
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setFilteredData(data)
      })
  }, [])

  const onSubmit = (newBusiness: Business) => {
    if (newBusiness.id) {
      fetch(`http://localhost:5000/businesses/${newBusiness.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBusiness),
      })
        .then((res) => res.json())
        .then((updatedBusiness) => {
          setData((prevData) =>
            prevData.map((business) =>
              business.id === updatedBusiness.id ? updatedBusiness : business
            )
          )
        })
    } else {
      const nextId = data.length ? Math.max(...data.map((b) => b.id)) + 1 : 1
      const businessWithId = { ...newBusiness, id: nextId }
      fetch('http://localhost:5000/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessWithId),
      })
        .then((res) => res.json())
        .then((addedBusiness) => {
          setData((prevData) => [...prevData, addedBusiness])
        })
    }
    reset()
  }

  const handleDelete = (id: number) => {
    fetch(`http://localhost:5000/businesses/${id}`, { method: 'DELETE' })
      .then(() => setData((prevData) => prevData.filter((b) => b.id !== id)))
      .catch((err) => console.error('Error deleting business:', err))
  }

  const handleEdit = (id: number) => {
    router.push(`/pages/StaffManagement/${id}`)
  }

  const filterByType = () => {
    if (searchType === '') {
      setFilteredData(data)
    } else {
      setFilteredData(data.filter((business) => business.type === searchType))
    }
    setShowSearchPopover(false)
  }
  
  const columns = [
    columnHelper.accessor('name', {
      cell: (info) => info.getValue(),
      header: 'Name',
    }),
    columnHelper.accessor('id', {
      cell: (info) => <i>{info.getValue()}</i>,
      header: 'ID',
    }),
    columnHelper.accessor('location', {
      cell: (info) => info.getValue(),
      header: 'Location',
    }),
    columnHelper.accessor('type', {
      cell: (info) => info.getValue(),
      header: 'Type',
    }),
    columnHelper.display({
      id: 'edit',
      header: 'Edit',
      cell: (info) => (
        <button 
          onClick={() => handleEdit(info.row.original.id)} 
          className="border p-2 hover:bg-red-500"
        >
          Edit
        </button>
      ),
    }),
    columnHelper.display({
      id: 'delete',
      header: 'Delete',
      cell: (info) => (
        <button 
          onClick={() => handleDelete(info.row.original.id)} 
          className="border p-2 bg-red-500 hover:bg-red-600 text-white rounded"
        >
          Delete
        </button>
      ),
    }),
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="p-2">
      <h2 className="font-bold mb-6">Business Management</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="business-form border rounded p-1 mb-4">
        <p className="font-bold flex underline">Add a business</p>
        <div className="flex items-center justify-between">
          <label className="mr-4" htmlFor="name">Business Name:</label>
          <input
            className="border rounded p-1 mb-2"
            id="name"
            {...register('name', { required: true })}
            placeholder="Enter business name"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="mr-4" htmlFor="location">Location:</label>
          <input
            className="border rounded p-1"
            id="location"
            {...register('location', { required: true })}
            placeholder="Enter location"
          />
        </div>
        <div className="flex mt-2 items-center justify-between">
          <label className="mr-4" htmlFor="type">Type:</label>
          <select
            className="border rounded p-1"
            id="type"
            {...register('type', { required: true })}
          >
            <option value="">Select Type</option>
            <option value="bar">Bar</option>
            <option value="restaurant">Restaurant</option>
            <option value="club">Club</option>
            <option value="hotel">Hotel</option>
            <option value="cafe">Cafe</option>
          </select>
        </div>
        <button className="border p-2 mt-2 bg-red-500 hover:bg-red-600 text-white rounded" type="submit">Submit</button>
        <button
          type="button"
          onClick={() => setShowSearchPopover(prev => !prev)}
          className="border p-2 mt-2 ml-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Search
        </button>
      </form>
      {showSearchPopover && (
        <div className="absolute p-4 bg-indigo-500 shadow-lg border rounded mt-2 w-full max-w-xs z-10">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="border bg-white p-2 rounded w-full"
          >
            <option value="">All</option>
            <option value="bar">Bar</option>
            <option value="restaurant">Restaurant</option>
            <option value="club">Club</option>
            <option value="hotel">Hotel</option>
            <option value="cafe">Cafe</option>
          </select>
          <button
            onClick={filterByType}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-2 w-full"
          >
            Apply Filter
          </button>
          <button
            onClick={() => setShowSearchPopover(false)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mt-2 w-full"
          >
            Close
          </button>
        </div>
      )}

      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th className="border px-2 py-1 text-left" key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td className="border px-2 py-1 text-left" key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

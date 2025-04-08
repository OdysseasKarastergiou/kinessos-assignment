'use client'
import * as React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table'
import { useForm } from 'react-hook-form'
import LogoutButton from '@/app/components/LogoutButton'
import type { Staff, Props } from '../../../types'

export default function StaffManagement({ params }: Props) {
  const id = params.id

  const [staff, setStaff] = React.useState<Staff[]>([])
  const [businessName, setBusinessName] = React.useState('')
  const { register, handleSubmit, reset } = useForm<Staff>()
  const [nextId, setNextId] = React.useState(1)
  const [searchLastName, setSearchLastName] = React.useState('')
  const [filteredStaff, setFilteredStaff] = React.useState<Staff[]>([])
  const [showSearchPopover, setShowSearchPopover] = React.useState(false)

  React.useEffect(() => {
    if (!id) return
    fetch(`http://localhost:5000/businesses/${id}`)
      .then((res) => res.json())
      .then((data) => setBusinessName(data.name))
  }, [id])

  React.useEffect(() => {
    if (!id) return
    fetch('http://localhost:5000/staff')
      .then((res) => res.json())
      .then((data) => {
        const staffList = data[id as string] || []
        setStaff(staffList)
        const maxId = staffList.length > 0 ? Math.max(...staffList.map((s: Staff) => s.id)) : 0
        setNextId(maxId + 1)
        setFilteredStaff(staffList)
      })
  }, [id])

  const filterByLastName = () => {
    if (searchLastName === '') {
      setFilteredStaff(staff)
    } else {
      setFilteredStaff(staff.filter((s) => s.lastName.toLowerCase().includes(searchLastName.toLowerCase())))
    }
    setShowSearchPopover(false)
  }

  const onSubmit = (formData: Staff) => {
    const newStaff = { ...formData, id: nextId, businessId: Number(id) }
    const updatedStaff = [...staff, newStaff]

    fetch(`http://localhost:5000/staff`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [id as string]: updatedStaff }),
    }).then(() => {
      setStaff(updatedStaff)
      setNextId(nextId + 1)
      reset()
    })
  }

  const handleDelete = (staffId: number) => {
    const updatedStaff = staff.filter((s) => s.id !== staffId)

    fetch(`http://localhost:5000/staff`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [id as string]: updatedStaff }),
    }).then(() => {
      setStaff(updatedStaff)
    })
  }

  const columnHelper = createColumnHelper<Staff>()
  const table = useReactTable({
    data: filteredStaff,
    columns: [
      columnHelper.accessor('id', { header: 'ID', cell: (info) => info.getValue() }),
      columnHelper.accessor('firstName', { header: 'First Name', cell: (info) => info.getValue() }),
      columnHelper.accessor('lastName', { header: 'Last Name', cell: (info) => info.getValue() }),
      columnHelper.accessor('position', { header: 'Position', cell: (info) => info.getValue() }),
      columnHelper.accessor('email', { header: 'Email', cell: (info) => info.getValue() }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <button onClick={() => handleDelete(info.row.original.id)} className="border px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded">
            Delete
          </button>
        ),
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex items-center justify-center min-h-screen text-indigo-500 p-8">
      <div className="min-w-80 sm:min-w-160 text-xs sm:text-lg text-indigo-600 max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="flex justify-center text-2xl font-bold mb-4">Staff of: {businessName}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 mb-4">
          <p className="font-bold">Add Staff</p>
          <div>
            <input {...register('firstName', { required: true })} placeholder="First Name" className="border p-2 rounded w-full" />
          </div>
          <div>
            <input {...register('lastName', { required: true })} placeholder="Last Name" className="border p-2 rounded w-full" />
          </div>
          <div>
            <input {...register('position', { required: true })} placeholder="Position" className="border p-2 rounded w-full" />
          </div>
          <div>
            <input {...register('email', { required: true })} placeholder="Email" className="border p-2 rounded w-full" />
          </div>
          <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Submit</button>
          <button
            type="button"
            onClick={() => setShowSearchPopover(prev => !prev)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded ml-2"
          >
            Search
          </button>
        </form>
        {showSearchPopover && (
          <div className="absolute p-4 bg-indigo-500 shadow-lg border rounded mt-2 w-full max-w-xs z-10">
            <input
              type="text"
              placeholder="Search by Last Name"
              value={searchLastName}
              onChange={(e) => setSearchLastName(e.target.value)}
              className="border bg-white p-2 rounded w-full"
            />
            <button
              onClick={filterByLastName}
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
        <table className="border mb-6 mt-4">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="border px-2 py-1 text-left">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="border px-2 py-1">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <LogoutButton />
      </div>
    </div>
  )
}

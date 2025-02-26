'use client'

import { useState } from "react"
import { Upload, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ImageUploadProps {
  value: {
    url: string
    color: {
      name: string
      hex: string
    }
  }[]
  onChange: (value: any[]) => void
  onRemove: (url: string) => void
}

export function ImageUpload({
  value,
  onChange,
  onRemove
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true)

      const file = event.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `product-images/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      onChange([...value, { 
        url: publicUrl, 
        color: {
          name: '',
          hex: ''
        }
      }])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {value.map((image, index) => (
          <div key={image.url} className="relative aspect-square">
            <Image
              src={image.url || "/placeholder.svg"}
              alt="Product image"
              className="object-cover rounded-lg"
              fill
            />
            <button
              type="button"
              onClick={() => onRemove(image.url)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-2 right-2 space-y-2">
              <Input
                type="text"
                placeholder="Nombre del color"
                value={image.color.name}
                onChange={(e) => {
                  const newImages = [...value]
                  newImages[index].color.name = e.target.value
                  onChange(newImages)
                }}
                className="bg-white/80"
              />
              <Input
                type="color"
                value={image.color.hex}
                onChange={(e) => {
                  const newImages = [...value]
                  newImages[index].color.hex = e.target.value
                  onChange(newImages)
                }}
                className="h-8 bg-white/80"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="secondary"
          disabled={loading}
          className="relative"
        >
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="h-4 w-4 mr-2" />
          Subir Imagen
        </Button>
      </div>
    </div>
  )
}